-- ============================================================================
-- SportSphere Multi-Venue Sports Turf Booking Platform
-- Complete Database Schema DDL Script (MySQL 8.0+)
-- Safe to re-run: creates only missing tables and never drops or alters existing ones.
-- To wipe a LOCAL development database, use reset_dev.sql (destructive).
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sportsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sportsphere_db;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    phone         VARCHAR(15)  NOT NULL UNIQUE,
    role          ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    profile_image VARCHAR(500),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    is_blocked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: refresh_tokens
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token       VARCHAR(512)    NOT NULL UNIQUE,
    expiry_date TIMESTAMP       NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rt_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: venues
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS venues (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    description TEXT,
    address     VARCHAR(300)    NOT NULL,
    city        VARCHAR(100)    NOT NULL,
    state       VARCHAR(100)    NOT NULL,
    pincode     VARCHAR(10)     NOT NULL,
    latitude    DECIMAL(10, 8),
    longitude   DECIMAL(11, 8),
    status      ENUM('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_venues_city   (city),
    INDEX idx_venues_status (status),
    INDEX idx_venues_name   (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: venue_images
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS venue_images (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    venue_id   BIGINT UNSIGNED NOT NULL,
    image_url  VARCHAR(500)    NOT NULL,
    is_primary BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_vi_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    INDEX idx_vi_venue (venue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table: courts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courts (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    venue_id       BIGINT UNSIGNED NOT NULL,
    court_name     VARCHAR(100)    NOT NULL,
    sport_type     ENUM('FOOTBALL', 'CRICKET', 'BADMINTON', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'OTHER') NOT NULL,
    price_per_hour DECIMAL(10, 2)  NOT NULL,
    status         ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_courts_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    INDEX idx_courts_venue      (venue_id),
    INDEX idx_courts_sport_type (sport_type),
    INDEX idx_courts_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table: slots
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slots (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    court_id     BIGINT UNSIGNED NOT NULL,
    booking_date DATE            NOT NULL,
    start_time   TIME            NOT NULL,
    end_time     TIME            NOT NULL,
    slot_status  ENUM('AVAILABLE', 'BOOKED', 'BLOCKED', 'EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_slots_court   FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    CONSTRAINT uq_slot_time     UNIQUE (court_id, booking_date, start_time),
    INDEX idx_slots_court       (court_id),
    INDEX idx_slots_date        (booking_date),
    INDEX idx_slots_status      (slot_status),
    INDEX idx_slots_date_status (booking_date, slot_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table: bookings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_number      VARCHAR(20)     NOT NULL UNIQUE,
    customer_id         BIGINT UNSIGNED NOT NULL,
    slot_id             BIGINT UNSIGNED NOT NULL,  -- not UNIQUE: cancelled bookings keep their slot_id, and one active booking per slot is enforced in the app
    booking_status      ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') NOT NULL DEFAULT 'PENDING',
    payment_status      ENUM('PENDING', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    refund_amount       DECIMAL(10, 2)  DEFAULT 0.00,
    total_amount        DECIMAL(10, 2)  NOT NULL,
    booked_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at        TIMESTAMP       NULL,
    cancellation_reason VARCHAR(500)    NULL,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_slot     FOREIGN KEY (slot_id)     REFERENCES slots(id) ON DELETE RESTRICT,
    INDEX idx_bookings_customer     (customer_id),
    INDEX idx_bookings_slot         (slot_id),
    INDEX idx_bookings_status       (booking_status),
    INDEX idx_bookings_number       (booking_number),
    INDEX idx_bookings_booked_at    (booked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table: booking_requirements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_requirements (
    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id           BIGINT UNSIGNED NOT NULL UNIQUE,
    occasion             ENUM('PRACTICE', 'FRIENDLY_MATCH', 'TOURNAMENT', 'CORPORATE_EVENT', 'BIRTHDAY', 'OTHER') NOT NULL,
    players_count        INT             NOT NULL DEFAULT 1,
    equipment_required   JSON            NULL,
    preparation_required JSON            NULL,
    additional_notes     TEXT            NULL,
    preparation_status   ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_br_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_br_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table: reviews
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    venue_id    BIGINT UNSIGNED NOT NULL,
    rating      TINYINT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review      TEXT            NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_venue    FOREIGN KEY (venue_id)    REFERENCES venues(id) ON DELETE CASCADE,
    CONSTRAINT uq_review_customer_venue UNIQUE (customer_id, venue_id),
    INDEX idx_reviews_venue   (venue_id),
    INDEX idx_reviews_rating  (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Table: favourite_venues
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favourite_venues (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    venue_id    BIGINT UNSIGNED NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fv_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fv_venue    FOREIGN KEY (venue_id)    REFERENCES venues(id) ON DELETE CASCADE,
    CONSTRAINT uq_fv_customer_venue UNIQUE (customer_id, venue_id),
    INDEX idx_fv_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
