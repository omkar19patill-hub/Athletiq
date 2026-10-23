package com.sportsphere.util;

import com.sportsphere.constants.AppConstants;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class RefundCalculator {

    /**
     * Calculates the refund amount based on time remaining until slot start.
     * >24 hours: 100% refund
     * 6-24 hours: 50% refund
     * <6 hours: 0% refund
     */
    public BigDecimal calculateRefund(BigDecimal totalAmount, LocalDateTime slotStartDateTime) {
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilStart = Duration.between(now, slotStartDateTime).toHours();

        if (hoursUntilStart > AppConstants.REFUND_FULL_HOURS) {
            return totalAmount;
        } else if (hoursUntilStart >= AppConstants.REFUND_PARTIAL_HOURS) {
            return totalAmount
                    .multiply(BigDecimal.valueOf(AppConstants.REFUND_PARTIAL_PERCENT / 100.0))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            return BigDecimal.ZERO;
        }
    }
}
