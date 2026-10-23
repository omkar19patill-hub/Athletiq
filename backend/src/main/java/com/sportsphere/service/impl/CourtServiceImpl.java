package com.sportsphere.service.impl;

import com.sportsphere.dto.request.court.CreateCourtRequest;
import com.sportsphere.dto.request.court.UpdateCourtRequest;
import com.sportsphere.dto.response.court.CourtResponse;
import com.sportsphere.entity.Court;
import com.sportsphere.entity.Venue;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.CourtRepository;
import com.sportsphere.repository.VenueRepository;
import com.sportsphere.service.CourtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourtServiceImpl implements CourtService {

    private final CourtRepository courtRepository;
    private final VenueRepository venueRepository;

    @Override
    @Transactional
    public CourtResponse createCourt(CreateCourtRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", request.getVenueId()));

        Court court = Court.builder()
                .venue(venue)
                .courtName(request.getCourtName())
                .sportType(request.getSportType())
                .pricePerHour(request.getPricePerHour())
                .build();

        court = courtRepository.save(court);
        log.info("Court created: {} for venue: {}", court.getCourtName(), venue.getName());
        return toResponse(court);
    }

    @Override
    @Transactional
    public CourtResponse updateCourt(Long id, UpdateCourtRequest request) {
        Court court = getCourtEntity(id);

        if (request.getCourtName() != null) court.setCourtName(request.getCourtName());
        if (request.getSportType() != null) court.setSportType(request.getSportType());
        if (request.getPricePerHour() != null) court.setPricePerHour(request.getPricePerHour());
        if (request.getStatus() != null) court.setStatus(request.getStatus());

        return toResponse(courtRepository.save(court));
    }

    @Override
    @Transactional(readOnly = true)
    public CourtResponse getCourtById(Long id) {
        return toResponse(getCourtEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourtResponse> getCourtsByVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new ResourceNotFoundException("Venue", "id", venueId);
        }
        return courtRepository.findByVenueId(venueId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCourt(Long id) {
        Court court = getCourtEntity(id);
        courtRepository.delete(court);
        log.info("Court deleted: id={}", id);
    }

    private Court getCourtEntity(Long id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Court", "id", id));
    }

    public CourtResponse toResponse(Court court) {
        return CourtResponse.builder()
                .id(court.getId())
                .venueId(court.getVenue().getId())
                .venueName(court.getVenue().getName())
                .courtName(court.getCourtName())
                .sportType(court.getSportType())
                .pricePerHour(court.getPricePerHour())
                .status(court.getStatus())
                .createdAt(court.getCreatedAt())
                .build();
    }
}
