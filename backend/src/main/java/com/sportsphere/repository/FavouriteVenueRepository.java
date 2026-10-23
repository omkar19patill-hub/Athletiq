package com.sportsphere.repository;

import com.sportsphere.entity.FavouriteVenue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavouriteVenueRepository extends JpaRepository<FavouriteVenue, Long> {

    Optional<FavouriteVenue> findByCustomerIdAndVenueId(Long customerId, Long venueId);

    boolean existsByCustomerIdAndVenueId(Long customerId, Long venueId);

    Page<FavouriteVenue> findByCustomerId(Long customerId, Pageable pageable);

    long countByCustomerId(Long customerId);
}
