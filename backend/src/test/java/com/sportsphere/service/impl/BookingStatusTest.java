package com.sportsphere.service.impl;

import com.sportsphere.entity.*;
import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.repository.BookingRepository;
import com.sportsphere.repository.SlotRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.util.BookingNumberGenerator;
import com.sportsphere.util.RefundCalculator;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class BookingStatusTest {

    private final BookingRepository bookings = mock(BookingRepository.class);
    private final BookingServiceImpl service = new BookingServiceImpl(
            bookings, mock(SlotRepository.class), mock(UserRepository.class),
            new BookingNumberGenerator(), new RefundCalculator());

    private Booking booking(BookingStatus status) {
        Venue v = Venue.builder().id(1L).name("V").city("C").build();
        Court c = Court.builder().id(2L).venue(v).courtName("Ct").pricePerHour(BigDecimal.ONE).build();
        Slot s = Slot.builder().id(3L).court(c).bookingDate(LocalDate.now())
                .startTime(LocalTime.NOON).endTime(LocalTime.NOON.plusHours(1)).build();
        User u = User.builder().id(4L).email("u@x.com").firstName("F").lastName("L").role(Role.CUSTOMER).build();
        Booking b = Booking.builder().id(5L).bookingNumber("BK").customer(u).slot(s)
                .bookingStatus(status).totalAmount(BigDecimal.ONE).build();
        when(bookings.findById(5L)).thenReturn(Optional.of(b));
        when(bookings.save(any())).thenAnswer(inv -> inv.getArgument(0));
        return b;
    }

    @Test
    void adminListFiltersByStatus() {
        Page<Booking> page = new PageImpl<>(List.of(booking(BookingStatus.CONFIRMED)));
        when(bookings.findByBookingStatus(eq(BookingStatus.CONFIRMED), any(Pageable.class))).thenReturn(page);

        assertEquals(1, service.getAllBookings(0, 10, "confirmed").getContent().size());
        verify(bookings).findByBookingStatus(eq(BookingStatus.CONFIRMED), any(Pageable.class));
        verify(bookings, never()).findAll(any(Pageable.class));
    }

    @Test
    void adminListWithoutFilterOrAllReturnsEverything() {
        when(bookings.findAll(any(Pageable.class))).thenReturn(Page.empty());
        service.getAllBookings(0, 10, null);
        service.getAllBookings(0, 10, "ALL");
        service.getAllBookings(0, 10, " ");
        verify(bookings, times(3)).findAll(any(Pageable.class));
        verify(bookings, never()).findByBookingStatus(any(), any());
    }

    @Test
    void unknownStatusFilterIs400Not500() {
        assertThrows(BusinessException.class, () -> service.getAllBookings(0, 10, "BOGUS"));
        assertThrows(BusinessException.class, () -> BookingServiceImpl.parseStatusFilter("pending!"));
    }

    @Test
    void allowedTransitions() {
        booking(BookingStatus.PENDING);
        assertEquals(BookingStatus.CONFIRMED, service.updateBookingStatus(5L, BookingStatus.CONFIRMED).getBookingStatus());
        booking(BookingStatus.CONFIRMED);
        assertEquals(BookingStatus.COMPLETED, service.updateBookingStatus(5L, BookingStatus.COMPLETED).getBookingStatus());
        booking(BookingStatus.CONFIRMED);
        assertEquals(BookingStatus.NO_SHOW, service.updateBookingStatus(5L, BookingStatus.NO_SHOW).getBookingStatus());
    }

    @Test
    void cancelledViaStatusEndpointIsRejected() {
        Booking b = booking(BookingStatus.CONFIRMED);
        assertThrows(BusinessException.class, () -> service.updateBookingStatus(5L, BookingStatus.CANCELLED));
        assertEquals(BookingStatus.CONFIRMED, b.getBookingStatus());
    }

    @Test
    void terminalStatusesCannotChange() {
        for (BookingStatus terminal : List.of(BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.NO_SHOW)) {
            Booking b = booking(terminal);
            assertThrows(BusinessException.class, () -> service.updateBookingStatus(5L, BookingStatus.CONFIRMED));
            assertEquals(terminal, b.getBookingStatus());
        }
        verify(bookings, never()).save(any());
    }
}
