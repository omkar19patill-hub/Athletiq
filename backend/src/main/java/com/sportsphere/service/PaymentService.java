package com.sportsphere.service;

import com.sportsphere.dto.response.booking.BookingResponse;
import com.sportsphere.dto.response.payment.StripePaymentIntentResponse;

import java.math.BigDecimal;

public interface PaymentService {

    String getPublishableKey();

    StripePaymentIntentResponse createPaymentIntent(String bookingNumber, BigDecimal amount, String customerEmail);

    BookingResponse confirmPayment(String userEmail, String bookingNumber);

    void handleWebhook(String payload, String sigHeader);

    void processRefund(String stripePaymentIntentId, BigDecimal refundAmount);
}
