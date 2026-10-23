package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.dto.request.slot.BulkCreateSlotRequest;
import com.sportsphere.dto.request.slot.CreateSlotRequest;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.slot.SlotResponse;
import com.sportsphere.service.SlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(ApiConstants.SLOTS)
@RequiredArgsConstructor
@Tag(name = "Slots", description = "Endpoints for managing court availability time slots")
public class SlotController {

    private final SlotService slotService;

    @GetMapping("/court/{courtId}")
    @Operation(summary = "Get available slots for a court on a specific date")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlotsByCourtAndDate(
            @PathVariable Long courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Slots retrieved successfully",
                slotService.getSlotsByCourtAndDate(courtId, date)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a single slot (Admin only)")
    public ResponseEntity<ApiResponse<SlotResponse>> createSlot(@Valid @RequestBody CreateSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot created successfully", slotService.createSlot(request)));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk generate time slots for a date range (Admin only)")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> bulkCreateSlots(@Valid @RequestBody BulkCreateSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bulk slots generated successfully", slotService.bulkCreateSlots(request)));
    }

    @PatchMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Block a slot from booking (Admin only)")
    public ResponseEntity<ApiResponse<SlotResponse>> blockSlot(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Slot blocked successfully", slotService.blockSlot(id)));
    }

    @PatchMapping("/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unblock a slot (Admin only)")
    public ResponseEntity<ApiResponse<SlotResponse>> unblockSlot(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Slot unblocked successfully", slotService.unblockSlot(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a slot (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted successfully"));
    }
}
