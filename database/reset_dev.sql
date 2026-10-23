-- ============================================================================
-- !!! DESTRUCTIVE — LOCAL DEVELOPMENT ONLY !!!
-- Drops ALL application tables in sportsphere_db and every row in them.
-- Never run against a shared, staging or production database.
-- Back up first if there is anything you might want to keep:
--   mysqldump -u root -p sportsphere_db > sportsphere_backup.sql
--
-- Typical use (wipe, recreate, let the backend's dev DataSeeder repopulate):
--   mysql -u root -p < database/reset_dev.sql
--   mysql -u root -p < database/schema.sql
-- ============================================================================

USE sportsphere_db;

-- Reverse order of foreign key dependencies
DROP TABLE IF EXISTS favourite_venues;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS booking_requirements;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS slots;
DROP TABLE IF EXISTS courts;
DROP TABLE IF EXISTS venue_images;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
