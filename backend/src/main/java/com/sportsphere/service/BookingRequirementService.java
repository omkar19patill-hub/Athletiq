package com.sportsphere.service;

import com.sportsphere.dto.request.bookingrequirement.BookingRequirementRequest;
import com.sportsphere.dto.response.bookingrequirement.BookingRequirementResponse;

public interface BookingRequirementService {
    BookingRequirementResponse createOrUpdateRequirement(String userEmail, BookingRequirementRequest request);
    BookingRequirementResponse getRequirementByBookingId(String userEmail, Long bookingId);
}
