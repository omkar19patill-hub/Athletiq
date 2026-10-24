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
        if (venueRepository.count() < 10) {
            log.info("Seeding comprehensive multi-city venue network with authentic PIN codes...");
            seedAdditionalVenues();
        }

        ensureAthletiqUsersExist();

        if (userRepository.count() > 0) {
            log.info("Database users already seeded. Skipping initial user generation.");
            return;
        }
        // Skip everything (not just users) so a later run with passwords set still sees an empty DB
        if (!isUsable(demoAdminPassword) || !isUsable(demoCustomerPassword)) {
            log.warn("Demo seeding skipped: DEMO_ADMIN_PASSWORD and DEMO_CUSTOMER_PASSWORD must both be set "
                    + "(at least {} characters).", MIN_DEMO_PASSWORD_LENGTH);
            return;
        }

        log.info("Seeding initial data for Athletiq...");

        // 1. Create Default Admin
        User admin = User.builder()
                .firstName("Athletiq")
                .lastName("Admin")
                .email("admin@athletiq.com")
                .password(passwordEncoder.encode(demoAdminPassword))
                .phone("9876543210")
                .role(Role.ADMIN)
                .build();
        admin = userRepository.save(admin);

        // 2. Create Default Customer
        User customer = User.builder()
                .firstName("Rahul")
                .lastName("Sharma")
                .email("customer@athletiq.com")
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

        log.info("Data seeding complete. Demo accounts: admin@athletiq.com, customer@athletiq.com (passwords are not logged).");
    }

    private void ensureAthletiqUsersExist() {
        userRepository.findByEmail("admin@athletiq.com").ifPresentOrElse(
                u -> {},
                () -> userRepository.findByEmail("admin@sportsphere.com").ifPresentOrElse(
                        oldAdmin -> {
                            oldAdmin.setEmail("admin@athletiq.com");
                            oldAdmin.setFirstName("Athletiq");
                            userRepository.save(oldAdmin);
                            log.info("Migrated admin@sportsphere.com to admin@athletiq.com");
                        },
                        () -> {
                            if (isUsable(demoAdminPassword)) {
                                User a = User.builder()
                                        .firstName("Athletiq")
                                        .lastName("Admin")
                                        .email("admin@athletiq.com")
                                        .password(passwordEncoder.encode(demoAdminPassword))
                                        .phone("9876543210")
                                        .role(Role.ADMIN)
                                        .build();
                                userRepository.save(a);
                                log.info("Created default admin@athletiq.com user");
                            }
                        }
                )
        );

        userRepository.findByEmail("customer@athletiq.com").ifPresentOrElse(
                u -> {},
                () -> userRepository.findByEmail("customer@sportsphere.com").ifPresentOrElse(
                        oldCustomer -> {
                            oldCustomer.setEmail("customer@athletiq.com");
                            userRepository.save(oldCustomer);
                            log.info("Migrated customer@sportsphere.com to customer@athletiq.com");
                        },
                        () -> {
                            if (isUsable(demoCustomerPassword)) {
                                User c = User.builder()
                                        .firstName("Rahul")
                                        .lastName("Sharma")
                                        .email("customer@athletiq.com")
                                        .password(passwordEncoder.encode(demoCustomerPassword))
                                        .phone("9123456789")
                                        .role(Role.CUSTOMER)
                                        .build();
                                userRepository.save(c);
                                log.info("Created default customer@athletiq.com user");
                            }
                        }
                )
        );
    }

    private void seedAdditionalVenues() {
        record VenueSeedData(String name, String desc, String address, String city, String state, String pincode, double lat, double lng, String image, SportType sport1, String court1Name, BigDecimal price1, SportType sport2, String court2Name, BigDecimal price2) {}

        List<VenueSeedData> seeds = List.of(
                // Mumbai (400xxx)
                new VenueSeedData("KickOff Mega Arena & Floodlight Turf", "FIFA standard 5G synthetic turf with shadow-free LED floodlights, VIP dugout, and locker rooms.", "Link Road, Next to Infinity Mall, Andheri West", "Mumbai", "Maharashtra", "400053", 19.1363, 72.8277, "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200", SportType.FOOTBALL, "Main Turf 5v5 / 7v7", new BigDecimal("1400.00"), SportType.CRICKET, "Floodlit Box Cricket Pitch", new BigDecimal("1200.00")),
                new VenueSeedData("Supreme Football Park & Box Nets", "High-octane rooftop football arena with panoramic skyline views and professional rubber infill turf.", "Hiranandani Gardens, Central Avenue, Powai", "Mumbai", "Maharashtra", "400076", 19.1176, 72.9060, "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200", SportType.FOOTBALL, "Rooftop Champions Turf", new BigDecimal("1800.00"), SportType.BADMINTON, "Indoor Pro Court A", new BigDecimal("600.00")),
                new VenueSeedData("High Octane Sports Zone", "Premier multi-sport arena with box cricket cage, high-speed bowling machines, and FIBA basketball half-court.", "Chincholi Bunder Road, Off Link Road, Malad West", "Mumbai", "Maharashtra", "400064", 19.1860, 72.8485, "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200", SportType.CRICKET, "Pro Pitch Box Arena", new BigDecimal("1300.00"), SportType.BASKETBALL, "FIBA Hardcourt Cage", new BigDecimal("800.00")),
                new VenueSeedData("Heritage Turf & Futsal Ground", "Classic South Mumbai enclosed turf grounds right next to the sea breeze with pro shock-absorbent underlay.", "Near Gateway of India, Colaba", "Mumbai", "Maharashtra", "400001", 18.9322, 72.8347, "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200", SportType.FOOTBALL, "Colaba Harbor Turf 5v5", new BigDecimal("1600.00"), SportType.CRICKET, "Colaba Net Arena", new BigDecimal("1400.00")),

                // Bangalore (560xxx)
                new VenueSeedData("PlayArena Urban Sports Complex", "Massive sports hub with synthetic football turfs, 4 BWF badminton courts, and night matchday floodlights.", "Sarjapur Main Road, Koramangala Extension", "Bangalore", "Karnataka", "560034", 12.9352, 77.6245, "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200", SportType.FOOTBALL, "Arena Pitch 1 (FIFA Infill)", new BigDecimal("1500.00"), SportType.BASKETBALL, "Polyurethane Cushion Court", new BigDecimal("900.00")),
                new VenueSeedData("Velocity Sports Hub & Badminton", "State-of-the-art indoor badminton facility with teak wood flooring and outdoor floodlit cricket box.", "27th Main Road, Sector 1, HSR Layout", "Bangalore", "Karnataka", "560102", 12.9121, 77.6446, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200", SportType.BADMINTON, "BWF Teakwood Court 1", new BigDecimal("550.00"), SportType.CRICKET, "HSR Box Cricket Ground", new BigDecimal("1400.00")),
                new VenueSeedData("Whitefield Floodlight Arena", "High-capacity dual turfs designed for corporate leagues and competitive night tournaments.", "ITPL Main Road, Whitefield", "Bangalore", "Karnataka", "560066", 12.9698, 77.7500, "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200", SportType.FOOTBALL, "Whitefield 7v7 Ground", new BigDecimal("1600.00"), SportType.CRICKET, "East End Cricket Pitch", new BigDecimal("1300.00")),
                new VenueSeedData("Brigade Central Courts & Arena", "Centrally located premium sports arena with air-conditioned locker rooms and BWF badminton courts.", "MG Road Metro Promenade, Central Bangalore", "Bangalore", "Karnataka", "560001", 12.9756, 77.6094, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200", SportType.BADMINTON, "Brigade Indoor Court Alpha", new BigDecimal("650.00"), SportType.FOOTBALL, "Central 5v5 Cage", new BigDecimal("1500.00")),

                // Delhi NCR (110xxx, 201xxx)
                new VenueSeedData("South Delhi Floodlit Arena", "Top-tier synthetic turf facility with international standard LED towers, bibs, and digital referee scoreboard.", "Aurobindo Marg, Near Hauz Khas Village", "New Delhi", "Delhi", "110016", 28.5494, 77.2001, "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200", SportType.FOOTBALL, "South Delhi Stadium 5v5", new BigDecimal("1600.00"), SportType.CRICKET, "Hauz Khas Cricket Cage", new BigDecimal("1500.00")),
                new VenueSeedData("Connaught Central Sports Hub", "Iconic central Delhi arena featuring championship level badminton courts and FIFA approved futsal turf.", "Barakhamba Road, Connaught Place", "New Delhi", "Delhi", "110001", 28.6304, 77.2177, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200", SportType.BADMINTON, "CP Championship Court", new BigDecimal("700.00"), SportType.FOOTBALL, "Heart of Delhi Futsal", new BigDecimal("1700.00")),
                new VenueSeedData("Noida Pro Athletic Turf & Courts", "Sprawling sports park with 3 multi-purpose synthetic grounds, floodlights, and dedicated cafeteria.", "Block B, Industrial Area, Sector 62", "Noida", "Uttar Pradesh", "201301", 28.6280, 77.3649, "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200", SportType.FOOTBALL, "Noida Express Turf", new BigDecimal("1300.00"), SportType.BADMINTON, "Sector 62 Badminton Mat", new BigDecimal("500.00")),

                // Hyderabad (500xxx)
                new VenueSeedData("Cyber Goal Arena", "Futuristic sports complex in the heart of Cyberabad with 40mm monofilament turf and high-speed box cricket nets.", "Madhapur, Near Inorbit Mall, Hitec City", "Hyderabad", "Telangana", "500081", 17.4435, 78.3772, "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200", SportType.FOOTBALL, "Cyber Arena 5v5 Turf", new BigDecimal("1400.00"), SportType.CRICKET, "Hitec Cricket Nets", new BigDecimal("1200.00")),
                new VenueSeedData("Smash & Kick Turf Club", "Modern sports arena with BWF approved synthetic mats and outdoor floodlit basketball cages.", "Old Mumbai Highway, Gachibowli", "Hyderabad", "Telangana", "500032", 17.4401, 78.3489, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200", SportType.BADMINTON, "Gachibowli Court 1", new BigDecimal("600.00"), SportType.BASKETBALL, "Polyurethane Pro Court", new BigDecimal("850.00")),

                // Pune (411xxx)
                new VenueSeedData("Pune Stadium Grounds & Futsal", "Premier football and box cricket venue with 800 Lux floodlights, natural ventilation, and player dugouts.", "Symbiosis Road, Viman Nagar", "Pune", "Maharashtra", "411014", 18.5679, 73.9143, "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200", SportType.FOOTBALL, "Viman Nagar Futsal Arena", new BigDecimal("1200.00"), SportType.CRICKET, "Pune Box Cricket Pitch", new BigDecimal("1300.00"))
        );

        LocalDate today = LocalDate.now();
        int currentHour = LocalTime.now().getHour();

        for (VenueSeedData seed : seeds) {
            if (venueRepository.findAll().stream().anyMatch(v -> v.getName().equalsIgnoreCase(seed.name()))) {
                continue;
            }

            Venue venue = Venue.builder()
                    .name(seed.name())
                    .description(seed.desc())
                    .address(seed.address())
                    .city(seed.city())
                    .state(seed.state())
                    .pincode(seed.pincode())
                    .latitude(seed.lat())
                    .longitude(seed.lng())
                    .status(VenueStatus.ACTIVE)
                    .build();

            venue.getImages().add(VenueImage.builder().venue(venue).imageUrl(seed.image()).isPrimary(true).build());
            venue = venueRepository.save(venue);

            Court court1 = Court.builder()
                    .venue(venue)
                    .courtName(seed.court1Name())
                    .sportType(seed.sport1())
                    .pricePerHour(seed.price1())
                    .status(CourtStatus.ACTIVE)
                    .build();
            court1 = courtRepository.save(court1);

            Court court2 = null;
            if (seed.sport2() != null) {
                court2 = Court.builder()
                        .venue(venue)
                        .courtName(seed.court2Name())
                        .sportType(seed.sport2())
                        .pricePerHour(seed.price2())
                        .status(CourtStatus.ACTIVE)
                        .build();
                court2 = courtRepository.save(court2);
            }

            // Seed slots for the next 7 days
            for (LocalDate date : today.datesUntil(today.plusDays(7)).toList()) {
                for (int hour = 6; hour <= 20; hour += 2) {
                    if (date.equals(today) && hour <= currentHour) {
                        continue;
                    }
                    Slot s1 = Slot.builder()
                            .court(court1)
                            .bookingDate(date)
                            .startTime(LocalTime.of(hour, 0))
                            .endTime(LocalTime.of(hour + 2, 0))
                            .slotStatus(SlotStatus.AVAILABLE)
                            .build();
                    slotRepository.save(s1);

                    if (court2 != null) {
                        Slot s2 = Slot.builder()
                                .court(court2)
                                .bookingDate(date)
                                .startTime(LocalTime.of(hour, 0))
                                .endTime(LocalTime.of(hour + 1, 0))
                                .slotStatus(SlotStatus.AVAILABLE)
                                .build();
                        slotRepository.save(s2);
                    }
                }
            }
            log.info("Seeded venue: {} ({}, PIN: {}) with courts and slots.", venue.getName(), venue.getCity(), venue.getPincode());
        }
    }

    private static boolean isUsable(String password) {
        return password != null && password.strip().length() >= MIN_DEMO_PASSWORD_LENGTH;
    }
}
