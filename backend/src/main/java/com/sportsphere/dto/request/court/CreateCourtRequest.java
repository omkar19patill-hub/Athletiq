package com.sportsphere.dto.request.court;

import com.sportsphere.entity.enums.SportType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateCourtRequest {

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    @NotBlank(message = "Court name is required")
    @Size(max = 100, message = "Court name must not exceed 100 characters")
    private String courtName;

    @NotNull(message = "Sport type is required")
    private SportType sportType;

    @NotNull(message = "Price per hour is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerHour;
}
