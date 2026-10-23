package com.sportsphere.service.impl;

import com.sportsphere.dto.request.slot.BulkCreateSlotRequest;
import com.sportsphere.dto.response.slot.SlotResponse;
import com.sportsphere.entity.Court;
import com.sportsphere.entity.Venue;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.repository.CourtRepository;
import com.sportsphere.repository.SlotRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BulkSlotCreationTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();
    private static final LocalDate DAY = LocalDate.of(2030, 1, 7); // a Monday

    private final SlotRepository slots = mock(SlotRepository.class);
    private final CourtRepository courts = mock(CourtRepository.class);
    private final SlotServiceImpl service = new SlotServiceImpl(slots, courts);

    @BeforeEach
    void setUp() {
        Venue venue = Venue.builder().id(1L).name("V").build();
        Court court = Court.builder().id(2L).venue(venue).courtName("Ct").pricePerHour(BigDecimal.TEN).build();
        when(courts.findById(2L)).thenReturn(Optional.of(court));
        when(slots.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    }

    private static BulkCreateSlotRequest req(String start, String end, Integer minutes, LocalDate from, LocalDate to) {
        BulkCreateSlotRequest r = new BulkCreateSlotRequest();
        r.setCourtId(2L);
        r.setStartDate(from);
        r.setEndDate(to);
        r.setSlotStartTime(LocalTime.parse(start));
        r.setSlotEndTime(LocalTime.parse(end));
        r.setSlotDurationMinutes(minutes);
        return r;
    }

    private static Set<String> violations(BulkCreateSlotRequest r) {
        return VALIDATOR.validate(r).stream().map(ConstraintViolation::getMessage).collect(Collectors.toSet());
    }

    // ---- validation (what @Valid returns as 400) ----

    @Test
    void validRequestHasNoViolations() {
        assertTrue(violations(req("06:00", "22:00", 60, DAY, DAY.plusDays(6))).isEmpty());
    }

    @Test
    void durationOutside15to240IsRejected() {
        for (int bad : new int[]{0, -60, 14, 241, 1440}) {
            assertFalse(violations(req("06:00", "22:00", bad, DAY, DAY)).isEmpty(), "duration " + bad);
        }
        assertTrue(violations(req("06:00", "22:00", 15, DAY, DAY)).isEmpty());
        assertTrue(violations(req("06:00", "22:00", 240, DAY, DAY)).isEmpty());
    }

    @Test
    void endTimeMustBeAfterStartTime() {
        assertTrue(violations(req("22:00", "06:00", 60, DAY, DAY)).contains("Slot end time must be after slot start time"));
        assertTrue(violations(req("10:00", "10:00", 60, DAY, DAY)).contains("Slot end time must be after slot start time"));
    }

    @Test
    void dateRangeLimitedTo90DaysAndOrdered() {
        String msg = "End date must be on or after start date and the range at most 90 days";
        assertTrue(violations(req("06:00", "22:00", 60, DAY, DAY.plusDays(89))).isEmpty()); // 90 days inclusive
        assertTrue(violations(req("06:00", "22:00", 60, DAY, DAY.plusDays(90))).contains(msg));
        assertTrue(violations(req("06:00", "22:00", 60, DAY, DAY.minusDays(1))).contains(msg));
    }

    @Test
    void invalidDayOfWeekIsRejected() {
        BulkCreateSlotRequest r = req("06:00", "22:00", 60, DAY, DAY);
        r.setDaysOfWeek(List.of(0, 8));
        assertTrue(violations(r).contains("Day of week must be 1-7"));
    }

    // ---- generation always terminates (midnight boundaries) ----

    @Test
    @Timeout(5)
    void windowEndingAt2330DoesNotWrapPastMidnight() {
        // Old code: 23:00+60 = 00:00 which is "before" 23:30 -> infinite loop
        List<SlotResponse> out = service.bulkCreateSlots(req("22:00", "23:30", 60, DAY, DAY));
        assertEquals(1, out.size());
        assertEquals(LocalTime.of(22, 0), out.get(0).getStartTime());
        assertEquals(LocalTime.of(23, 0), out.get(0).getEndTime());
    }

    @Test
    @Timeout(5)
    void windowEndingAt2359FillsToTheLastWholeSlot() {
        List<SlotResponse> out = service.bulkCreateSlots(req("20:00", "23:59", 60, DAY, DAY));
        assertEquals(3, out.size()); // 20-21, 21-22, 22-23; 23:00-24:00 doesn't fit
        assertTrue(out.stream().allMatch(s -> s.getEndTime().isAfter(s.getStartTime())), "no slot may end after midnight");
    }

    @Test
    @Timeout(5)
    void fullDayWithShortestSlotsTerminates() {
        List<SlotResponse> out = service.bulkCreateSlots(req("00:00", "23:59", 15, DAY, DAY));
        assertEquals(95, out.size()); // 1439 / 15 = 95 whole slots
    }

    @Test
    void exactFitIncludesFinalSlotAndKeepsExistingBehaviour() {
        // Same result as before for the UI default: 06:00-22:00, 60 min -> 16 slots per day
        List<SlotResponse> out = service.bulkCreateSlots(req("06:00", "22:00", 60, DAY, DAY.plusDays(1)));
        assertEquals(32, out.size());
        assertEquals(LocalTime.of(21, 0), out.get(15).getStartTime());
        assertEquals(LocalTime.of(22, 0), out.get(15).getEndTime());
    }

    @Test
    void existingSlotsAreSkippedAndDaysOfWeekRespected() {
        when(slots.existsByCourtIdAndBookingDateAndStartTime(2L, DAY, LocalTime.of(6, 0))).thenReturn(true);
        BulkCreateSlotRequest r = req("06:00", "08:00", 60, DAY, DAY.plusDays(6));
        r.setDaysOfWeek(List.of(1)); // Mondays only -> just DAY
        List<SlotResponse> out = service.bulkCreateSlots(r);
        assertEquals(1, out.size());
        assertEquals(LocalTime.of(7, 0), out.get(0).getStartTime());
    }

    @Test
    @Timeout(5)
    void serviceGuardRejectsInvalidInputEvenWithoutBeanValidation() {
        assertThrows(BusinessException.class, () -> service.bulkCreateSlots(req("06:00", "22:00", 0, DAY, DAY)));
        assertThrows(BusinessException.class, () -> service.bulkCreateSlots(req("22:00", "06:00", 60, DAY, DAY)));
        assertThrows(BusinessException.class, () -> service.bulkCreateSlots(req("06:00", "22:00", 60, DAY, DAY.plusDays(365))));
        verify(slots, never()).saveAll(any());
    }
}
