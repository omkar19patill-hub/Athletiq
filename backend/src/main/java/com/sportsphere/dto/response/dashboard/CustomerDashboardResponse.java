package com.sportsphere.dto.response.dashboard;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDashboardResponse {

    private long upcomingBookings;
    private long totalBookings;
    private long cancelledBookings;
    private long completedBookings;
    private long favouriteVenues;
    private long totalReviews;
}
