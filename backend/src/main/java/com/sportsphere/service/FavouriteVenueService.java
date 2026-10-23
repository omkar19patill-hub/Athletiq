package com.sportsphere.service;

import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.venue.VenueResponse;

public interface FavouriteVenueService {
    boolean toggleFavourite(String customerEmail, Long venueId);
    boolean isFavourite(String customerEmail, Long venueId);
    PagedResponse<VenueResponse> getCustomerFavourites(String customerEmail, int page, int size);
}
