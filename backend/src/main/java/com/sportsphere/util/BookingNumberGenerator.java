package com.sportsphere.util;

import com.sportsphere.constants.AppConstants;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class BookingNumberGenerator {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generate() {
        StringBuilder sb = new StringBuilder(AppConstants.BOOKING_NUMBER_PREFIX);
        for (int i = 0; i < AppConstants.BOOKING_NUMBER_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
