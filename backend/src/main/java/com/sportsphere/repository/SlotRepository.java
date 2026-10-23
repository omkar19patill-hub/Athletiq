package com.sportsphere.repository;

import com.sportsphere.entity.Slot;
import com.sportsphere.entity.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByCourtIdAndBookingDateOrderByStartTime(Long courtId, LocalDate bookingDate);

    List<Slot> findByCourtIdAndBookingDateAndSlotStatusOrderByStartTime(
            Long courtId, LocalDate bookingDate, SlotStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdWithLock(@Param("id") Long id);

    boolean existsByCourtIdAndBookingDateAndStartTime(Long courtId, LocalDate bookingDate, LocalTime startTime);

    long countBySlotStatus(SlotStatus status);
}
