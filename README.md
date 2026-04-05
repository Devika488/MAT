# MyAyurvedaTrip — Full Stack Take-Home

This is a working proof-of-concept for **MyAyurvedaTrip**, a sanctuary discovery and booking platform. It features a complete vertical slice including a Node.js/TypeScript/PostgreSQL backend and a modern React/TypeScript frontend.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** instance (local or cloud)

### 2. Database Setup
1. Create a database named `ayurvedatrip`.
2. Run the initialization script provided in the root:
   ```bash
   psql -d ayurvedatrip -f backend/init.sql
   ```
   *This will create the `retreats` and `bookings` tables and seed them with 18 realistic retreats across India and Sri Lanka.*

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ayurvedatrip
GROQ_AI_KEY=your_groq_api_key_here
```

### 4. Running the Application
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the application.

---

## 🏛️ Architecture Decisions

### 1. Service Layer Pattern
I refactored the initial direct-access code into a dedicated **Service Layer** on both the frontend and backend.
- **Frontend**: Components call services (e.g., `bookingService.ts`), keeping UI logic separate from HTTP details.
- **Backend**: Controllers delegate database operations to services, allowing for cleaner testing and reuse of SQL logic.

### 2. Transaction-Based Bookings
The booking creation process uses a PostgreSQL **Transaction**. It locks the retreat row, checks for date overlaps, and creates the booking atomically. This ensures data integrity even under concurrent requests.

### 3. "Cancel" vs "Delete"
 `DELETE` endpoint : I implemented it as a **status update to 'cancelled'**. In a real-world booking platform, hard-deleting records is rarely desirable for audit trails. However, the endpoint is exposed as `DELETE /api/bookings/:id` to match the REST specification requested.

---

## 🧠 Reflection (Task 3)

I chose to add **three specific improvements** that I believe are critical for a "real-world" version of this platform:

### 1. AI-Powered Discovery (`GET /retreats/recommend`)
- **What it is**: A natural language search bar where users can describe their health goals (e.g., "I have chronic stress and back pain").
- **Why I chose it**: Ayurveda is deeply personal. Most users don't know if they need "Panchakarma" or "Rasayana". Allowing them to state their problem in plain English and getting ranked recommendations (powered by Llama 3 on Groq) makes the discovery process significantly more intuitive.

### 2. Booking Confirmation Emails
- **What it is**: Automated email triggers upon successful booking.
- **Why I chose it**: Trust is the currency of travel platforms. A user booking a $3,000 retreat needs immediate confirmation. It provides the "end-to-end" closure that makes the POC feel like a real product.

### 3. Admin Guest Management
- **What it is**: A dedicated view (`/admin`) for operators to see all bookings and cancel them if needed.
- **Why I chose it**: The prompt mentioned two kinds of users (operators and seekers). Building the "Discovery" side satisfies the seeker, but an operator needs to manage their business. This view completes the "vertical slice" by giving the operator control over the data created by the seeker.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, TypeScript, postgres.js, Zod (validation)
- **Frontend**: React, TypeScript, Vite, Vanilla CSS
- **AI**: Groq Cloud (Llama-3.3-70b)
