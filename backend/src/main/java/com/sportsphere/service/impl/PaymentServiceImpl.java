package com.sportsphere.service.impl;

import com.sportsphere.dto.response.booking.BookingResponse;
import com.sportsphere.dto.response.payment.StripePaymentIntentResponse;
import com.sportsphere.entity.Booking;
import com.sportsphere.entity.Slot;
import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.entity.enums.PaymentStatus;
import com.sportsphere.entity.enums.SlotStatus;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.BookingRepository;
import com.sportsphere.repository.SlotRepository;
import com.sportsphere.service.BookingService;
import com.sportsphere.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;

    @Value("${application.stripe.secret-key:sk_test_mock_secret_key_athletiq}")
    private String stripeSecretKey;

    @Value("${application.stripe.publishable-key:pk_test_mock_publishable_key_athletiq}")
    private String stripePublishableKey;

    @Value("${application.stripe.webhook-secret:whsec_mock_webhook_secret}")
    private String stripeWebhookSecret;

    @Value("${application.stripe.currency:inr}")
    private String currency;

    @PostConstruct
    public void init() {
        if (isRealStripeConfigured()) {
            Stripe.apiKey = stripeSecretKey.trim();
            log.info("Stripe Java SDK initialized with provided secret key (currency: {}).", currency);
        } else {
            log.info("Stripe running in simulated development mode. Real Stripe API calls will be mocked.");
        }
    }

    private boolean isRealStripeConfigured() {
        return stripeSecretKey != null
                && stripeSecretKey.startsWith("sk_")
                && !stripeSecretKey.contains("mock");
    }

    @Override
    public String getPublishableKey() {
        return stripePublishableKey;
    }

    @Override
    @Transactional
    public StripePaymentIntentResponse createPaymentIntent(String bookingNumber, BigDecimal amount, String customerEmail) {
        long amountInSubunits = amount.multiply(BigDecimal.valueOf(100)).longValue();

        if (!isRealStripeConfigured()) {
            String mockIntentId = "pi_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
            String mockClientSecret = mockIntentId + "_secret_" + UUID.randomUUID().toString().substring(0, 16);

            log.info("Generated mock Stripe payment intent: {} for booking #{}", mockIntentId, bookingNumber);

            return StripePaymentIntentResponse.builder()
                    .paymentIntentId(mockIntentId)
                    .clientSecret(mockClientSecret)
                    .publishableKey(stripePublishableKey)
                    .currency(currency)
                    .amount(amountInSubunits)
                    .isMock(true)
                    .build();
        }

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInSubunits)
                    .setCurrency(currency.toLowerCase())
                    .setDescription("Athletiq Booking #" + bookingNumber)
                    .putMetadata("bookingNumber", bookingNumber)
                    .putMetadata("customerEmail", customerEmail)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            log.info("Created real Stripe PaymentIntent: {} for booking #{}", intent.getId(), bookingNumber);

            return StripePaymentIntentResponse.builder()
                    .paymentIntentId(intent.getId())
                    .clientSecret(intent.getClientSecret())
                    .publishableKey(stripePublishableKey)
                    .currency(currency)
                    .amount(amountInSubunits)
                    .isMock(false)
                    .build();
        } catch (StripeException e) {
            log.error("Stripe error while creating PaymentIntent for booking {}: {}", bookingNumber, e.getMessage(), e);
            throw new BusinessException("Failed to initiate payment with Stripe: " + e.getUserMessage());
        }
    }

    @Override
    @Transactional
    public BookingResponse confirmPayment(String userEmail, String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingNumber", bookingNumber));

        // Verify with Stripe if real API configured
        if (isRealStripeConfigured() && booking.getStripePaymentIntentId() != null && !booking.getStripePaymentIntentId().startsWith("pi_mock")) {
            try {
                PaymentIntent intent = PaymentIntent.retrieve(booking.getStripePaymentIntentId());
                if (!"succeeded".equalsIgnoreCase(intent.getStatus())) {
                    throw new BusinessException("Stripe payment has not succeeded. Current status: " + intent.getStatus());
                }
            } catch (StripeException e) {
                log.error("Error retrieving Stripe PaymentIntent: {}", e.getMessage(), e);
                throw new BusinessException("Could not verify Stripe payment: " + e.getUserMessage());
            }
        }

        // Payment succeeds; booking remains PENDING until the turf creator/owner accepts
        if (booking.getBookingStatus() != BookingStatus.CANCELLED) {
            // Keep existing bookingStatus (usually PENDING), do not prematurely auto-confirm
            if (booking.getBookingStatus() == null) {
                booking.setBookingStatus(BookingStatus.PENDING);
            }
        }
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking = bookingRepository.save(booking);

        log.info("Booking #{} payment confirmed successfully as PAID.", bookingNumber);
        return BookingServiceImpl.toResponse(booking, stripePublishableKey);
    }

    @Override
    @Transactional
    public void processRefund(String stripePaymentIntentId, BigDecimal refundAmount) {
        if (stripePaymentIntentId == null || refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        if (!isRealStripeConfigured() || stripePaymentIntentId.startsWith("pi_mock")) {
            log.info("Simulated Stripe refund of {} processed for mock intent {}", refundAmount, stripePaymentIntentId);
            return;
        }

        try {
            long refundInSubunits = refundAmount.multiply(BigDecimal.valueOf(100)).longValue();
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(stripePaymentIntentId)
                    .setAmount(refundInSubunits)
                    .build();

            Refund refund = Refund.create(params);
            log.info("Stripe refund created: {} for intent {} (Amount: {})", refund.getId(), stripePaymentIntentId, refundAmount);
        } catch (StripeException e) {
            log.error("Failed to process Stripe refund for intent {}: {}", stripePaymentIntentId, e.getMessage(), e);
            throw new BusinessException("Stripe refund failed: " + e.getUserMessage());
        }
    }

    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        if (payload == null || payload.isBlank()) return;

        try {
            String eventType;
            String bookingNumber = null;

            if (isRealStripeConfigured() && stripeWebhookSecret != null && !stripeWebhookSecret.contains("mock")) {
                Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
                eventType = event.getType();
                var dataObj = event.getDataObjectDeserializer().getObject().orElse(null);
                if (dataObj instanceof PaymentIntent intent && intent.getMetadata() != null) {
                    bookingNumber = intent.getMetadata().get("bookingNumber");
                }
            } else {
                var jsonNode = objectMapper.readTree(payload);
                eventType = jsonNode.path("type").asText();
                var metaNode = jsonNode.path("data").path("object").path("metadata");
                if (metaNode.has("bookingNumber")) {
                    bookingNumber = metaNode.path("bookingNumber").asText();
                }
            }

            if ("payment_intent.succeeded".equals(eventType) && bookingNumber != null) {
                final String bNum = bookingNumber;
                bookingRepository.findByBookingNumber(bNum).ifPresent(b -> {
                    b.setBookingStatus(BookingStatus.CONFIRMED);
                    b.setPaymentStatus(PaymentStatus.PAID);
                    bookingRepository.save(b);
                    log.info("Webhook updated booking #{} to CONFIRMED / PAID.", bNum);
                });
            } else if ("payment_intent.payment_failed".equals(eventType) && bookingNumber != null) {
                final String bNum = bookingNumber;
                bookingRepository.findByBookingNumber(bNum).ifPresent(b -> {
                    b.setBookingStatus(BookingStatus.CANCELLED);
                    b.setPaymentStatus(PaymentStatus.FAILED);
                    Slot slot = b.getSlot();
                    if (LocalDateTime.of(slot.getBookingDate(), slot.getStartTime()).isAfter(LocalDateTime.now())) {
                        slot.setSlotStatus(SlotStatus.AVAILABLE);
                        slotRepository.save(slot);
                    }
                    bookingRepository.save(b);
                    log.info("Webhook updated booking #{} to CANCELLED / FAILED and slot released.", bNum);
                });
            }
        } catch (Exception e) {
            log.error("Error processing Stripe webhook: {}", e.getMessage(), e);
            throw new BusinessException("Webhook processing error: " + e.getMessage());
        }
    }
}
