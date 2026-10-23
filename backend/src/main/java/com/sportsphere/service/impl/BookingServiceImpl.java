package com.sportsphere.service.impl;

import com.sportsphere.dto.request.booking.CancelBookingRequest;
import com.sportsphere.dto.request.booking.CreateBookingRequest;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.booking.BookingResponse;
import com.sportsphere.entity.Booking;
import com.sportsphere.entity.Court;
import com.sportsphere.entity.Slot;
import com.sportsphere.entity.User;
import com.sportsphere.entity.enums.BookingStatus;
import com.sportsphere.entity.enums.CourtStatus;
import com.sportsphere.entity.enums.VenueStatus;
import com.sportsphere.entity.enums.PaymentStatus;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.entity.enums.SlotStatus;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.exception.DuplicateBookingException;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.BookingRepository;
import com.sportsphere.repository.SlotRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.service.BookingService;
import com.sportsphere.util.BookingNumberGenerator;
import com.sportsphere.util.RefundCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final BookingNumberGenerator bookingNumberGenerator;
    private final RefundCalculator refundCalculator;

    @Override
    @Transactional
    public BookingResponse createBooking(String customerEmail, CreateBookingRequest request) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        // Lock slot to prevent concurrent double-booking
        Slot slot = slotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot", "id", request.getSlotId()));

        if (slot.getSlotStatus() != SlotStatus.AVAILABLE) {
            throw new DuplicateBookingException("Slot is no longer available for booking");
        }
        // Defence in depth: slot status and booking rows must agree (cancelled rows don't count)
        if (bookingRepository.existsBySlotIdAndBookingStatusNot(slot.getId(), BookingStatus.CANCELLED)) {
            throw new DuplicateBookingException("Slot is no longer available for booking");
        }
        if (!slotStart(slot).isAfter(LocalDateTime.now())) {
            throw new BusinessException("This slot has already started and can no longer be booked");
        }
        Court court = slot.getCourt();
        if (court.getStatus() != CourtStatus.ACTIVE || court.getVenue().getStatus() != VenueStatus.ACTIVE) {
            throw new BusinessException("This court is currently not accepting bookings");
        }

        BigDecimal totalAmount = calculatePrice(court.getPricePerHour(), slot.getStartTime(), slot.getEndTime());

        Booking booking = Booking.builder()
                .bookingNumber(bookingNumberGenerator.generate())
                .customer(customer)
                .slot(slot)
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID) // Simulated payment
                .totalAmount(totalAmount)
                .refundAmount(BigDecimal.ZERO)
                .build();

        slot.setSlotStatus(SlotStatus.BOOKED);
        slotRepository.save(slot);

        booking = bookingRepository.save(booking);
        log.info("Booking created: {} for user: {}", booking.getBookingNumber(), customer.getEmail());

        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String userEmail, Long bookingId, CancelBookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        assertCanAccess(user, booking);

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking is already cancelled");
        }
        if (!CANCELLABLE.contains(booking.getBookingStatus())) {
            throw new BusinessException("A " + booking.getBookingStatus() + " booking cannot be cancelled");
        }

        Slot slot = booking.getSlot();
        LocalDateTime slotStartDateTime = slotStart(slot);

        BigDecimal refund = refundCalculator.calculateRefund(booking.getTotalAmount(), slotStartDateTime);

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(request != null ? request.getCancellationReason() : "User requested cancellation");
        booking.setRefundAmount(refund);
        if (refund.compareTo(BigDecimal.ZERO) > 0) {
            booking.setPaymentStatus(refund.compareTo(booking.getTotalAmount()) == 0 ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED);
        }

        // Reopen the slot only if it hasn't started; a started/past slot must not become bookable again
        if (slotStartDateTime.isAfter(LocalDateTime.now())) {
            slot.setSlotStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }

        log.info("Booking cancelled: {}. Refund calculated: {}", booking.getBookingNumber(), refund);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        assertCanAccess(findUser(userRepository, userEmail), booking);
        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByNumber(String userEmail, String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingNumber", bookingNumber));
        assertCanAccess(findUser(userRepository, userEmail), booking);
        return toResponse(booking);
    }

    private static final Set<BookingStatus> CANCELLABLE = EnumSet.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    static LocalDateTime slotStart(Slot slot) {
        return LocalDateTime.of(slot.getBookingDate(), slot.getStartTime());
    }

    /** pricePerHour x slot length in hours, rounded to 2 dp (HALF_UP). */
    static BigDecimal calculatePrice(BigDecimal pricePerHour, LocalTime start, LocalTime end) {
        long minutes = Duration.between(start, end).toMinutes();
        if (minutes <= 0) {
            throw new BusinessException("Slot has an invalid time range");
        }
        return pricePerHour.multiply(BigDecimal.valueOf(minutes))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    static User findUser(UserRepository userRepository, String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    /** Owner or ADMIN only; anyone else gets 403 via the global AccessDeniedException handler. */
    static void assertCanAccess(User user, Booking booking) {
        if (user.getRole() != Role.ADMIN && !booking.getCustomer().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not allowed to access this booking");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getCustomerBookings(String customerEmail, int page, int size, String status) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        Pageable pageable = PageRequest.of(page, size, Sort.by("bookedAt").descending());
        Page<Booking> bookingPage;

        BookingStatus bookingStatus = parseStatusFilter(status);
        if (bookingStatus != null) {
            bookingPage = bookingRepository.findByCustomerIdAndBookingStatus(customer.getId(), bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findByCustomerId(customer.getId(), pageable);
        }

        return toPagedResponse(bookingPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getAllBookings(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookedAt").descending());
        Page<Booking> bookingPage;

        BookingStatus bookingStatus = parseStatusFilter(status);
        if (bookingStatus != null) {
            bookingPage = bookingRepository.findByBookingStatus(bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findAll(pageable);
        }

        return toPagedResponse(bookingPage);
    }

    /** null/blank/"ALL" = no filter; unknown value = 400 instead of a 500 from valueOf. */
    static BookingStatus parseStatusFilter(String status) {
        if (status == null || status.isBlank() || status.trim().equalsIgnoreCase("ALL")) {
            return null;
        }
        try {
            return BookingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid booking status: " + status);
        }
    }

    // Allowed admin transitions. CANCELLED is excluded on purpose: cancelling must go through
    // cancelBooking so the refund is calculated and the slot is released.
    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED_TRANSITIONS = Map.of(
            BookingStatus.PENDING, EnumSet.of(BookingStatus.CONFIRMED),
            BookingStatus.CONFIRMED, EnumSet.of(BookingStatus.COMPLETED, BookingStatus.NO_SHOW));

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        BookingStatus current = booking.getBookingStatus();
        if (status == BookingStatus.CANCELLED) {
            throw new BusinessException("Use the cancel endpoint to cancel a booking");
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(current, Set.of()).contains(status)) {
            throw new BusinessException("Cannot change booking status from " + current + " to " + status);
        }
        booking.setBookingStatus(status);
        return toResponse(bookingRepository.save(booking));
    }

    private BookingResponse toResponse(Booking booking) {
        Slot slot = booking.getSlot();
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName())
                .customerEmail(booking.getCustomer().getEmail())
                .slotId(slot.getId())
                .courtId(slot.getCourt().getId())
                .courtName(slot.getCourt().getCourtName())
                .venueId(slot.getCourt().getVenue().getId())
                .venueName(slot.getCourt().getVenue().getName())
                .venueCity(slot.getCourt().getVenue().getCity())
                .bookingDate(slot.getBookingDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .totalAmount(booking.getTotalAmount())
                .refundAmount(booking.getRefundAmount())
                .bookedAt(booking.getBookedAt())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .build();
    }

    private PagedResponse<BookingResponse> toPagedResponse(Page<Booking> page) {
        List<BookingResponse> content = page.getContent().stream()
                .map(this::toResponse).collect(Collectors.toList());
        return PagedResponse.<BookingResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
