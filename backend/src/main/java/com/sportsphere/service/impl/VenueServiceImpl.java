package com.sportsphere.service.impl;

import com.sportsphere.dto.request.venue.CreateVenueRequest;
import com.sportsphere.dto.request.venue.UpdateVenueRequest;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.venue.VenueResponse;
import com.sportsphere.entity.Venue;
import com.sportsphere.entity.VenueImage;
import com.sportsphere.entity.enums.VenueStatus;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.ReviewRepository;
import com.sportsphere.repository.VenueRepository;
import com.sportsphere.service.PincodeLocationService;
import com.sportsphere.service.VenueService;
import com.sportsphere.specification.VenueSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final ReviewRepository reviewRepository;
    private final PincodeLocationService pincodeLocationService;

    @Override
    @Transactional
    public VenueResponse createVenue(CreateVenueRequest request) {
        Venue venue = Venue.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(VenueStatus.ACTIVE)
                .build();

        if (request.getImageUrls() != null) {
            boolean firstImage = true;
            for (String url : request.getImageUrls()) {
                VenueImage image = VenueImage.builder()
                        .venue(venue)
                        .imageUrl(url)
                        .isPrimary(firstImage)
                        .build();
                venue.getImages().add(image);
                firstImage = false;
            }
        }

        venue = venueRepository.save(venue);
        log.info("Venue created: {}", venue.getName());
        return toResponse(venue);
    }

    @Override
    @Transactional
    public VenueResponse updateVenue(Long id, UpdateVenueRequest request) {
        Venue venue = getVenueEntity(id);

        if (request.getName() != null) venue.setName(request.getName());
        if (request.getDescription() != null) venue.setDescription(request.getDescription());
        if (request.getAddress() != null) venue.setAddress(request.getAddress());
        if (request.getCity() != null) venue.setCity(request.getCity());
        if (request.getState() != null) venue.setState(request.getState());
        if (request.getPincode() != null) venue.setPincode(request.getPincode());
        if (request.getLatitude() != null) venue.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) venue.setLongitude(request.getLongitude());
        if (request.getStatus() != null) venue.setStatus(request.getStatus());

        if (request.getImageUrls() != null) {
            venue.getImages().clear();
            boolean firstImage = true;
            for (String url : request.getImageUrls()) {
                VenueImage image = VenueImage.builder()
                        .venue(venue)
                        .imageUrl(url)
                        .isPrimary(firstImage)
                        .build();
                venue.getImages().add(image);
                firstImage = false;
            }
        }

        return toResponse(venueRepository.save(venue));
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse getVenueById(Long id) {
        return toResponse(getVenueEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<VenueResponse> getAllVenues(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Venue> venuePage = venueRepository.findAll(pageable);
        return toPagedResponse(venuePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<VenueResponse> searchVenues(String city, String pincode, String sport, Double minPrice, Double maxPrice,
                                                      Double minRating, String keyword,
                                                      int page, int size, String sortBy, String sortDir) {
        // If pincode is provided, perform real-time geographical proximity resolution!
        if (StringUtils.hasText(pincode)) {
            Optional<PincodeLocationService.PincodeInfo> pinOpt = pincodeLocationService.resolvePincode(pincode);
            if (pinOpt.isPresent()) {
                PincodeLocationService.PincodeInfo pinInfo = pinOpt.get();
                // Find all venues matching sport, price, rating, keyword
                Specification<Venue> spec = VenueSpecification.buildSearchSpec(null, null, sport, minPrice, maxPrice, keyword);
                List<Venue> allMatching = venueRepository.findAll(spec);

                List<VenueResponse> scored = allMatching.stream()
                        .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                        .map(v -> {
                            double dist = calculateHaversineDistance(pinInfo.latitude(), pinInfo.longitude(), v.getLatitude(), v.getLongitude());
                            if (pinInfo.pincode().equalsIgnoreCase(v.getPincode())) {
                                dist = 0.0;
                            }
                            VenueResponse resp = toResponse(v);
                            resp.setDistanceKm(dist);
                            return resp;
                        })
                        .collect(Collectors.toList());
                // Sort by distance ascending: closest to this PIN first
                scored.sort(Comparator.comparing(v -> v.getDistanceKm() != null ? v.getDistanceKm() : 9999.0));

                // If venues exist within 60 km radius (same metro area), restrict to them
                List<VenueResponse> localVenues = scored.stream()
                        .filter(v -> v.getDistanceKm() != null && v.getDistanceKm() <= 60.0)
                        .collect(Collectors.toList());
                List<VenueResponse> finalResults = localVenues.isEmpty() ? scored : localVenues;

                int totalElements = finalResults.size();
                int pageSize = size > 0 ? size : 9;
                int fromIndex = Math.min(page * pageSize, totalElements);
                int toIndex = Math.min(fromIndex + pageSize, totalElements);
                List<VenueResponse> pagedContent = finalResults.subList(fromIndex, toIndex);

                return PagedResponse.<VenueResponse>builder()
                        .content(pagedContent)
                        .pageNumber(page)
                        .pageSize(pageSize)
                        .totalElements((long) totalElements)
                        .totalPages((int) Math.ceil((double) totalElements / pageSize))
                        .last(toIndex >= totalElements)
                        .build();
            }
        }

        Specification<Venue> spec = VenueSpecification.buildSearchSpec(city, pincode, sport, minPrice, maxPrice, keyword);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Venue> venuePage = venueRepository.findAll(spec, pageable);

        if (minRating != null && minRating > 0) {
            List<VenueResponse> filtered = venuePage.getContent().stream()
                    .map(this::toResponse)
                    .filter(v -> v.getAverageRating() != null && v.getAverageRating() >= minRating)
                    .collect(Collectors.toList());
            return PagedResponse.<VenueResponse>builder()
                    .content(filtered)
                    .pageNumber(venuePage.getNumber())
                    .pageSize(venuePage.getSize())
                    .totalElements((long) filtered.size())
                    .totalPages(filtered.isEmpty() ? 0 : 1)
                    .last(true)
                    .build();
        }

        return toPagedResponse(venuePage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> getNearbyVenues(Double latitude, Double longitude, Double radiusKm) {
        if (latitude == null || longitude == null) {
            return Collections.emptyList();
        }
        double radius = (radiusKm != null && radiusKm > 0) ? radiusKm : 25.0; // default 25 km

        List<Venue> activeVenues = venueRepository.findByStatus(VenueStatus.ACTIVE);
        return activeVenues.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .map(v -> {
                    double dist = calculateHaversineDistance(latitude, longitude, v.getLatitude(), v.getLongitude());
                    VenueResponse res = toResponse(v);
                    res.setDistanceKm(dist);
                    return res;
                })
                .filter(res -> res.getDistanceKm() <= radius)
                .sorted(Comparator.comparing(VenueResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100.0) / 100.0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> getFeaturedVenues() {
        return venueRepository.findTop6ByStatusOrderByCreatedAtDesc(VenueStatus.ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableCities() {
        return venueRepository.findDistinctCities();
    }

    @Override
    @Transactional
    public void deleteVenue(Long id) {
        Venue venue = getVenueEntity(id);
        venueRepository.delete(venue);
        log.info("Venue deleted: id={}", id);
    }

    private Venue getVenueEntity(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
    }

    private VenueResponse toResponse(Venue venue) {
        Double avgRating = reviewRepository.findAverageRatingByVenueId(venue.getId());
        long totalReviews = reviewRepository.countByVenueId(venue.getId());

        List<String> imageUrls = venue.getImages().stream()
                .map(VenueImage::getImageUrl)
                .collect(Collectors.toList());

        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .description(venue.getDescription())
                .address(venue.getAddress())
                .city(venue.getCity())
                .state(venue.getState())
                .pincode(venue.getPincode())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .status(venue.getStatus())
                .imageUrls(imageUrls)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                .totalReviews(totalReviews)
                .totalCourts((long) venue.getCourts().size())
                .createdAt(venue.getCreatedAt())
                .build();
    }

    private PagedResponse<VenueResponse> toPagedResponse(Page<Venue> page) {
        List<VenueResponse> content = page.getContent().stream()
                .map(this::toResponse).collect(Collectors.toList());
        return PagedResponse.<VenueResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
