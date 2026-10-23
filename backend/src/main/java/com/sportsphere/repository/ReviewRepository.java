package com.sportsphere.repository;

import com.sportsphere.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByVenueIdOrderByCreatedAtDesc(Long venueId, Pageable pageable);

    Optional<Review> findByCustomerIdAndVenueId(Long customerId, Long venueId);

    boolean existsByCustomerIdAndVenueId(Long customerId, Long venueId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.venue.id = :venueId")
    Double findAverageRatingByVenueId(@Param("venueId") Long venueId);

    long countByVenueId(Long venueId);

    long countByCustomerId(Long customerId);
}
