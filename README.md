<p align="center">
  <img src="frontend/src/public/Logo/Logo.png" alt="ATHLETIQ — Play More. Plan Less." width="100%">
</p>

# ATHLETIQ

**Play More. Plan Less.**

ATHLETIQ is a web app for booking sports venues by the hour. Players find a badminton court, football turf or cricket ground, pick a free time slot and book it. Admins manage venues, courts, slots, users and bookings from a dashboard.

![Java 17](https://img.shields.io/badge/Java-17-orange)
![Spring Boot 3.3](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen)
![React 18](https://img.shields.io/badge/React-18-61dafb)
![MySQL 8](https://img.shields.io/badge/MySQL-8-blue)

> **Status: work in progress.** The project is being repaired and rebranded (it was first called SportSphere). Payments are simulated. Do not deploy it publicly yet.

<!-- Add screenshots here, for example: ![Home page](docs/screenshots/home.png) -->

---

## Features

**For players (customers)**
- Browse and search venues, filter by city
- See courts, prices and free slots for any date
- Book a slot and tell the venue what you need (occasion, number of players, equipment, preparation)
- Cancel a booking with an automatic refund amount (see rules below)
- Save favourite venues, rate and review venues
- Download a PDF booking receipt
- Personal dashboard and profile page

**For admins**
- Dashboard with revenue, bookings per day, popular sports and peak hours
- Create and edit venues and courts
- Create slots one by one or in bulk, block and unblock slots
- View all bookings, block or delete users

**Refund rules on cancellation**

| Time left before the slot starts | Refund |
| --- | --- |
| More than 24 hours | 100% |
| 6 to 24 hours | 50% |
| Less than 6 hours | 0% |

Supported sports: football, cricket, badminton, basketball, tennis, volleyball and other.

---

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS, React Router 6, Axios, React Query, Recharts, Framer Motion, jsPDF |
| Backend | Java 17, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security, JWT (jjwt), Bean Validation, springdoc (Swagger UI), Lombok, Maven |
| Database | MySQL 8 |

---

## Project structure

```text
.
├── backend/                 Spring Boot API
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/sportsphere/
│       │   ├── controller/      REST endpoints
│       │   ├── service/         business logic (+ impl/)
│       │   ├── repository/      database access
│       │   ├── entity/          JPA entities and enums
│       │   ├── dto/             request and response classes
│       │   ├── security/        JWT filter, security rules
│       │   ├── config/          CORS, OpenAPI, demo data seeder
│       │   └── exception/       error handling
│       └── resources/application.yml
├── frontend/                React app
│   ├── src/
│   │   ├── api/             Axios setup (token refresh)
│   │   ├── services/        API calls
│   │   ├── context/         login state
│   │   ├── routes/          page routes
│   │   ├── features/        auth, venue, booking, dashboards
│   │   ├── components/      shared UI
│   │   └── pages/           landing, profile
│   └── vite.config.js
└── database/                reference SQL scripts (schema.sql, seed.sql)
```

> The Java package is still named `com.sportsphere` and the database is still called `sportsphere_db`. These will be renamed in the rebrand.

---

## Getting started

### What you need

- JDK 17 or newer
- Maven 3.9 or newer
- Node.js 18 or newer
- MySQL 8 running on `localhost:3306`

Check your versions:

```bash
java -version
mvn -v
node -v
mysql --version
```

### 1. Clone

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Start the backend

The backend reads its database login and signing key from `backend/src/main/resources/application.yml`. Do not commit real passwords. Override them with environment variables instead:

| Environment variable | What it sets |
| --- | --- |
| `SPRING_DATASOURCE_URL` | JDBC URL, for example `jdbc:mysql://localhost:3306/sportsphere_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `SPRING_DATASOURCE_USERNAME` | MySQL user |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password |
| `APPLICATION_JWT_SECRET` | Secret used to sign login tokens. Use a long random value (at least 32 characters) |
| `APPLICATION_CORS_ALLOWED_ORIGINS` | Frontend address, default `http://localhost:5173` |

Example (macOS / Linux):

```bash
cd backend
export SPRING_DATASOURCE_USERNAME=your_mysql_user
export SPRING_DATASOURCE_PASSWORD=your_mysql_password
export APPLICATION_JWT_SECRET="$(openssl rand -base64 48)"
mvn spring-boot:run
```

On Windows PowerShell use `$env:SPRING_DATASOURCE_PASSWORD = "..."` instead of `export`.

The API runs on **http://localhost:8080**. On the first start:
- Hibernate creates the tables automatically.
- A demo data seeder adds sample venues, courts, slots, and two demo accounts (one admin, one customer). Their emails are printed in the backend log.

You do not need to run the SQL files in `database/` for a normal start.

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173**. During development Vite forwards `/api` calls to `http://localhost:8080`, so both must be running.

### 4. Explore the API

Swagger UI: **http://localhost:8080/swagger-ui.html**

---

## Useful commands

| Task | Command (folder) |
| --- | --- |
| Run backend | `mvn spring-boot:run` (`backend/`) |
| Build backend jar | `mvn -B clean package -DskipTests` (`backend/`) |
| Run backend tests | `mvn -B test` (`backend/`) |
| Run frontend | `npm run dev` (`frontend/`) |
| Build frontend | `npm run build` (`frontend/`) |
| Preview built frontend | `npm run preview` (`frontend/`) |

---

## API overview

All endpoints start with `/api/v1`.

| Area | Path | Who can use it |
| --- | --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/logout` | Everyone |
| Venues | `/venues`, `/venues/search`, `/venues/featured`, `/venues/cities`, `/venues/{id}` | Read: everyone. Write: admin |
| Courts | `/courts/venue/{venueId}`, `/courts/{id}` | Read: everyone. Write: admin |
| Slots | `/slots/court/{courtId}?date=YYYY-MM-DD`, `/slots`, `/slots/bulk`, `/slots/{id}/block` | Read: everyone. Write: admin |
| Bookings | `/bookings`, `/bookings/my`, `/bookings/{id}/cancel`, `/bookings/{id}/status` | Logged-in users (admin for all bookings and status changes) |
| Booking requirements | `/booking-requirements` | Logged-in users |
| Reviews | `/reviews`, `/reviews/venue/{venueId}` | Read: everyone. Write: customers |
| Favourites | `/favourites` | Customers |
| Profile | `/profile`, `/profile/change-password` | Logged-in users |
| Users | `/users` | Admin |
| Dashboard | `/dashboard/admin`, `/dashboard/customer` | Admin, customer |

Login returns a short-lived access token (15 minutes) and a refresh token (7 days). The frontend sends the access token in the `Authorization: Bearer <token>` header and refreshes it automatically.

---

## Troubleshooting

- **Backend fails with "Access denied for user"**: your MySQL user or password is wrong. Set `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`.
- **Backend fails with "Communications link failure"**: MySQL is not running on port 3306.
- **Frontend shows network errors**: the backend is not running on port 8080.
- **`npm run dev` fails with a missing native module** (for example `esbuild` or `rollup`): delete `frontend/node_modules` and run `npm ci` again on your own machine. Never copy `node_modules` between operating systems.
- **Port already in use**: stop the other program, or change `server.port` (backend) or `server.port` in `frontend/vite.config.js`.

---

## Roadmap

- [ ] Finish the rebrand from SportSphere to ATHLETIQ (package, database and docs)
- [ ] Venue owner role: owners manage their own venues, courts, availability, bookings and earnings
- [ ] Real online payments and a hold-then-pay booking flow
- [ ] Automated tests and a CI pipeline
- [ ] Database migrations (Flyway) instead of automatic table updates
- [ ] Framework and library upgrades

---

## Contributing

1. Create a branch: `git checkout -b feature/short-name`
2. Make a small change and check that `npm run build` (frontend) and `mvn -B test` (backend) work
3. Open a pull request that explains what changed and why

## License

No license has been chosen yet. Add a `LICENSE` file before sharing the code for others to reuse.
