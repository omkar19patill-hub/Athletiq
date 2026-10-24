package com.sportsphere.entity;

import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings",
        indexes = {
                @Index(name = "idx_bookings_customer", columnList = "customer_id"),
                @Index(name = "idx_bookings_slot", columnList = "slot_id"),
                @Index(name = "idx_bookings_status", columnList = "booking_status"),
                @Index(name = "idx_bookings_number", columnList = "booking_number"),
                @Index(name = "idx_bookings_booked_at", columnList = "booked_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_number", nullable = false, unique = true, length = 20)
    private String bookingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bookings_customer"))
    private User customer;

    // Many-to-one: a cancelled booking keeps its slot_id, so a slot can have several booking rows over time.
    // "At most one non-cancelled booking per slot" is enforced in BookingServiceImpl under the slot row lock.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bookings_slot"))
    private Slot slot;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false, length = 20)
    @Builder.Default
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "stripe_payment_intent_id", length = 120)
    private String stripePaymentIntentId;

    @Column(name = "stripe_client_secret", length = 255)
    private String stripeClientSecret;

    @CreationTimestamp
    @Column(name = "booked_at", updatable = false)
    private LocalDateTime bookedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BookingRequirement bookingRequirement;
}
