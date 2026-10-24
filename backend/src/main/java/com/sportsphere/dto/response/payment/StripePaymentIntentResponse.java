package com.sportsphere.dto.response.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripePaymentIntentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String publishableKey;
    private String currency;
    private Long amount;
    private boolean isMock;
}
