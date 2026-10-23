package com.sportsphere.service.impl;

import com.sportsphere.dto.request.booking.CreateBookingRequest;
import com.sportsphere.entity.*;
import com.sportsphere.entity.enums.*;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.repository.BookingRepository;
import com.sportsphere.repository.SlotRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.util.BookingNumberGenerator;
import com.sportsphere.util.RefundCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** D2: booking guards, duration pricing and cancellation lifecycle. No database. */
class BookingRulesTest {

    private final BookingRepository bookings = mock(BookingRepository.class);
    private final SlotRepository slots = mock(SlotRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final BookingServiceImpl service = new BookingServiceImpl(
            bookings, slots, users, new BookingNumberGenerator(), new RefundCalculator());

    private final User customer = User.builder().id(1L).email("c@x.com").firstName("C").lastName("L").role(Role.CUSTOMER).build();
    private Venue venue;
    private Court court;
    private Slot slot;

    @BeforeEach
    void setUp() {
        venue = Venue.builder().id(10L).name("V").city("C").build();
        court = Court.builder().id(20L).venue(venue).courtName("Ct").pricePerHour(new BigDecimal("1200.00")).build();
        slot = slotAt(LocalDateTime.now().plusDays(2).withHour(18).withMinute(0).withSecond(0).withNano(0), 60);
        when(users.findByEmail("c@x.com")).thenReturn(Optional.of(customer));
        when(slots.findByIdWithLock(30L)).thenAnswer(inv -> Optional.of(slot));
        when(bookings.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private Slot slotAt(LocalDateTime start, int minutes) {
        return Slot.builder().id(30L).court(court).bookingDate(start.toLocalDate())
                .startTime(start.toLocalTime()).endTime(start.toLocalTime().plusMinutes(minutes)).build();
    }

    private BigDecimal book() {
        CreateBookingRequest r = new CreateBookingRequest();
        r.setSlotId(30L);
        return service.createBooking("c@x.com", r).getTotalAmount();
    }

    // ---- 1. past slots ----

    @Test
    void slotThatAlreadyStartedCannotBeBooked() {
        slot = slotAt(LocalDateTime.now().minusMinutes(1), 60);
        assertThrows(BusinessException.class, this::book);
        slot = slotAt(LocalDateTime.now().minusDays(1), 60);
        assertThrows(BusinessException.class, this::book);
        assertEquals(SlotStatus.AVAILABLE, slot.getSlotStatus());
        verify(bookings, never()).save(any());
    }

    @Test
    void futureSlotCanBeBooked() {
        assertNotNull(book());
        assertEquals(SlotStatus.BOOKED, slot.getSlotStatus());
    }

    // ---- 2. inactive court / venue ----

    @Test
    void inactiveOrMaintenanceCourtCannotBeBooked() {
        for (CourtStatus s : new CourtStatus[]{CourtStatus.INACTIVE, CourtStatus.MAINTENANCE}) {
            court.setStatus(s);
            assertThrows(BusinessException.class, this::book, s.name());
        }
        verify(bookings, never()).save(any());
    }

    @Test
    void inactiveOrMaintenanceVenueCannotBeBooked() {
        for (VenueStatus s : new VenueStatus[]{VenueStatus.INACTIVE, VenueStatus.UNDER_MAINTENANCE}) {
            venue.setStatus(s);
            assertThrows(BusinessException.class, this::book, s.name());
        }
        verify(bookings, never()).save(any());
    }

    // ---- 3. duration pricing ----

    @Test
    void priceScalesWithSlotLength() {
        assertEquals(new BigDecimal("1200.00"), book()); // 60 min
        slot = slotAt(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0), 120);
        assertEquals(new BigDecimal("2400.00"), book());
    }

    @Test
    void calculatePriceRoundsHalfUp() {
        LocalTime t = LocalTime.of(10, 0);
        assertEquals(new BigDecimal("750.00"), BookingServiceImpl.calculatePrice(new BigDecimal("500"), t, t.plusMinutes(90)));
        assertEquals(new BigDecimal("125.00"), BookingServiceImpl.calculatePrice(new BigDecimal("500"), t, t.plusMinutes(15)));
        assertEquals(new BigDecimal("333.33"), BookingServiceImpl.calculatePrice(new BigDecimal("999.99"), t, t.plusMinutes(20)));
        assertThrows(BusinessException.class, () -> BookingServiceImpl.calculatePrice(BigDecimal.TEN, t, t));
    }

    // ---- 4. cancellation lifecycle ----

    private Booking existing(BookingStatus status, Slot s) {
        s.setSlotStatus(SlotStatus.BOOKED);
        Booking b = Booking.builder().id(50L).bookingNumber("BK1").customer(customer).slot(s)
                .bookingStatus(status).paymentStatus(PaymentStatus.PAID).totalAmount(new BigDecimal("1200.00")).build();
        when(bookings.findById(50L)).thenReturn(Optional.of(b));
        return b;
    }

    @Test
    void completedOrNoShowBookingsCannotBeCancelled() {
        for (BookingStatus st : new BookingStatus[]{BookingStatus.COMPLETED, BookingStatus.NO_SHOW}) {
            Booking b = existing(st, slotAt(LocalDateTime.now().minusDays(1), 60));
            assertThrows(BusinessException.class, () -> service.cancelBooking("c@x.com", 50L, null));
            assertEquals(st, b.getBookingStatus());
            assertEquals(PaymentStatus.PAID, b.getPaymentStatus());
            assertEquals(SlotStatus.BOOKED, b.getSlot().getSlotStatus());
        }
        verify(bookings, never()).save(any());
    }

    @Test
    void cancellingFutureSlotReopensIt() {
        Booking b = existing(BookingStatus.CONFIRMED, slot);
        service.cancelBooking("c@x.com", 50L, null);
        assertEquals(BookingStatus.CANCELLED, b.getBookingStatus());
        assertEquals(SlotStatus.AVAILABLE, slot.getSlotStatus());
        // Refund policy unchanged: >24h ahead -> full refund
        assertEquals(0, b.getRefundAmount().compareTo(new BigDecimal("1200.00")));
    }

    @Test
    void cancellingStartedSlotKeepsItClosed() {
        Slot started = slotAt(LocalDateTime.now().minusMinutes(30), 60);
        Booking b = existing(BookingStatus.CONFIRMED, started);
        service.cancelBooking("c@x.com", 50L, null);
        assertEquals(BookingStatus.CANCELLED, b.getBookingStatus());
        assertEquals(SlotStatus.BOOKED, started.getSlotStatus(), "past slot must not become bookable");
        assertEquals(0, b.getRefundAmount().signum(), "refund policy unchanged: no refund after start");
        verify(slots, never()).save(started);
    }

    @Test
    void pendingBookingCanBeCancelled() {
        Booking b = existing(BookingStatus.PENDING, slot);
        service.cancelBooking("c@x.com", 50L, null);
        assertEquals(BookingStatus.CANCELLED, b.getBookingStatus());
    }
}
