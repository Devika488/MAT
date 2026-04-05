import dotenv from 'dotenv';
dotenv.config();              // ✅ loads .env before anything runs

import sql from '../db/index.js';

beforeAll(async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS retreats (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      location VARCHAR NOT NULL,
      country VARCHAR NOT NULL,
      duration_days INTEGER NOT NULL,
      price_usd NUMERIC NOT NULL,
      ayurveda_type VARCHAR NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 10,
      image_url VARCHAR
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_retreats_listing ON retreats (name, location, ayurveda_type, price_usd ASC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_retreats_country ON retreats (country)`;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      retreat_id INTEGER REFERENCES retreats(id),
      traveller_name VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      status VARCHAR DEFAULT 'confirmed'
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_retreat_id ON bookings (retreat_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (check_in, check_out)`;

  await sql`
    INSERT INTO retreats (name, location, country, duration_days, price_usd, ayurveda_type, capacity)
    VALUES 
      ('Test Retreat', 'Trivandrum', 'India', 7, 1000, 'Detox', 1),
      ('Test Retreat 2', 'Trivandrum', 'India', 7, 2000, 'Detox', 2)
    ON CONFLICT DO NOTHING
  `;
});

beforeEach(async () => {
  await sql`DELETE FROM bookings`;
});

afterAll(async () => {
  await sql.end();
});