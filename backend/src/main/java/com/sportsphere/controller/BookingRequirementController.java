package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.dto.request.bookingrequirement.BookingRequirementRequest;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.bookingrequirement.BookingRequirementResponse;
import com.sportsphere.service.BookingRequirementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.BOOKING_REQUIREMENTS)
@RequiredArgsConstructor
@Tag(name = "Booking Requirements", description = "Endpoints for booking custom requirements form")
public class BookingRequirementController {

    private final BookingRequirementService requirementService;

    @PostMapping
    @Operation(summary = "Submit or update custom requirements for a booking")
    public ResponseEntity<ApiResponse<BookingRequirementResponse>> createOrUpdateRequirement(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequirementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Requirements saved successfully",
                requirementService.createOrUpdateRequirement(userDetails.getUsername(), request)));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get requirements submitted for a specific booking")
    public ResponseEntity<ApiResponse<BookingRequirementResponse>> getRequirementByBookingId(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success("Requirements retrieved successfully",
                requirementService.getRequirementByBookingId(userDetails.getUsername(), bookingId)));
    }
}
