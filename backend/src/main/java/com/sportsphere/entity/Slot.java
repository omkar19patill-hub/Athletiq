package com.sportsphere.entity;

import com.sportsphere.entity.enums.SlotStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "slots",
        indexes = {
                @Index(name = "idx_slots_court", columnList = "court_id"),
                @Index(name = "idx_slots_date", columnList = "booking_date"),
                @Index(name = "idx_slots_status", columnList = "slot_status"),
                @Index(name = "idx_slots_date_status", columnList = "booking_date,slot_status")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_slot_time", columnNames = {"court_id", "booking_date", "start_time"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false, foreignKey = @ForeignKey(name = "fk_slots_court"))
    private Court court;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status", nullable = false, length = 20)
    @Builder.Default
    private SlotStatus slotStatus = SlotStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
