# MyAyurvedaTrip

A proof-of-concept retreat discovery and booking platform built with 
Node.js, Express, TypeScript, PostgreSQL, and React.

---

## Prerequisites

- Node.js v18+
- PostgreSQL (local or cloud)
- Groq API key (free at console.groq.com)
- Brevo
---

## Setup

### 1. Clone and install
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Database

Create a database named `ayurvedatrip`:
```bash
psql -U postgres -c "CREATE DATABASE ayurvedatrip;"
```

Run migrations and seed data:
```bash
cd backend
npm run migrate
npm run seed
```

This creates the `retreats` and `bookings` tables and seeds 
8 realistic retreats across India and Sri Lanka.

### 3. Environment

```env
PORT=3001
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_sender_email_here
GOOGLE_AI_KEY=your_google_ai_key_here
GROQ_AI_KEY=your_groq_ai_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/ayurvedatrip
FRONTEND_URL=http://localhost:5173
```

### 4. Run
```bash
# Backend — http://localhost:3001
cd backend
npm run dev

# Frontend — http://localhost:5173
cd frontend
npm run dev
```

### 5. Tests
```bash
cd backend
npm test
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/retreats | List retreats — filter by country, ayurveda_type, page, limit |
| GET | /api/retreats/recommend | AI recommendation — ?goal=your+health+goal |
| GET | /api/retreats/:id | Single retreat detail |
| GET | /api/retreats/:id/availability | Check availability — ?check_in=&check_out= |

### Bookings
- `GET /api/bookings` | List all bookings (supports status/retreat filters, pagination)
  - Filter by `retreat_id` (ID)
  - Filter by `status` (`confirmed`, `cancelled`)
  - Pagination: `page` (default 1), `limit` (default 10)
- `POST /api/bookings` | Create a booking (with capacity check)
- `DELETE /api/bookings/:id` | Cancel a booking

### Example requests
```bash
# List retreats filtered by country
curl http://localhost:3001/api/retreats?country=India

# AI recommendation
curl http://localhost:3001/api/retreats/recommend?goal=stress+and+back+pain

# Check availability
curl http://localhost:3001/api/retreats/1/availability?check_in=2026-06-01&check_out=2026-06-14

# Create booking
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "retreat_id": 1,
    "traveller_name": "John Doe",
    "email": "john@example.com",
    "check_in": "2026-06-01",
    "check_out": "2026-06-14"
  }'
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Validation | Zod |
| Rate limiting | express-rate-limit |
| AI | Groq Cloud — Llama 3.3 70B |
| Frontend | React, TypeScript, Vite |
| Tests | Jest, Supertest |

---

## Project Structure
```
myayurvedatrip/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── schemas/
│   │   ├── db/
│   │   └── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   └── package.json
└── REFLECTION.md
```