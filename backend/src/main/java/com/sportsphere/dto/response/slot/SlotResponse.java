package com.sportsphere.dto.response.slot;

import com.sportsphere.entity.enums.SlotStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotResponse {

    private Long id;
    private Long courtId;
    private String courtName;
    private Long venueId;
    private String venueName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private SlotStatus slotStatus;
    private LocalDateTime createdAt;
}
