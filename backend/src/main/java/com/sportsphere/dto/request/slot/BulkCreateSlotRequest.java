package com.sportsphere.dto.request.slot;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Getter
@Setter
public class BulkCreateSlotRequest {

    @NotNull(message = "Court ID is required")
    private Long courtId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Slot start time is required")
    private LocalTime slotStartTime;

    @NotNull(message = "Slot end time is required")
    private LocalTime slotEndTime;

    /**
     * Duration of each slot in minutes (e.g., 60 = 1 hour slots)
     */
    @NotNull(message = "Slot duration is required")
    @Min(value = MIN_DURATION_MINUTES, message = "Slot duration must be at least 15 minutes")
    @Max(value = MAX_DURATION_MINUTES, message = "Slot duration must be at most 240 minutes")
    private Integer slotDurationMinutes;

    /**
     * Days of week to create slots for (1=Monday, 7=Sunday). Empty = all days.
     */
    private List<@Min(value = 1, message = "Day of week must be 1-7") @Max(value = 7, message = "Day of week must be 1-7") Integer> daysOfWeek;

    public static final int MIN_DURATION_MINUTES = 15;
    public static final int MAX_DURATION_MINUTES = 240;
    public static final int MAX_RANGE_DAYS = 90;

    // Null fields are reported by @NotNull above, so these only judge complete values.

    @JsonIgnore
    @AssertTrue(message = "Slot end time must be after slot start time")
    public boolean isTimeRangeValid() {
        return slotStartTime == null || slotEndTime == null || slotEndTime.isAfter(slotStartTime);
    }

    @JsonIgnore
    @AssertTrue(message = "End date must be on or after start date and the range at most 90 days")
    public boolean isDateRangeValid() {
        if (startDate == null || endDate == null) return true;
        return !endDate.isBefore(startDate) && ChronoUnit.DAYS.between(startDate, endDate) < MAX_RANGE_DAYS;
    }
}
