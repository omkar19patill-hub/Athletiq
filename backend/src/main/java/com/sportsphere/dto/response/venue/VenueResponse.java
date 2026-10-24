package com.sportsphere.dto.response.venue;

import com.sportsphere.entity.enums.VenueStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private VenueStatus status;
    private List<String> imageUrls;
    private Double averageRating;
    private Long totalReviews;
    private Long totalCourts;
    private Double distanceKm;
    private LocalDateTime createdAt;
}
