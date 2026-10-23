package com.sportsphere.repository;

import com.sportsphere.entity.Court;
import com.sportsphere.entity.enums.CourtStatus;
import com.sportsphere.entity.enums.SportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {

    List<Court> findByVenueIdAndStatus(Long venueId, CourtStatus status);

    List<Court> findByVenueId(Long venueId);

    List<Court> findBySportTypeAndStatus(SportType sportType, CourtStatus status);

    long countByVenueId(Long venueId);

    long countByStatus(CourtStatus status);
}
