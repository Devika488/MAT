# Monorepo Application

## Setup Instructions

### 1. Database
Start the PostgreSQL database:
```bash
docker compose up -d
```

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
