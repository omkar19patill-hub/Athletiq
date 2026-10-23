package com.sportsphere.service.impl;

import com.sportsphere.dto.request.review.CreateReviewRequest;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.review.ReviewResponse;
import com.sportsphere.entity.Review;
import com.sportsphere.entity.User;
import com.sportsphere.entity.Venue;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.ReviewRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.repository.VenueRepository;
import com.sportsphere.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;

    @Override
    @Transactional
    public ReviewResponse addReview(String customerEmail, CreateReviewRequest request) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", request.getVenueId()));

        if (reviewRepository.existsByCustomerIdAndVenueId(customer.getId(), venue.getId())) {
            throw new BusinessException("You have already submitted a review for this venue");
        }

        Review review = Review.builder()
                .customer(customer)
                .venue(venue)
                .rating(request.getRating())
                .review(request.getReview())
                .build();

        review = reviewRepository.save(review);
        log.info("Review added for venue ID: {} by customer: {}", venue.getId(), customer.getEmail());
        return toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getVenueReviews(Long venueId, int page, int size) {
        if (!venueRepository.existsById(venueId)) {
            throw new ResourceNotFoundException("Venue", "id", venueId);
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByVenueIdOrderByCreatedAtDesc(venueId, pageable);

        List<ReviewResponse> content = reviewPage.getContent().stream()
                .map(this::toResponse).collect(Collectors.toList());

        return PagedResponse.<ReviewResponse>builder()
                .content(content)
                .pageNumber(reviewPage.getNumber())
                .pageSize(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .last(reviewPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public void deleteReview(String userEmail, Long reviewId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (user.getRole() != Role.ADMIN && !review.getCustomer().getId().equals(user.getId())) {
            throw new BusinessException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
        log.info("Review deleted ID: {}", reviewId);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName())
                .venueId(review.getVenue().getId())
                .venueName(review.getVenue().getName())
                .rating(review.getRating())
                .review(review.getReview())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
