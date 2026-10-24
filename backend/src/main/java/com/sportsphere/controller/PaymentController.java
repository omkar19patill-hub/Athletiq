package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.booking.BookingResponse;
import com.sportsphere.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(ApiConstants.PAYMENTS)
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payments", description = "Endpoints for Stripe payment processing, webhook, and confirmation")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/config")
    @Operation(summary = "Get Stripe publishable key configuration")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPaymentConfig() {
        return ResponseEntity.ok(ApiResponse.success(
                "Stripe configuration retrieved",
                Map.of("publishableKey", paymentService.getPublishableKey())
        ));
    }

    @PostMapping("/confirm/{bookingNumber}")
    @Operation(summary = "Confirm successful Stripe payment for a booking")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmPayment(
            @PathVariable String bookingNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "";
        BookingResponse response = paymentService.confirmPayment(email, bookingNumber);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully", response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook endpoint for asynchronous payment updates")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        log.info("Received Stripe webhook notification");
        paymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("Received");
    }
}
