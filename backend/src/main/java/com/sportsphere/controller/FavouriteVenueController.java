package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.constants.AppConstants;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.venue.VenueResponse;
import com.sportsphere.service.FavouriteVenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.FAVOURITES)
@RequiredArgsConstructor
@Tag(name = "Favourites", description = "Endpoints for saved/favourite venues")
public class FavouriteVenueController {

    private final FavouriteVenueService favouriteVenueService;

    @PostMapping("/{venueId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Toggle a venue in customer favourites")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavourite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long venueId) {
        boolean isFav = favouriteVenueService.toggleFavourite(userDetails.getUsername(), venueId);
        String msg = isFav ? "Added to favourites" : "Removed from favourites";
        return ResponseEntity.ok(ApiResponse.success(msg, isFav));
    }

    @GetMapping("/{venueId}/check")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Check if a venue is in favourites")
    public ResponseEntity<ApiResponse<Boolean>> isFavourite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long venueId) {
        return ResponseEntity.ok(ApiResponse.success("Status checked",
                favouriteVenueService.isFavourite(userDetails.getUsername(), venueId)));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get my favourite venues")
    public ResponseEntity<ApiResponse<PagedResponse<VenueResponse>>> getMyFavourites(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.success("Favourite venues retrieved",
                favouriteVenueService.getCustomerFavourites(userDetails.getUsername(), page, size)));
    }
}
