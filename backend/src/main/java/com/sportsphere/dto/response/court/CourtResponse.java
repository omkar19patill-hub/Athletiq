package com.sportsphere.dto.response.court;

import com.sportsphere.entity.enums.CourtStatus;
import com.sportsphere.entity.enums.SportType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtResponse {

    private Long id;
    private Long venueId;
    private String venueName;
    private String courtName;
    private SportType sportType;
    private BigDecimal pricePerHour;
    private CourtStatus status;
    private LocalDateTime createdAt;
}
