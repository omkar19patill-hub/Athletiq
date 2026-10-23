package com.sportsphere.service.impl;

import com.sportsphere.dto.request.booking.CreateBookingRequest;
import com.sportsphere.dto.response.booking.BookingResponse;
import com.sportsphere.entity.*;
import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.entity.enums.SlotStatus;
import com.sportsphere.exception.DuplicateBookingException;
import com.sportsphere.repository.BookingRepository;
import com.sportsphere.repository.SlotRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.util.BookingNumberGenerator;
import com.sportsphere.util.RefundCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Create -> cancel -> rebook against an in-memory booking table (no database).
 * Real concurrency is guarded by the PESSIMISTIC_WRITE lock in SlotRepository.findByIdWithLock,
 * which needs a real database to exercise; here we verify the checks performed under that lock.
 */
class BookingLifecycleTest {

    private final List<Booking> table = new ArrayList<>();
    private final AtomicLong ids = new AtomicLong(100);

    private final BookingRepository bookings = mock(BookingRepository.class);
    private final SlotRepository slots = mock(SlotRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final BookingServiceImpl service = new BookingServiceImpl(
            bookings, slots, users, new BookingNumberGenerator(), new RefundCalculator());

    private final User alice = User.builder().id(1L).email("alice@x.com").firstName("A").lastName("L").role(Role.CUSTOMER).build();
    private final User bob = User.builder().id(2L).email("bob@x.com").firstName("B").lastName("L").role(Role.CUSTOMER).build();
    private Slot slot;

    @BeforeEach
    void setUp() {
        Venue venue = Venue.builder().id(10L).name("V").city("C").build();
        Court court = Court.builder().id(20L).venue(venue).courtName("Ct").pricePerHour(new BigDecimal("500.00")).build();
        slot = Slot.builder().id(30L).court(court).bookingDate(LocalDate.now().plusDays(3))
                .startTime(LocalTime.of(18, 0)).endTime(LocalTime.of(19, 0)).build();

        when(users.findByEmail("alice@x.com")).thenReturn(Optional.of(alice));
        when(users.findByEmail("bob@x.com")).thenReturn(Optional.of(bob));
        when(slots.findByIdWithLock(30L)).thenReturn(Optional.of(slot));
        when(bookings.save(any())).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            if (b.getId() == null) { b.setId(ids.incrementAndGet()); table.add(b); }
            return b;
        });
        when(bookings.findById(anyLong())).thenAnswer(inv ->
                table.stream().filter(b -> b.getId().equals(inv.getArgument(0))).findFirst());
        when(bookings.existsBySlotIdAndBookingStatusNot(anyLong(), any())).thenAnswer(inv ->
                table.stream().anyMatch(b -> b.getSlot().getId().equals(inv.getArgument(0))
                        && b.getBookingStatus() != inv.getArgument(1)));
    }

    private BookingResponse book(String email) {
        CreateBookingRequest req = new CreateBookingRequest();
        req.setSlotId(30L);
        return service.createBooking(email, req);
    }

    @Test
    void cancelledSlotCanBeBookedAgain() {
        BookingResponse first = book("alice@x.com");
        assertEquals(SlotStatus.BOOKED, slot.getSlotStatus());

        service.cancelBooking("alice@x.com", first.getId(), null);
        assertEquals(SlotStatus.AVAILABLE, slot.getSlotStatus());

        BookingResponse second = book("bob@x.com");
        assertNotEquals(first.getId(), second.getId());
        assertEquals(BookingStatus.CONFIRMED, second.getBookingStatus());
        assertEquals(SlotStatus.BOOKED, slot.getSlotStatus());
        // History is kept: the cancelled row still exists for the same slot
        assertEquals(2, table.size());
        assertEquals(BookingStatus.CANCELLED, table.get(0).getBookingStatus());
    }

    @Test
    void bookedSlotCannotBeBookedTwice() {
        book("alice@x.com");
        assertThrows(DuplicateBookingException.class, () -> book("bob@x.com"));
        assertThrows(DuplicateBookingException.class, () -> book("alice@x.com"));
        assertEquals(1, table.size());
    }

    @Test
    void activeBookingBlocksEvenIfSlotStatusWasResetToAvailable() {
        // e.g. an admin unblock/edit left the slot AVAILABLE while a confirmed booking still exists
        book("alice@x.com");
        slot.setSlotStatus(SlotStatus.AVAILABLE);
        assertThrows(DuplicateBookingException.class, () -> book("bob@x.com"));
        assertEquals(1, table.size());
    }

    @Test
    void blockedSlotCannotBeBooked() {
        slot.setSlotStatus(SlotStatus.BLOCKED);
        assertThrows(DuplicateBookingException.class, () -> book("alice@x.com"));
        verify(bookings, never()).save(any());
    }

    @Test
    void bookingUsesTheSlotRowLock() {
        book("alice@x.com");
        verify(slots).findByIdWithLock(30L);
        verify(slots, never()).findById(anyLong());
    }
}
