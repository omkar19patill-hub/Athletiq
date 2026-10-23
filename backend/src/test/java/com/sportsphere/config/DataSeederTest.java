package com.sportsphere.config;

import com.sportsphere.entity.*;
import com.sportsphere.entity.enums.SlotStatus;
import com.sportsphere.repository.*;
import com.sportsphere.util.BookingNumberGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.annotation.Profile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Runs the seeder against mocked repositories only — no database. */
class DataSeederTest {

    private final UserRepository users = mock(UserRepository.class);
    private final VenueRepository venues = mock(VenueRepository.class);
    private final CourtRepository courts = mock(CourtRepository.class);
    private final SlotRepository slots = mock(SlotRepository.class);
    private final ReviewRepository reviews = mock(ReviewRepository.class);
    private final BookingRepository bookings = mock(BookingRepository.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);

    private final DataSeeder seeder = new DataSeeder(users, venues, courts, slots, reviews, bookings,
            encoder, new BookingNumberGenerator());

    // Dummy values for tests only; real demo passwords come from the environment
    private static final String TEST_ADMIN_PW = "test-admin-pw";
    private static final String TEST_CUSTOMER_PW = "test-customer-pw";

    @BeforeEach
    void setPasswords() {
        ReflectionTestUtils.setField(seeder, "demoAdminPassword", TEST_ADMIN_PW);
        ReflectionTestUtils.setField(seeder, "demoCustomerPassword", TEST_CUSTOMER_PW);
    }

    @Test
    void onlyActiveInDevProfile() {
        Profile profile = DataSeeder.class.getAnnotation(Profile.class);
        assertNotNull(profile, "DataSeeder must be profile-restricted");
        assertArrayEquals(new String[]{"dev"}, profile.value());
    }

    @Test
    void missingOrShortPasswordsSkipAllSeeding() {
        when(users.count()).thenReturn(0L);
        for (String[] pw : new String[][]{{null, TEST_CUSTOMER_PW}, {TEST_ADMIN_PW, ""}, {"short", TEST_CUSTOMER_PW}, {"   ", "   "}}) {
            ReflectionTestUtils.setField(seeder, "demoAdminPassword", pw[0]);
            ReflectionTestUtils.setField(seeder, "demoCustomerPassword", pw[1]);
            seeder.run();
        }
        verify(users, never()).save(any());
        verifyNoInteractions(venues, courts, slots, bookings, reviews, encoder);
    }

    @Test
    void skipsWhenDatabaseAlreadyHasUsers() {
        when(users.count()).thenReturn(1L);
        seeder.run();
        verify(users, never()).save(any());
        verifyNoInteractions(venues, courts, slots, bookings);
    }

    @Test
    void emptyDatabaseGetsAWeekOfFutureSlotsAndAFutureSampleBooking() {
        AtomicLong ids = new AtomicLong();
        List<Slot> saved = new ArrayList<>();
        when(users.count()).thenReturn(0L);
        when(encoder.encode(anyString())).thenReturn("encoded");
        when(users.save(any())).thenAnswer(i -> { User u = i.getArgument(0); u.setId(ids.incrementAndGet()); return u; });
        when(venues.save(any())).thenAnswer(i -> { Venue v = i.getArgument(0); v.setId(ids.incrementAndGet()); return v; });
        when(courts.save(any())).thenAnswer(i -> { Court c = i.getArgument(0); c.setId(ids.incrementAndGet()); return c; });
        when(slots.save(any())).thenAnswer(i -> {
            Slot s = i.getArgument(0);
            if (s.getId() == null) { s.setId(ids.incrementAndGet()); saved.add(s); }
            return s;
        });
        when(slots.findByCourtIdAndBookingDateOrderByStartTime(anyLong(), any())).thenAnswer(i -> saved.stream()
                .filter(s -> s.getCourt().getId().equals(i.getArgument(0)) && s.getBookingDate().equals(i.getArgument(1)))
                .sorted(Comparator.comparing(Slot::getStartTime)).toList());

        seeder.run();

        // Passwords come from the configured values, never from literals
        verify(encoder).encode(TEST_ADMIN_PW);
        verify(encoder).encode(TEST_CUSTOMER_PW);

        LocalDateTime now = LocalDateTime.now();
        assertFalse(saved.isEmpty());
        assertTrue(saved.stream().allMatch(s -> LocalDateTime.of(s.getBookingDate(), s.getStartTime()).isAfter(now)),
                "no seeded slot may start in the past");
        assertTrue(saved.stream().anyMatch(s -> s.getBookingDate().equals(LocalDate.now().plusDays(6))),
                "slots cover the next 7 days");
        // 3 courts x 8 slots x 6 full future days, plus whatever is left of today
        assertTrue(saved.size() >= 3 * 8 * 6);
        assertTrue(saved.stream().anyMatch(s -> s.getSlotStatus() == SlotStatus.AVAILABLE));

        ArgumentCaptor<Booking> booking = ArgumentCaptor.forClass(Booking.class);
        verify(bookings).save(booking.capture());
        Slot bookedSlot = booking.getValue().getSlot();
        assertEquals(SlotStatus.BOOKED, bookedSlot.getSlotStatus());
        assertTrue(LocalDateTime.of(bookedSlot.getBookingDate(), bookedSlot.getStartTime()).isAfter(now));
    }
}
