# SportSphere Database Scripts

This directory contains standalone SQL scripts for the **SportSphere** MySQL database.

---

## Files Included

1. [`schema.sql`](schema.sql) — Creates the database `sportsphere_db` and all 10 tables with indexes and constraints.
   **Safe to re-run:** it uses `CREATE ... IF NOT EXISTS` only and never drops or alters existing tables or data.
2. [`reset_dev.sql`](reset_dev.sql) — ⚠️ **Destructive, local development only.** Drops all 10 tables and their data.
   Never run it against a shared, staging or production database. Back up first.
3. [`seed.sql`](seed.sql) — Legacy seed script (users, venues, courts, reviews only — **no slots**). Not recommended; see below.

---

## Recommended setup (development)

Demo data is created by the backend's `DataSeeder`. It runs **only** when all of these are true:

- the `dev` Spring profile is active (`SPRING_PROFILES_ACTIVE=dev`),
- `DEMO_ADMIN_PASSWORD` and `DEMO_CUSTOMER_PASSWORD` are set (at least 8 characters each, no defaults),
- the database is empty (no users).

If either password is missing or too short, seeding is skipped with a warning and the app still starts.
Without the `dev` profile (e.g. production) the seeder is never loaded, so no demo accounts are ever created.

It creates the demo accounts, venues, courts, a week of future bookable slots, reviews and a sample booking.

1. Make sure MySQL is running on `localhost:3306`.
2. Add the dev-only values to your private env file (outside the project, never committed), e.g.
   `~/.config/athletiq/backend.env`:
   ```bash
   export SPRING_PROFILES_ACTIVE=dev
   export DEMO_ADMIN_PASSWORD='choose-a-local-password'
   export DEMO_CUSTOMER_PASSWORD='choose-another-local-password'
   ```
3. `source` that file and start the backend (with `DB_PASSWORD` and `JWT_SECRET` also set).
   `createDatabaseIfNotExist=true` and `ddl-auto: update` create the database and tables.

The demo passwords only apply when a **new, empty** database is seeded. They do not change passwords of
accounts that already exist.

**Do not run `seed.sql` before the first startup:** once any user exists, `DataSeeder` skips seeding entirely,
leaving a database with no slots and nothing bookable.

---

## Manual setup

```bash
mysql -u root -p < database/schema.sql      # safe: only creates what is missing
```

To start over on a **local development** database only:

```bash
mysqldump -u root -p sportsphere_db > sportsphere_backup.sql   # optional backup
mysql -u root -p < database/reset_dev.sql   # DESTRUCTIVE: drops all tables
mysql -u root -p < database/schema.sql
```
Then start the backend with the `dev` profile so `DataSeeder` fills in the demo data.

---

## Demo Accounts (dev profile only)

| Role | Email |
|---|---|
| **ADMIN** | `admin@sportsphere.com` |
| **CUSTOMER** | `customer@sportsphere.com` |

Passwords are whatever you set in `DEMO_ADMIN_PASSWORD` / `DEMO_CUSTOMER_PASSWORD` when the database was first seeded.
