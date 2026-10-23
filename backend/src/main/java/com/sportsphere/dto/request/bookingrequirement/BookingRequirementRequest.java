package com.sportsphere.dto.request.bookingrequirement;

import com.sportsphere.entity.enums.Occasion;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingRequirementRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Occasion is required")
    private Occasion occasion;

    @Min(value = 1, message = "Players count must be at least 1")
    private int playersCount;

    private List<String> equipmentRequired;
    private List<String> preparationRequired;
    private String additionalNotes;
}
