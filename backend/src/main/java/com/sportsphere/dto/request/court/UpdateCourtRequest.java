package com.sportsphere.dto.request.court;

import com.sportsphere.entity.enums.CourtStatus;
import com.sportsphere.entity.enums.SportType;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateCourtRequest {

    private String courtName;
    private SportType sportType;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerHour;

    private CourtStatus status;
}
