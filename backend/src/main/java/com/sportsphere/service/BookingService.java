package com.sportsphere.service;

import com.sportsphere.dto.request.booking.CancelBookingRequest;
import com.sportsphere.dto.request.booking.CreateBookingRequest;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.booking.BookingResponse;
import com.sportsphere.entity.enums.BookingStatus;

public interface BookingService {
    BookingResponse createBooking(String customerEmail, CreateBookingRequest request);
    BookingResponse cancelBooking(String userEmail, Long bookingId, CancelBookingRequest request);
    BookingResponse getBookingById(String userEmail, Long bookingId);
    BookingResponse getBookingByNumber(String userEmail, String bookingNumber);
    PagedResponse<BookingResponse> getCustomerBookings(String customerEmail, int page, int size, String status);
    PagedResponse<BookingResponse> getAllBookings(int page, int size, String status);
    BookingResponse updateBookingStatus(Long bookingId, BookingStatus status);
}
