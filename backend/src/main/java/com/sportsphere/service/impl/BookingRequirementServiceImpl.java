package com.sportsphere.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsphere.dto.request.bookingrequirement.BookingRequirementRequest;
import com.sportsphere.dto.response.bookingrequirement.BookingRequirementResponse;
import com.sportsphere.entity.Booking;
import com.sportsphere.entity.BookingRequirement;
import com.sportsphere.entity.enums.PreparationStatus;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.BookingRepository;
import com.sportsphere.repository.BookingRequirementRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.service.BookingRequirementService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingRequirementServiceImpl implements BookingRequirementService {

    private final BookingRequirementRepository requirementRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    @SneakyThrows
    public BookingRequirementResponse createOrUpdateRequirement(String userEmail, BookingRequirementRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));
        BookingServiceImpl.assertCanAccess(BookingServiceImpl.findUser(userRepository, userEmail), booking);

        BookingRequirement requirement = requirementRepository.findByBookingId(booking.getId())
                .orElseGet(() -> BookingRequirement.builder().booking(booking).build());

        requirement.setOccasion(request.getOccasion());
        requirement.setPlayersCount(request.getPlayersCount());
        requirement.setAdditionalNotes(request.getAdditionalNotes());
        requirement.setPreparationStatus(PreparationStatus.PENDING);

        if (request.getEquipmentRequired() != null) {
            requirement.setEquipmentRequired(objectMapper.writeValueAsString(request.getEquipmentRequired()));
        }
        if (request.getPreparationRequired() != null) {
            requirement.setPreparationRequired(objectMapper.writeValueAsString(request.getPreparationRequired()));
        }

        requirement = requirementRepository.save(requirement);
        log.info("Booking requirements saved for booking ID: {}", booking.getId());
        return toResponse(requirement);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingRequirementResponse getRequirementByBookingId(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        BookingServiceImpl.assertCanAccess(BookingServiceImpl.findUser(userRepository, userEmail), booking);
        return toResponse(requirementRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("BookingRequirement", "bookingId", bookingId)));
    }

    BookingRequirementResponse toResponse(BookingRequirement r) {
        return BookingRequirementResponse.builder()
                .id(r.getId())
                .bookingId(r.getBooking().getId())
                .occasion(r.getOccasion())
                .playersCount(r.getPlayersCount())
                .equipmentRequired(readList(r.getEquipmentRequired()))
                .preparationRequired(readList(r.getPreparationRequired()))
                .additionalNotes(r.getAdditionalNotes())
                .preparationStatus(r.getPreparationStatus())
                .build();
    }

    @SneakyThrows
    private List<String> readList(String json) {
        return json == null ? List.of() : objectMapper.readValue(json, new TypeReference<List<String>>() {});
    }
}
