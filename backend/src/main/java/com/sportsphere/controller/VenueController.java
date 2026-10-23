package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.constants.AppConstants;
import com.sportsphere.dto.request.venue.CreateVenueRequest;
import com.sportsphere.dto.request.venue.UpdateVenueRequest;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.venue.VenueResponse;
import com.sportsphere.service.VenueService;
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
@RequestMapping(ApiConstants.VENUES)
@RequiredArgsConstructor
@Tag(name = "Venues", description = "Endpoints for managing and searching sports venues")
public class VenueController {

    private final VenueService venueService;

    @GetMapping
    @Operation(summary = "Get all active venues (paginated)")
    public ResponseEntity<ApiResponse<PagedResponse<VenueResponse>>> getAllVenues(
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIRECTION) String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Venues retrieved successfully",
                venueService.getAllVenues(page, size, sortBy, sortDir)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search and filter venues by city, sport, price, rating, keyword")
    public ResponseEntity<ApiResponse<PagedResponse<VenueResponse>>> searchVenues(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIRECTION) String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully",
                venueService.searchVenues(city, sport, minPrice, maxPrice, minRating, keyword, page, size, sortBy, sortDir)));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured/latest venues for landing page")
    public ResponseEntity<ApiResponse<List<VenueResponse>>> getFeaturedVenues() {
        return ResponseEntity.ok(ApiResponse.success("Featured venues retrieved successfully",
                venueService.getFeaturedVenues()));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get list of cities with active venues")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCities() {
        return ResponseEntity.ok(ApiResponse.success("Cities retrieved successfully",
                venueService.getAvailableCities()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get venue details by ID")
    public ResponseEntity<ApiResponse<VenueResponse>> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Venue details retrieved successfully",
                venueService.getVenueById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new venue (Admin only)")
    public ResponseEntity<ApiResponse<VenueResponse>> createVenue(@Valid @RequestBody CreateVenueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Venue created successfully", venueService.createVenue(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing venue (Admin only)")
    public ResponseEntity<ApiResponse<VenueResponse>> updateVenue(@PathVariable Long id, @Valid @RequestBody UpdateVenueRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Venue updated successfully", venueService.updateVenue(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a venue (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok(ApiResponse.success("Venue deleted successfully"));
    }
}
