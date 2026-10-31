<p align="center">
  <img src="frontend/src/public/Logo/Logo.png" alt="ATHLETIQ — Play More. Plan Less." width="100%">
</p>

ATHLETIQ is a web app for booking sports venues by the hour. Players find a badminton court, football turf or cricket ground, pick a free time slot and book it. Admins manage venues, courts, slots, users and bookings from a dashboard.

![Java 17](https://img.shields.io/badge/Java-17-orange)
![Spring Boot 3.3](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen)
![React 18](https://img.shields.io/badge/React-18-61dafb)
![MySQL 8](https://img.shields.io/badge/MySQL-8-blue)

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

## License

No license has been chosen yet. Add a `LICENSE` file before sharing the code for others to reuse.
