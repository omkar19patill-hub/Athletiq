package com.sportsphere.dto.response.dashboard;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalCustomers;
    private long totalVenues;
    private long totalCourts;
    private long todayBookings;
    private long pendingBookings;
    private BigDecimal monthlyRevenue;
    private BigDecimal totalRevenue;
    private List<Map<String, Object>> revenueByDay;
    private List<Map<String, Object>> bookingsByDay;
    private List<Map<String, Object>> popularSports;
    private List<Map<String, Object>> peakHours;
}
