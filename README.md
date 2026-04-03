# MAT (My Ayurveda Trip)

Modern, responsive web application for My Ayurveda Trip.

## Setup Instructions

### 1. Database Configuration
This project uses a direct PostgreSQL connection. Docker is not required.
1. Ensure PostgreSQL is installed and running locally.
2. In the `backend` directory, add `.env` file.
3. Update the `DATABASE_URL` in `.env` with your local PostgreSQL credentials or your cloud (Supabase) Database URL.

### 2. Backend
Install dependencies and run the development backend server.
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend
In a separate terminal, install dependencies and run the Vite server.
```bash
cd frontend
npm install
npm run dev
```
