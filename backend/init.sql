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
  room_type     TEXT           NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  traveller_name  TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  retreat_id      INT     NOT NULL REFERENCES retreats(id),
  room_type       TEXT    NOT NULL,
  check_in        DATE    NOT NULL,
  check_out       DATE    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'confirmed',
  CONSTRAINT check_dates CHECK (check_out > check_in)
);

TRUNCATE retreats RESTART IDENTITY CASCADE;

INSERT INTO retreats (name, location, country, duration_days, price_usd, ayurveda_type, room_type) VALUES
  ('Somatheeram Ayurveda Village',          'Trivandrum',  'India',     14, 2400.00, 'Panchakarma',  'Standard Room'),
  ('Somatheeram Ayurveda Village',          'Trivandrum',  'India',     14, 3200.00, 'Panchakarma',  'Garden Cottage'),
  ('Somatheeram Ayurveda Village',          'Trivandrum',  'India',     14, 6800.00, 'Panchakarma',  'Siddhartha Deluxe Suite'),

  ('Kairali The Ayurvedic Healing Village', 'Palakkad',    'India',      7, 1800.00, 'Rejuvenation', 'Heritage Room'),
  ('Kairali The Ayurvedic Healing Village', 'Palakkad',    'India',      7, 3400.00, 'Rejuvenation', 'Royal Suite'),

  ('CGH Earth Kalari Rasayana',             'Kollam',      'India',     10, 3800.00, 'Rasayana',     'Forest Room'),
  ('CGH Earth Kalari Rasayana',             'Kollam',      'India',     10, 5200.00, 'Rasayana',     'Kalari Suite'),

  ('SwaSwara by CGH Earth',                'Gokarna',     'India',      7, 2100.00, 'Detox',        'Garden Cottage'),
  ('SwaSwara by CGH Earth',                'Gokarna',     'India',      7, 3100.00, 'Detox',        'Sea View Cottage'),

  ('Vaidyagrama Ayurveda Village',          'Coimbatore',  'India',     21, 3200.00, 'Rasayana',     'Traditional Hut'),
  ('Vaidyagrama Ayurveda Village',          'Coimbatore',  'India',     21, 5400.00, 'Rasayana',     'Private Villa'),

  ('Barberyn Ayurveda Resort',              'Weligama',    'Sri Lanka', 14, 2800.00, 'Panchakarma',  'Ocean Room'),
  ('Barberyn Ayurveda Resort',              'Weligama',    'Sri Lanka', 14, 4600.00, 'Panchakarma',  'Beachfront Villa'),

  ('Santani Wellness Resort',               'Kandy',       'Sri Lanka',  7, 1950.00, 'Detox',        'Valley Room'),
  ('Santani Wellness Resort',               'Kandy',       'Sri Lanka',  7, 3600.00, 'Detox',        'Infinity Suite'),

  ('Siddhalepa Ayurveda Resort',            'Wadduwa',     'Sri Lanka', 10, 1600.00, 'Rejuvenation', 'Garden Room'),
  ('Siddhalepa Ayurveda Resort',            'Wadduwa',     'Sri Lanka', 10, 2900.00, 'Rejuvenation', 'Lagoon Suite');
