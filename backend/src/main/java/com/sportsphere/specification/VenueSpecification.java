package com.sportsphere.specification;

import com.sportsphere.entity.Court;
import com.sportsphere.entity.Venue;
import com.sportsphere.entity.enums.VenueStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class VenueSpecification {

    private VenueSpecification() {}

    public static Specification<Venue> buildSearchSpec(String city, String sport,
                                                        Double minPrice, Double maxPrice,
                                                        String keyword) {
        return buildSearchSpec(city, null, sport, minPrice, maxPrice, keyword);
    }

    public static Specification<Venue> buildSearchSpec(String city, String pincode, String sport,
                                                        Double minPrice, Double maxPrice,
                                                        String keyword) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter active venues
            predicates.add(criteriaBuilder.equal(root.get("status"), VenueStatus.ACTIVE));

            if (StringUtils.hasText(city)) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("city")),
                        "%" + city.toLowerCase().trim() + "%"
                ));
            }

            if (StringUtils.hasText(pincode)) {
                predicates.add(criteriaBuilder.like(
                        root.get("pincode"),
                        "%" + pincode.trim() + "%"
                ));
            }

            if (StringUtils.hasText(keyword)) {
                String kw = keyword.toLowerCase().trim();
                Predicate nameLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + kw + "%"
                );
                Predicate descLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        "%" + kw + "%"
                );
                Predicate addrLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("address")),
                        "%" + kw + "%"
                );
                Predicate cityLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("city")),
                        "%" + kw + "%"
                );
                Predicate pinLike = criteriaBuilder.like(
                        root.get("pincode"),
                        "%" + kw + "%"
                );
                predicates.add(criteriaBuilder.or(nameLike, descLike, addrLike, cityLike, pinLike));
            }

            if (StringUtils.hasText(sport)) {
                Subquery<Long> courtSubquery = query.subquery(Long.class);
                Root<Court> courtRoot = courtSubquery.from(Court.class);
                courtSubquery.select(courtRoot.get("venue").get("id"))
                        .where(criteriaBuilder.equal(
                                criteriaBuilder.lower(courtRoot.get("sportType").as(String.class)),
                                sport.toLowerCase()
                        ));
                predicates.add(root.get("id").in(courtSubquery));
            }

            if (minPrice != null) {
                Subquery<Long> minPriceSubquery = query.subquery(Long.class);
                Root<Court> courtRoot = minPriceSubquery.from(Court.class);
                minPriceSubquery.select(courtRoot.get("venue").get("id"))
                        .where(criteriaBuilder.greaterThanOrEqualTo(
                                courtRoot.get("pricePerHour"), minPrice
                        ));
                predicates.add(root.get("id").in(minPriceSubquery));
            }

            if (maxPrice != null) {
                Subquery<Long> maxPriceSubquery = query.subquery(Long.class);
                Root<Court> courtRoot = maxPriceSubquery.from(Court.class);
                maxPriceSubquery.select(courtRoot.get("venue").get("id"))
                        .where(criteriaBuilder.lessThanOrEqualTo(
                                courtRoot.get("pricePerHour"), maxPrice
                        ));
                predicates.add(root.get("id").in(maxPriceSubquery));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
