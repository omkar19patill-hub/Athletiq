package com.sportsphere.service;

import com.sportsphere.dto.request.review.CreateReviewRequest;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.review.ReviewResponse;

public interface ReviewService {
    ReviewResponse addReview(String customerEmail, CreateReviewRequest request);
    PagedResponse<ReviewResponse> getVenueReviews(Long venueId, int page, int size);
    void deleteReview(String userEmail, Long reviewId);
}
