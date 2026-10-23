package com.sportsphere.entity;

import com.sportsphere.entity.enums.Occasion;
import com.sportsphere.entity.enums.PreparationStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_requirements",
        indexes = {@Index(name = "idx_br_booking", columnList = "booking_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_br_booking"))
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "occasion", nullable = false, length = 20)
    private Occasion occasion;

    @Column(name = "players_count", nullable = false)
    @Builder.Default
    private Integer playersCount = 1;

    @Column(name = "equipment_required", columnDefinition = "JSON")
    private String equipmentRequired;

    @Column(name = "preparation_required", columnDefinition = "JSON")
    private String preparationRequired;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "preparation_status", nullable = false, length = 20)
    @Builder.Default
    private PreparationStatus preparationStatus = PreparationStatus.PENDING;
}
