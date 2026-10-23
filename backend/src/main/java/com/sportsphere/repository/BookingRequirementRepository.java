package com.sportsphere.repository;

import com.sportsphere.entity.BookingRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingRequirementRepository extends JpaRepository<BookingRequirement, Long> {
    Optional<BookingRequirement> findByBookingId(Long bookingId);
}
