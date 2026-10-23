package com.sportsphere.dto.response.review;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private Long venueId;
    private String venueName;
    private Integer rating;
    private String review;
    private LocalDateTime createdAt;
}
