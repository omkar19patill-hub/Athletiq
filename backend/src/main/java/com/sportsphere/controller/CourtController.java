package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.dto.request.court.CreateCourtRequest;
import com.sportsphere.dto.request.court.UpdateCourtRequest;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.court.CourtResponse;
import com.sportsphere.service.CourtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.COURTS)
@RequiredArgsConstructor
@Tag(name = "Courts", description = "Endpoints for court management within venues")
public class CourtController {

    private final CourtService courtService;

    @GetMapping("/venue/{venueId}")
    @Operation(summary = "Get all courts for a specific venue")
    public ResponseEntity<ApiResponse<List<CourtResponse>>> getCourtsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(ApiResponse.success("Courts retrieved successfully",
                courtService.getCourtsByVenue(venueId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get court details by ID")
    public ResponseEntity<ApiResponse<CourtResponse>> getCourtById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Court details retrieved successfully",
                courtService.getCourtById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new court (Admin only)")
    public ResponseEntity<ApiResponse<CourtResponse>> createCourt(@Valid @RequestBody CreateCourtRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Court created successfully", courtService.createCourt(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update court details (Admin only)")
    public ResponseEntity<ApiResponse<CourtResponse>> updateCourt(@PathVariable Long id, @Valid @RequestBody UpdateCourtRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Court updated successfully", courtService.updateCourt(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a court (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteCourt(@PathVariable Long id) {
        courtService.deleteCourt(id);
        return ResponseEntity.ok(ApiResponse.success("Court deleted successfully"));
    }
}
