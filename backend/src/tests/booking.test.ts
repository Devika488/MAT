import request from 'supertest';
import app from '../app.js';
import sql from '../db/index.js';

describe('Booking API', () => {
  it('should create a successful booking for devika.ed0116@gmail.com', async () => {
    // 1. Get a valid retreat ID
    const retreats = await sql`SELECT id FROM retreats LIMIT 1`;
    const retreatId = retreats[0].id;

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const payload = {
      traveller_name: 'Devika Test',
      email: 'devika.ed0116@gmail.com',
      retreat_id: retreatId,
      check_in: nextWeek.toISOString().split('T')[0],
      check_out: twoWeeks.toISOString().split('T')[0]
    };

    // 2. Create booking
    const response = await request(app)
      .post('/api/bookings')
      .send(payload);

    // 3. Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');

    // 4. Verification in DB
    const [dbBooking] = await sql`SELECT * FROM bookings WHERE id = ${response.body.id}`;
    expect(dbBooking).toBeDefined();

    // 5. Wait for email service
    await new Promise(resolve => setTimeout(resolve, 10000));
  }, 15000); // Increased test timeout
});
