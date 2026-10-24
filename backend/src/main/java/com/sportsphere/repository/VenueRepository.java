package com.sportsphere.repository;

import com.sportsphere.entity.Venue;
import com.sportsphere.entity.enums.VenueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long>, JpaSpecificationExecutor<Venue> {

    Page<Venue> findByStatus(VenueStatus status, Pageable pageable);

    List<Venue> findByStatus(VenueStatus status);

    Page<Venue> findByCityIgnoreCaseAndStatus(String city, VenueStatus status, Pageable pageable);

    List<Venue> findTop6ByStatusOrderByCreatedAtDesc(VenueStatus status);

    long countByStatus(VenueStatus status);

    @Query("SELECT DISTINCT v.city FROM Venue v WHERE v.status = 'ACTIVE' ORDER BY v.city")
    List<String> findDistinctCities();
}
