package com.sportsphere.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsphere.dto.request.bookingrequirement.BookingRequirementRequest;
import com.sportsphere.entity.*;
import com.sportsphere.entity.enums.Occasion;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.repository.*;
import com.sportsphere.util.BookingNumberGenerator;
import com.sportsphere.util.RefundCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Ownership rules: owner or ADMIN may access a booking; other customers get 403. */
class BookingAccessTest {

    private final BookingRepository bookings = mock(BookingRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final BookingRequirementRepository requirements = mock(BookingRequirementRepository.class);

    private final BookingServiceImpl bookingService = new BookingServiceImpl(
            bookings, mock(SlotRepository.class), users, new BookingNumberGenerator(), new RefundCalculator());
    private final BookingRequirementServiceImpl requirementService = new BookingRequirementServiceImpl(
            requirements, bookings, users, new ObjectMapper());

    private final User owner = user(1L, "owner@x.com", Role.CUSTOMER);
    private final User other = user(2L, "other@x.com", Role.CUSTOMER);
    private final User admin = user(3L, "admin@x.com", Role.ADMIN);
    private Booking booking;

    private static User user(Long id, String email, Role role) {
        return User.builder().id(id).email(email).firstName("F").lastName("L").role(role).build();
    }

    @BeforeEach
    void setUp() {
        Venue venue = Venue.builder().id(10L).name("V").city("C").build();
        Court court = Court.builder().id(20L).venue(venue).courtName("Ct").pricePerHour(BigDecimal.TEN).build();
        Slot slot = Slot.builder().id(30L).court(court).bookingDate(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(11, 0)).build();
        booking = Booking.builder().id(40L).bookingNumber("BK1").customer(owner).slot(slot)
                .totalAmount(BigDecimal.TEN).build();

        for (User u : new User[]{owner, other, admin}) {
            when(users.findByEmail(u.getEmail())).thenReturn(Optional.of(u));
        }
        when(bookings.findById(40L)).thenReturn(Optional.of(booking));
        when(bookings.findByBookingNumber("BK1")).thenReturn(Optional.of(booking));
        when(requirements.findByBookingId(40L)).thenReturn(Optional.of(BookingRequirement.builder().booking(booking).build()));
        when(requirements.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void ownerCanReadOwnBooking() {
        assertEquals(40L, bookingService.getBookingById("owner@x.com", 40L).getId());
        assertEquals("BK1", bookingService.getBookingByNumber("owner@x.com", "BK1").getBookingNumber());
    }

    @Test
    void adminCanReadAnyBooking() {
        assertEquals(40L, bookingService.getBookingById("admin@x.com", 40L).getId());
        assertEquals("BK1", bookingService.getBookingByNumber("admin@x.com", "BK1").getBookingNumber());
    }

    @Test
    void otherCustomerCannotReadBooking() {
        assertThrows(AccessDeniedException.class, () -> bookingService.getBookingById("other@x.com", 40L));
        assertThrows(AccessDeniedException.class, () -> bookingService.getBookingByNumber("other@x.com", "BK1"));
    }

    @Test
    void otherCustomerCannotCancelBooking() {
        assertThrows(AccessDeniedException.class, () -> bookingService.cancelBooking("other@x.com", 40L, null));
    }

    @Test
    void requirementsFollowSameRules() {
        assertNotNull(requirementService.getRequirementByBookingId("owner@x.com", 40L));
        assertNotNull(requirementService.getRequirementByBookingId("admin@x.com", 40L));
        assertThrows(AccessDeniedException.class,
                () -> requirementService.getRequirementByBookingId("other@x.com", 40L));
    }

    @Test
    void requirementResponseIsFlatAndHidesUserData() throws Exception {
        owner.setPassword("$2a$10$hash-that-must-not-leak");
        booking.setBookingRequirement(null);
        BookingRequirementRequest req = new BookingRequirementRequest();
        req.setBookingId(40L);
        req.setOccasion(Occasion.TOURNAMENT);
        req.setPlayersCount(10);
        req.setEquipmentRequired(java.util.List.of("Bibs", "Cones"));

        var res = requirementService.createOrUpdateRequirement("owner@x.com", req);
        assertEquals(40L, res.getBookingId());
        assertEquals(java.util.List.of("Bibs", "Cones"), res.getEquipmentRequired());
        assertEquals(java.util.List.of(), res.getPreparationRequired());

        // Same mapper settings Spring uses for dates/enums are irrelevant here; we only need it to serialize
        String json = new ObjectMapper().writeValueAsString(res);
        assertFalse(json.contains("password"));
        assertFalse(json.contains("hash-that-must-not-leak"));
        assertFalse(json.contains("customer"));
    }

    @Test
    void otherCustomerCannotWriteRequirements() {
        BookingRequirementRequest req = new BookingRequirementRequest();
        req.setBookingId(40L);
        req.setOccasion(Occasion.PRACTICE);
        req.setPlayersCount(2);

        assertThrows(AccessDeniedException.class,
                () -> requirementService.createOrUpdateRequirement("other@x.com", req));
        verify(requirements, never()).save(any());

        assertNotNull(requirementService.createOrUpdateRequirement("owner@x.com", req));
        assertNotNull(requirementService.createOrUpdateRequirement("admin@x.com", req));
    }
}
