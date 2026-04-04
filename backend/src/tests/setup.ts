import sql from '../db/index.js';

beforeAll(async () => {
  // Clean slate before tests
  await sql`
    CREATE TABLE IF NOT EXISTS retreats (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      location VARCHAR NOT NULL,
      country VARCHAR NOT NULL,
      duration_days INTEGER NOT NULL,
      price_usd NUMERIC NOT NULL,
      ayurveda_type VARCHAR NOT NULL,
      room_type VARCHAR NOT NULL,
      image_url VARCHAR
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      retreat_id INTEGER REFERENCES retreats(id),
      traveller_name VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      room_type VARCHAR NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      status VARCHAR DEFAULT 'confirmed'
    )
  `;

  // Seed one retreat with two room types
  await sql`
    INSERT INTO retreats (name, location, country, duration_days, price_usd, ayurveda_type, room_type)
    VALUES 
      ('Test Retreat', 'Trivandrum', 'India', 7, 1000, 'Detox', 'Standard Room'),
      ('Test Retreat', 'Trivandrum', 'India', 7, 2000, 'Detox', 'Deluxe Suite')
    ON CONFLICT DO NOTHING
  `;
});

beforeEach(async () => {
  // Clear bookings between tests — fresh state each time
  await sql`DELETE FROM bookings`;
});

afterAll(async () => {
  await sql.end();
});