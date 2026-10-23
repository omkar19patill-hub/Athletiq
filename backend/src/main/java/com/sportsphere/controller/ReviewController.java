package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.constants.AppConstants;
import com.sportsphere.dto.request.review.CreateReviewRequest;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.review.ReviewResponse;
import com.sportsphere.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.REVIEWS)
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Endpoints for customer ratings and reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Submit a venue review (Customer only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review added successfully",
                        reviewService.addReview(userDetails.getUsername(), request)));
    }

    @GetMapping("/venue/{venueId}")
    @Operation(summary = "Get reviews for a venue (paginated)")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getVenueReviews(
            @PathVariable Long venueId,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully",
                reviewService.getVenueReviews(venueId, page, size)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete review (Owner/Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        reviewService.deleteReview(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully"));
    }
}
