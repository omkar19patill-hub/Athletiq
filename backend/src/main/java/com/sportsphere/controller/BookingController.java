package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.constants.AppConstants;
import com.sportsphere.dto.request.booking.CancelBookingRequest;
import com.sportsphere.dto.request.booking.CreateBookingRequest;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.booking.BookingResponse;
import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.BOOKINGS)
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Endpoints for turf slot booking and cancellation management")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Book an available slot (Customer only)")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully",
                        bookingService.createBooking(userDetails.getUsername(), request)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking (Customer/Admin)")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully",
                bookingService.cancelBooking(userDetails.getUsername(), id, request)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get bookings for currently logged in customer")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully",
                bookingService.getCustomerBookings(userDetails.getUsername(), page, size, status)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings system-wide (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponse>>> getAllBookings(
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("All bookings retrieved successfully",
                bookingService.getAllBookings(page, size, status)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully",
                bookingService.getBookingById(userDetails.getUsername(), id)));
    }

    @GetMapping("/number/{bookingNumber}")
    @Operation(summary = "Get booking by reference number")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByNumber(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable String bookingNumber) {
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully",
                bookingService.getBookingByNumber(userDetails.getUsername(), bookingNumber)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update booking status (Admin only)")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully",
                bookingService.updateBookingStatus(id, status)));
    }
}
