package com.sportsphere.service;

import com.sportsphere.dto.request.court.CreateCourtRequest;
import com.sportsphere.dto.request.court.UpdateCourtRequest;
import com.sportsphere.dto.response.court.CourtResponse;

import java.util.List;

public interface CourtService {
    CourtResponse createCourt(CreateCourtRequest request);
    CourtResponse updateCourt(Long id, UpdateCourtRequest request);
    CourtResponse getCourtById(Long id);
    List<CourtResponse> getCourtsByVenue(Long venueId);
    void deleteCourt(Long id);
}
