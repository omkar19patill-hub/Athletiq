package com.sportsphere.service.impl;

import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.venue.VenueResponse;
import com.sportsphere.entity.FavouriteVenue;
import com.sportsphere.entity.User;
import com.sportsphere.entity.Venue;
import com.sportsphere.exception.ResourceNotFoundException;
import com.sportsphere.repository.FavouriteVenueRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.repository.VenueRepository;
import com.sportsphere.service.FavouriteVenueService;
import com.sportsphere.service.VenueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavouriteVenueServiceImpl implements FavouriteVenueService {

    private final FavouriteVenueRepository favouriteRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final VenueService venueService;

    @Override
    @Transactional
    public boolean toggleFavourite(String customerEmail, Long venueId) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", venueId));

        Optional<FavouriteVenue> existing = favouriteRepository.findByCustomerIdAndVenueId(customer.getId(), venue.getId());

        if (existing.isPresent()) {
            favouriteRepository.delete(existing.get());
            log.info("Removed venue ID {} from favourites of {}", venueId, customerEmail);
            return false;
        } else {
            FavouriteVenue fav = FavouriteVenue.builder()
                    .customer(customer)
                    .venue(venue)
                    .build();
            favouriteRepository.save(fav);
            log.info("Added venue ID {} to favourites of {}", venueId, customerEmail);
            return true;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavourite(String customerEmail, Long venueId) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));
        return favouriteRepository.existsByCustomerIdAndVenueId(customer.getId(), venueId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<VenueResponse> getCustomerFavourites(String customerEmail, int page, int size) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        Pageable pageable = PageRequest.of(page, size);
        Page<FavouriteVenue> favPage = favouriteRepository.findByCustomerId(customer.getId(), pageable);

        List<VenueResponse> content = favPage.getContent().stream()
                .map(fav -> venueService.getVenueById(fav.getVenue().getId()))
                .collect(Collectors.toList());

        return PagedResponse.<VenueResponse>builder()
                .content(content)
                .pageNumber(favPage.getNumber())
                .pageSize(favPage.getSize())
                .totalElements(favPage.getTotalElements())
                .totalPages(favPage.getTotalPages())
                .last(favPage.isLast())
                .build();
    }
}
