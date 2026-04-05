DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS retreats CASCADE;

CREATE TABLE IF NOT EXISTS retreats (
  id            SERIAL PRIMARY KEY,
  name          TEXT           NOT NULL,
  location      TEXT           NOT NULL,
  country       TEXT           NOT NULL,
  duration_days INT            NOT NULL,
  price_usd     NUMERIC(10,2)  NOT NULL,
  ayurveda_type TEXT           NOT NULL,
  capacity      INT            NOT NULL DEFAULT 10,
  image_url     TEXT           DEFAULT ''
);

CREATE INDEX idx_retreats_listing ON retreats (name, location, ayurveda_type, price_usd ASC);
CREATE INDEX idx_retreats_country ON retreats (country);

CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  traveller_name  TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  retreat_id      INT     NOT NULL REFERENCES retreats(id),
  check_in        DATE    NOT NULL,
  check_out       DATE    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'confirmed',
  CONSTRAINT check_dates CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_retreat_id ON bookings (retreat_id);
CREATE INDEX idx_bookings_dates ON bookings (check_in, check_out);

TRUNCATE retreats RESTART IDENTITY CASCADE;
INSERT INTO retreats (name, location, country, duration_days, price_usd, ayurveda_type, capacity, image_url) VALUES
  ('Somatheeram Ayurveda Village',          'Trivandrum',  'India',     14, 2800.00, 'Panchakarma',  10, '/images/panchakarma-1.jpg'),
  ('Somatheeram Ayurveda Village',          'Trivandrum',  'India',      7, 2100.00, 'Detox',        12, '/images/detox.jpg'),
  ('Somatheeram Ayurveda Village',          'Trivandrum',  'India',     21, 5600.00, 'Rasayana',     10, '/images/rasayana.jpg'),
  ('Somatheeram Ayurveda Village',          'Trivandrum',  'India',     10, 3200.00, 'Stress Management', 15, '/images/stress_management.jpg'),

  ('Kairali The Ayurvedic Healing Village', 'Palakkad',    'India',      7, 1950.00, 'Rejuvenation', 20, '/images/rejuvanation.jpg'),
  ('Kairali The Ayurvedic Healing Village', 'Palakkad',    'India',     14, 4200.00, 'Panchakarma',  15, '/images/panchakarma-1.jpg'),

  ('CGH Earth Kalari Rasayana',             'Kollam',      'India',     14, 4200.00, 'Rasayana',     12, '/images/rasayana.jpg'),
  ('CGH Earth Kalari Rasayana',             'Kollam',      'India',     14, 4800.00, 'Panchakarma',  10, '/images/panchakarma-2.jpg'),

  ('SwaSwara by CGH Earth',                 'Gokarna',     'India',      7, 2200.00, 'Detox',        10, '/images/detox.jpg'),
  ('SwaSwara by CGH Earth',                 'Gokarna',     'India',     10, 3100.00, 'Rejuvenation', 15, '/images/rejuvanation_3.jpg'),

  ('Vaidyagrama Ayurveda Village',          'Coimbatore',  'India',     21, 3400.00, 'Rasayana',     20, '/images/rasayana.jpg'),

  ('Barberyn Ayurveda Resort',              'Weligama',    'Sri Lanka', 14, 2950.00, 'Panchakarma',  25, '/images/panchakarma-1.jpg'),
  ('Barberyn Ayurveda Resort',              'Weligama',    'Sri Lanka', 10, 2400.00, 'Detox',        15, '/images/detox_3.jpg'),

  ('Santani Wellness Resort',               'Kandy',       'Sri Lanka',  7, 2100.00, 'Detox',        12, '/images/detox_3.jpg'),
  ('Santani Wellness Resort',               'Kandy',       'Sri Lanka',  7, 2400.00, 'Rejuvenation', 10, '/images/rejuvanation.jpg'),

  ('Siddhalepa Ayurveda Resort',            'Wadduwa',     'Sri Lanka', 10, 1750.00, 'Rejuvenation', 20, '/images/rejuvanation_3.jpg');

