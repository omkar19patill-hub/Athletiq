package com.sportsphere.service.impl;

import com.sportsphere.dto.request.slot.BulkCreateSlotRequest;
import com.sportsphere.dto.request.slot.CreateSlotRequest;
import com.sportsphere.dto.response.slot.SlotResponse;
import com.sportsphere.entity.Court;
import com.sportsphere.entity.Slot;
import com.sportsphere.entity.enums.SlotStatus;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.CourtRepository;
import com.sportsphere.repository.SlotRepository;
import com.sportsphere.service.SlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final CourtRepository courtRepository;

    @Override
    @Transactional
    public SlotResponse createSlot(CreateSlotRequest request) {
        Court court = getCourtEntity(request.getCourtId());

        if (slotRepository.existsByCourtIdAndBookingDateAndStartTime(
                court.getId(), request.getBookingDate(), request.getStartTime())) {
            throw new BusinessException("Slot already exists for this court at the specified date and time");
        }

        Slot slot = Slot.builder()
                .court(court)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .slotStatus(SlotStatus.AVAILABLE)
                .build();

        slot = slotRepository.save(slot);
        log.info("Slot created ID: {}", slot.getId());
        return toResponse(slot);
    }

    @Override
    @Transactional
    public List<SlotResponse> bulkCreateSlots(BulkCreateSlotRequest request) {
        // Controller @Valid already enforces these; repeat here so the loop always terminates
        // even if this method is called without bean validation.
        Integer duration = request.getSlotDurationMinutes();
        if (duration == null || duration < BulkCreateSlotRequest.MIN_DURATION_MINUTES
                || duration > BulkCreateSlotRequest.MAX_DURATION_MINUTES
                || !request.isTimeRangeValid() || !request.isDateRangeValid()
                || request.getSlotStartTime() == null || request.getStartDate() == null) {
            throw new BusinessException("Invalid bulk slot request");
        }

        Court court = getCourtEntity(request.getCourtId());

        // Minutes since midnight: plain int arithmetic, so no LocalTime wrap-around past 24:00
        int windowStart = request.getSlotStartTime().toSecondOfDay() / 60;
        int windowEnd = request.getSlotEndTime().toSecondOfDay() / 60;

        List<Slot> createdSlots = new ArrayList<>();
        LocalDate currentDate = request.getStartDate();

        while (!currentDate.isAfter(request.getEndDate())) {
            int dayOfWeek = currentDate.getDayOfWeek().getValue(); // 1=Mon, 7=Sun

            if (request.getDaysOfWeek() == null || request.getDaysOfWeek().isEmpty() || request.getDaysOfWeek().contains(dayOfWeek)) {
                for (int startMin = windowStart; startMin + duration <= windowEnd; startMin += duration) {
                    LocalTime currentStartTime = LocalTime.ofSecondOfDay(startMin * 60L);
                    LocalTime currentEndTime = LocalTime.ofSecondOfDay((startMin + duration) * 60L);

                    boolean exists = slotRepository.existsByCourtIdAndBookingDateAndStartTime(
                            court.getId(), currentDate, currentStartTime);

                    if (!exists) {
                        Slot slot = Slot.builder()
                                .court(court)
                                .bookingDate(currentDate)
                                .startTime(currentStartTime)
                                .endTime(currentEndTime)
                                .slotStatus(SlotStatus.AVAILABLE)
                                .build();
                        createdSlots.add(slot);
                    }
                }
            }

            currentDate = currentDate.plusDays(1);
        }

        List<Slot> savedSlots = slotRepository.saveAll(createdSlots);
        log.info("Bulk created {} slots for court ID {}", savedSlots.size(), court.getId());
        return savedSlots.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByCourtAndDate(Long courtId, LocalDate date) {
        if (!courtRepository.existsById(courtId)) {
            throw new ResourceNotFoundException("Court", "id", courtId);
        }
        return slotRepository.findByCourtIdAndBookingDateOrderByStartTime(courtId, date)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SlotResponse blockSlot(Long slotId) {
        Slot slot = getSlotEntity(slotId);
        if (slot.getSlotStatus() == SlotStatus.BOOKED) {
            throw new BusinessException("Cannot block a booked slot");
        }
        slot.setSlotStatus(SlotStatus.BLOCKED);
        return toResponse(slotRepository.save(slot));
    }

    @Override
    @Transactional
    public SlotResponse unblockSlot(Long slotId) {
        Slot slot = getSlotEntity(slotId);
        if (slot.getSlotStatus() == SlotStatus.BLOCKED) {
            slot.setSlotStatus(SlotStatus.AVAILABLE);
        }
        return toResponse(slotRepository.save(slot));
    }

    @Override
    @Transactional
    public void deleteSlot(Long slotId) {
        Slot slot = getSlotEntity(slotId);
        if (slot.getSlotStatus() == SlotStatus.BOOKED) {
            throw new BusinessException("Cannot delete a booked slot");
        }
        slotRepository.delete(slot);
        log.info("Slot deleted ID: {}", slotId);
    }

    private Court getCourtEntity(Long courtId) {
        return courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court", "id", courtId));
    }

    private Slot getSlotEntity(Long slotId) {
        return slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot", "id", slotId));
    }

    private SlotResponse toResponse(Slot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .courtId(slot.getCourt().getId())
                .courtName(slot.getCourt().getCourtName())
                .venueId(slot.getCourt().getVenue().getId())
                .venueName(slot.getCourt().getVenue().getName())
                .bookingDate(slot.getBookingDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .slotStatus(slot.getSlotStatus())
                .createdAt(slot.getCreatedAt())
                .build();
    }
}
