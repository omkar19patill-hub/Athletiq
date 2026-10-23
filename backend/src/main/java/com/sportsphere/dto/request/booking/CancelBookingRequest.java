package com.sportsphere.dto.request.booking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelBookingRequest {
    private String cancellationReason;
}
