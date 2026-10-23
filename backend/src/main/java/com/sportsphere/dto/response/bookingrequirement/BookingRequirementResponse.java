package com.sportsphere.dto.response.bookingrequirement;

import com.sportsphere.entity.enums.Occasion;
import com.sportsphere.entity.enums.PreparationStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequirementResponse {

    private Long id;
    private Long bookingId;
    private Occasion occasion;
    private Integer playersCount;
    private List<String> equipmentRequired;
    private List<String> preparationRequired;
    private String additionalNotes;
    private PreparationStatus preparationStatus;
}
