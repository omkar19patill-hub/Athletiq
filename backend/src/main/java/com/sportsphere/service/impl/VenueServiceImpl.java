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
import com.sportsphere.service.VenueService;
import com.sportsphere.specification.VenueSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final ReviewRepository reviewRepository;

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
    public PagedResponse<VenueResponse> searchVenues(String city, String sport, Double minPrice, Double maxPrice,
                                                      Double minRating, String keyword,
                                                      int page, int size, String sortBy, String sortDir) {
        Specification<Venue> spec = VenueSpecification.buildSearchSpec(city, sport, minPrice, maxPrice, keyword);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Venue> venuePage = venueRepository.findAll(spec, pageable);
        return toPagedResponse(venuePage);
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
