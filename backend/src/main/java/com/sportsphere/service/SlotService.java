package com.sportsphere.service;

import com.sportsphere.dto.request.slot.BulkCreateSlotRequest;
import com.sportsphere.dto.request.slot.CreateSlotRequest;
import com.sportsphere.dto.response.slot.SlotResponse;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {
    SlotResponse createSlot(CreateSlotRequest request);
    List<SlotResponse> bulkCreateSlots(BulkCreateSlotRequest request);
    List<SlotResponse> getSlotsByCourtAndDate(Long courtId, LocalDate date);
    SlotResponse blockSlot(Long slotId);
    SlotResponse unblockSlot(Long slotId);
    void deleteSlot(Long slotId);
}
