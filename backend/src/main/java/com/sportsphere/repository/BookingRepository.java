package com.sportsphere.repository;

import com.sportsphere.entity.Booking;
import com.sportsphere.entity.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingNumber(String bookingNumber);

    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);

    Page<Booking> findByBookingStatus(BookingStatus status, Pageable pageable);

    Page<Booking> findByCustomerIdAndBookingStatus(Long customerId, BookingStatus status, Pageable pageable);

    boolean existsByCustomerIdAndSlotId(Long customerId, Long slotId);

    boolean existsBySlotIdAndBookingStatusNot(Long slotId, BookingStatus status);

    long countByBookingStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE DATE(b.bookedAt) = :date")
    long countByBookingDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.bookingStatus != 'CANCELLED' AND b.bookedAt BETWEEN :start AND :end")
    BigDecimal sumRevenueByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DATE(b.bookedAt) as day, COUNT(b) as count FROM Booking b WHERE b.bookedAt BETWEEN :start AND :end GROUP BY DATE(b.bookedAt) ORDER BY day")
    List<Object[]> findBookingsGroupedByDay(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DATE(b.bookedAt) as day, COALESCE(SUM(b.totalAmount), 0) as revenue FROM Booking b WHERE b.bookingStatus != 'CANCELLED' AND b.bookedAt BETWEEN :start AND :end GROUP BY DATE(b.bookedAt) ORDER BY day")
    List<Object[]> findRevenueGroupedByDay(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT c.sportType, COUNT(b) FROM Booking b JOIN b.slot s JOIN s.court c WHERE b.bookingStatus != 'CANCELLED' GROUP BY c.sportType ORDER BY COUNT(b) DESC")
    List<Object[]> findPopularSports();

    long countByCustomerId(Long customerId);

    long countByCustomerIdAndBookingStatus(Long customerId, BookingStatus status);

    @Query("SELECT HOUR(s.startTime) as hour, COUNT(b) as count FROM Booking b JOIN b.slot s WHERE b.bookingStatus != 'CANCELLED' GROUP BY HOUR(s.startTime) ORDER BY hour")
    List<Object[]> findPeakHours();
}
