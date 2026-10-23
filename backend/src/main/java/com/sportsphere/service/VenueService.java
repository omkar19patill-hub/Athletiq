package com.sportsphere.service;

import com.sportsphere.dto.request.venue.CreateVenueRequest;
import com.sportsphere.dto.request.venue.UpdateVenueRequest;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.venue.VenueResponse;

import java.util.List;

public interface VenueService {
    VenueResponse createVenue(CreateVenueRequest request);
    VenueResponse updateVenue(Long id, UpdateVenueRequest request);
    VenueResponse getVenueById(Long id);
    PagedResponse<VenueResponse> getAllVenues(int page, int size, String sortBy, String sortDir);
    PagedResponse<VenueResponse> searchVenues(String city, String sport, Double minPrice, Double maxPrice,
                                               Double minRating, String keyword, int page, int size, String sortBy, String sortDir);
    List<VenueResponse> getFeaturedVenues();
    List<String> getAvailableCities();
    void deleteVenue(Long id);
}
