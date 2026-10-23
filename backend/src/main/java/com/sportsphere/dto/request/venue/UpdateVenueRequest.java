package com.sportsphere.dto.request.venue;

import com.sportsphere.entity.enums.VenueStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateVenueRequest {

    @Size(max = 150, message = "Venue name must not exceed 150 characters")
    private String name;

    private String description;
    private String address;
    private String city;
    private String state;

    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Please provide a valid 6-digit pincode")
    private String pincode;

    private Double latitude;
    private Double longitude;
    private VenueStatus status;
    private List<String> imageUrls;
}
