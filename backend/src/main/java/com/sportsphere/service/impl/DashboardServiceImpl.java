package com.sportsphere.service.impl;

import com.sportsphere.dto.response.dashboard.AdminDashboardResponse;
import com.sportsphere.dto.response.dashboard.CustomerDashboardResponse;
import com.sportsphere.entity.User;
import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.entity.enums.CourtStatus;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.entity.enums.VenueStatus;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.*;
import com.sportsphere.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final CourtRepository courtRepository;
    private final BookingRepository bookingRepository;
    private final FavouriteVenueRepository favouriteRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboardStats() {
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalVenues = venueRepository.countByStatus(VenueStatus.ACTIVE);
        long totalCourts = courtRepository.countByStatus(CourtStatus.ACTIVE);
        long todayBookings = bookingRepository.countByBookingDate(LocalDate.now());
        long pendingBookings = bookingRepository.countByBookingStatus(BookingStatus.PENDING);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = LocalDateTime.of(now.getYear(), now.getMonth(), 1, 0, 0);
        BigDecimal monthlyRevenue = bookingRepository.sumRevenueByDateRange(monthStart, now);

        LocalDateTime yearStart = LocalDateTime.of(now.getYear(), 1, 1, 0, 0);
        BigDecimal totalRevenue = bookingRepository.sumRevenueByDateRange(yearStart, now);

        // Daily chart data for last 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.of(LocalDate.now().minusDays(6), LocalTime.MIN);
        List<Object[]> revGrouped = bookingRepository.findRevenueGroupedByDay(sevenDaysAgo, now);
        List<Object[]> bkGrouped = bookingRepository.findBookingsGroupedByDay(sevenDaysAgo, now);

        List<Map<String, Object>> revenueByDay = new ArrayList<>();
        for (Object[] row : revGrouped) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0].toString());
            map.put("revenue", row[1]);
            revenueByDay.add(map);
        }

        List<Map<String, Object>> bookingsByDay = new ArrayList<>();
        for (Object[] row : bkGrouped) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0].toString());
            map.put("count", row[1]);
            bookingsByDay.add(map);
        }

        // Popular sports
        List<Object[]> sportsGrouped = bookingRepository.findPopularSports();
        List<Map<String, Object>> popularSports = new ArrayList<>();
        for (Object[] row : sportsGrouped) {
            Map<String, Object> map = new HashMap<>();
            map.put("sport", row[0].toString());
            map.put("count", row[1]);
            popularSports.add(map);
        }

        // Peak hours
        List<Object[]> peakHoursGrouped = bookingRepository.findPeakHours();
        List<Map<String, Object>> peakHours = new ArrayList<>();
        for (Object[] row : peakHoursGrouped) {
            Map<String, Object> map = new HashMap<>();
            map.put("hour", row[0] + ":00");
            map.put("count", row[1]);
            peakHours.add(map);
        }

        return AdminDashboardResponse.builder()
                .totalCustomers(totalCustomers)
                .totalVenues(totalVenues)
                .totalCourts(totalCourts)
                .todayBookings(todayBookings)
                .pendingBookings(pendingBookings)
                .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .revenueByDay(revenueByDay)
                .bookingsByDay(bookingsByDay)
                .popularSports(popularSports)
                .peakHours(peakHours)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDashboardResponse getCustomerDashboardStats(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        // Use count-based approach for dashboard stats (unpaged = all records counted)
        long totalBookings = bookingRepository.countByCustomerId(customer.getId());
        long upcomingBookings = bookingRepository.countByCustomerIdAndBookingStatus(customer.getId(), BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository.countByCustomerIdAndBookingStatus(customer.getId(), BookingStatus.CANCELLED);
        long completedBookings = bookingRepository.countByCustomerIdAndBookingStatus(customer.getId(), BookingStatus.COMPLETED);

        long favouriteVenues = favouriteRepository.countByCustomerId(customer.getId());
        long totalReviews = reviewRepository.countByCustomerId(customer.getId());

        return CustomerDashboardResponse.builder()
                .upcomingBookings(upcomingBookings)
                .totalBookings(totalBookings)
                .cancelledBookings(cancelledBookings)
                .completedBookings(completedBookings)
                .favouriteVenues(favouriteVenues)
                .totalReviews(totalReviews)
                .build();
    }
}
