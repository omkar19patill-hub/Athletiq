package com.sportsphere.dto.response.booking;

import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.entity.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;
    private String bookingNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long slotId;
    private Long courtId;
    private String courtName;
    private Long venueId;
    private String venueName;
    private String venueCity;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal refundAmount;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private String stripePublishableKey;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
}
