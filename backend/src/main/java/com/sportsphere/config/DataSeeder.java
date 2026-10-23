package com.sportsphere.config;

import com.sportsphere.entity.*;
import com.sportsphere.entity.enums.*;
import com.sportsphere.repository.*;
import com.sportsphere.util.BookingNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Demo data for local development only. Active only with SPRING_PROFILES_ACTIVE=dev,
 * and only when DEMO_ADMIN_PASSWORD and DEMO_CUSTOMER_PASSWORD are set (no defaults).
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    static final int MIN_DEMO_PASSWORD_LENGTH = 8; // same minimum as RegisterRequest

    @Value("${DEMO_ADMIN_PASSWORD:}")
    private String demoAdminPassword;

    @Value("${DEMO_CUSTOMER_PASSWORD:}")
    private String demoCustomerPassword;

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final CourtRepository courtRepository;
    private final SlotRepository slotRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final BookingNumberGenerator bookingNumberGenerator;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data generation.");
            return;
        }
        // Skip everything (not just users) so a later run with passwords set still sees an empty DB
        if (!isUsable(demoAdminPassword) || !isUsable(demoCustomerPassword)) {
            log.warn("Demo seeding skipped: DEMO_ADMIN_PASSWORD and DEMO_CUSTOMER_PASSWORD must both be set "
                    + "(at least {} characters).", MIN_DEMO_PASSWORD_LENGTH);
            return;
        }

        log.info("Seeding initial data for SportSphere...");

        // 1. Create Default Admin
        User admin = User.builder()
                .firstName("SportSphere")
                .lastName("Admin")
                .email("admin@sportsphere.com")
                .password(passwordEncoder.encode(demoAdminPassword))
                .phone("9876543210")
                .role(Role.ADMIN)
                .build();
        admin = userRepository.save(admin);

        // 2. Create Default Customer
        User customer = User.builder()
                .firstName("Rahul")
                .lastName("Sharma")
                .email("customer@sportsphere.com")
                .password(passwordEncoder.encode(demoCustomerPassword))
                .phone("9123456789")
                .role(Role.CUSTOMER)
                .build();
        customer = userRepository.save(customer);

        // 3. Create Sample Venues
        Venue venue1 = Venue.builder()
                .name("Apex Turf & Sports Arena")
                .description("Premium multi-sport facility featuring FIFA-approved artificial turf, LED floodlights, air-conditioned dugouts, and refreshment cafe.")
                .address("12th Main Road, Indiranagar")
                .city("Bangalore")
                .state("Karnataka")
                .pincode("560038")
                .latitude(12.9716)
                .longitude(77.5946)
                .status(VenueStatus.ACTIVE)
                .build();

        venue1.getImages().addAll(List.of(
                VenueImage.builder().venue(venue1).imageUrl("https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200").isPrimary(true).build(),
                VenueImage.builder().venue(venue1).imageUrl("https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200").isPrimary(false).build()
        ));
        venue1 = venueRepository.save(venue1);

        Venue venue2 = Venue.builder()
                .name("Champions Badminton & Turf Park")
                .description("World-class indoor wooden floor badminton courts and outdoor box cricket grounds with international standard lighting.")
                .address("Bandra West, Link Road")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400050")
                .latitude(19.0596)
                .longitude(72.8295)
                .status(VenueStatus.ACTIVE)
                .build();

        venue2.getImages().addAll(List.of(
                VenueImage.builder().venue(venue2).imageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200").isPrimary(true).build()
        ));
        venue2 = venueRepository.save(venue2);

        Venue venue3 = Venue.builder()
                .name("Veloce Sports Hub")
                .description("Multi-sport complex with 7-a-side football, synthetic tennis courts, and professional coaching facilities.")
                .address("Sector 44, Golf Course Road")
                .city("Gurugram")
                .state("Haryana")
                .pincode("122003")
                .latitude(28.4595)
                .longitude(77.0266)
                .status(VenueStatus.ACTIVE)
                .build();

        venue3.getImages().addAll(List.of(
                VenueImage.builder().venue(venue3).imageUrl("https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200").isPrimary(true).build()
        ));
        venue3 = venueRepository.save(venue3);

        // 4. Create Courts
        Court court1 = Court.builder()
                .venue(venue1)
                .courtName("Ground Alpha (5v5 Football)")
                .sportType(SportType.FOOTBALL)
                .pricePerHour(new BigDecimal("1200.00"))
                .status(CourtStatus.ACTIVE)
                .build();
        court1 = courtRepository.save(court1);

        Court court2 = Court.builder()
                .venue(venue1)
                .courtName("Court 1 (Wooden Badminton)")
                .sportType(SportType.BADMINTON)
                .pricePerHour(new BigDecimal("500.00"))
                .status(CourtStatus.ACTIVE)
                .build();
        court2 = courtRepository.save(court2);

        Court court3 = Court.builder()
                .venue(venue2)
                .courtName("Box Cricket Arena A")
                .sportType(SportType.CRICKET)
                .pricePerHour(new BigDecimal("1500.00"))
                .status(CourtStatus.ACTIVE)
                .build();
        court3 = courtRepository.save(court3);

        // 5. Generate slots for the next 7 days (skipping hours already started today)
        // ponytail: seeded once on an empty DB; slots don't roll forward. Admins add more via bulk slot creation.
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        int currentHour = LocalTime.now().getHour();

        for (LocalDate date : today.datesUntil(today.plusDays(7)).toList()) {
            for (int hour = 6; hour <= 21; hour += 2) {
                if (date.equals(today) && hour <= currentHour) {
                    continue;
                }
                Slot slot1 = Slot.builder()
                        .court(court1)
                        .bookingDate(date)
                        .startTime(LocalTime.of(hour, 0))
                        .endTime(LocalTime.of(hour + 2, 0))
                        .slotStatus(SlotStatus.AVAILABLE)
                        .build();
                slotRepository.save(slot1);

                Slot slot2 = Slot.builder()
                        .court(court2)
                        .bookingDate(date)
                        .startTime(LocalTime.of(hour, 0))
                        .endTime(LocalTime.of(hour + 1, 0))
                        .slotStatus(SlotStatus.AVAILABLE)
                        .build();
                slotRepository.save(slot2);

                Slot slot3 = Slot.builder()
                        .court(court3)
                        .bookingDate(date)
                        .startTime(LocalTime.of(hour, 0))
                        .endTime(LocalTime.of(hour + 2, 0))
                        .slotStatus(SlotStatus.AVAILABLE)
                        .build();
                slotRepository.save(slot3);
            }
        }

        // 6. Add Reviews
        Review review1 = Review.builder()
                .customer(customer)
                .venue(venue1)
                .rating(5)
                .review("Top class football turf! Floodlights are bright and the synthetic grass is well maintained. Will book again!")
                .build();
        reviewRepository.save(review1);

        Review review2 = Review.builder()
                .customer(customer)
                .venue(venue2)
                .rating(4)
                .review("Great box cricket facility. Staff is polite and parking space is ample.")
                .build();
        reviewRepository.save(review2);

        // 7. Add Sample Booking
        Slot bookedSlot = slotRepository.findByCourtIdAndBookingDateOrderByStartTime(court1.getId(), tomorrow).get(0);
        bookedSlot.setSlotStatus(SlotStatus.BOOKED);
        slotRepository.save(bookedSlot);

        Booking sampleBooking = Booking.builder()
                .bookingNumber(bookingNumberGenerator.generate())
                .customer(customer)
                .slot(bookedSlot)
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .totalAmount(court1.getPricePerHour())
                .refundAmount(BigDecimal.ZERO)
                .build();
        bookingRepository.save(sampleBooking);

        log.info("Data seeding complete. Demo accounts: admin@sportsphere.com, customer@sportsphere.com (passwords are not logged).");
    }

    private static boolean isUsable(String password) {
        return password != null && password.strip().length() >= MIN_DEMO_PASSWORD_LENGTH;
    }
}
