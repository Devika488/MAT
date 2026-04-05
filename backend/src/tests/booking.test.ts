import request from 'supertest';
import app from '../app.js';
import sql from '../db/index.js';

describe('Booking API Comprehensive Tests', () => {
  let retreatId1: number;
  let retreatId2: number;

  beforeAll(async () => {
    // Get the test retreats created in setup.ts
    const retreats = await sql`SELECT id, capacity FROM retreats WHERE name LIKE 'Test Retreat%' ORDER BY id ASC`;
    retreatId1 = retreats[0].id; // Capacity 1
    retreatId2 = retreats[1].id; // Capacity 2
  });

  const getFutureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  describe('POST /api/bookings', () => {
    it('should create a successful booking', async () => {
      const payload = {
        traveller_name: 'Success User',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: getFutureDate(10),
        check_out: getFutureDate(15)
      };

      const res = await request(app).post('/api/bookings').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.available_slots).toBe(0); // Capacity 1 - 1
    });

    it('should allow multiple bookings for the same retreat on different dates', async () => {
      // Booking 1: Days 20-25
      await request(app).post('/api/bookings').send({
        traveller_name: 'User 1',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: getFutureDate(20),
        check_out: getFutureDate(25)
      });

      // Booking 2: Days 26-30 (No overlap)
      const res = await request(app).post('/api/bookings').send({
        traveller_name: 'User 2',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: getFutureDate(26),
        check_out: getFutureDate(30)
      });

      expect(res.status).toBe(201);
    });

    it('should allow "touching" bookings (Checkout A = Checkin B)', async () => {
      const midDate = getFutureDate(40);
      
      // Booking A: 35 to 40
      await request(app).post('/api/bookings').send({
        traveller_name: 'User A',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: getFutureDate(35),
        check_out: midDate
      });

      // Booking B: 40 to 45
      const res = await request(app).post('/api/bookings').send({
        traveller_name: 'User B',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: midDate,
        check_out: getFutureDate(45)
      });

      expect(res.status).toBe(201);
    });

    it('should reject booking if it exceeds capacity (Direct Overlap)', async () => {
      // retreatId1 has capacity 1.
      const start = getFutureDate(50);
      const end = getFutureDate(55);

      // First booking fills it
      await request(app).post('/api/bookings').send({
        traveller_name: 'First',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: start,
        check_out: end
      });

      // Second booking overlaps exactly
      const res = await request(app).post('/api/bookings').send({
        traveller_name: 'Second',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: start,
        check_out: end
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/fully booked/i);
    });

    it('should reject booking with partial overlap (Start Inside)', async () => {
      // retreatId2 has capacity 2.
      const r2_start = getFutureDate(60);
      const r2_end = getFutureDate(70);

      // Fill capacity 2
      await request(app).post('/api/bookings').send({ traveller_name: 'P1', email: 'devika.ed0116@gmail.com', retreat_id: retreatId2, check_in: r2_start, check_out: r2_end });
      await request(app).post('/api/bookings').send({ traveller_name: 'P2', email: 'devika.ed0116@gmail.com', retreat_id: retreatId2, check_in: r2_start, check_out: r2_end });

      // Overlap: Starts at 65 (inside 60-70)
      const res = await request(app).post('/api/bookings').send({
        traveller_name: 'Overlapper',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId2,
        check_in: getFutureDate(65),
        check_out: getFutureDate(75)
      });

      expect(res.status).toBe(409);
    });

    it('should reject booking with partial overlap (End Inside)', async () => {
      const start = getFutureDate(80);
      const end = getFutureDate(90);
      
      await request(app).post('/api/bookings').send({ traveller_name: 'P1', email: 'devika.ed0116@gmail.com', retreat_id: retreatId2, check_in: start, check_out: end });
      await request(app).post('/api/bookings').send({ traveller_name: 'P2', email: 'devika.ed0116@gmail.com', retreat_id: retreatId2, check_in: start, check_out: end });

      // Overlap: Ends at 85 (inside 80-90)
      const res = await request(app).post('/api/bookings').send({
        traveller_name: 'Overlapper',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId2,
        check_in: getFutureDate(75),
        check_out: getFutureDate(85)
      });

      expect(res.status).toBe(409);
    });

    it('should reject booking that fully encompasses another', async () => {
      const start = getFutureDate(100);
      const end = getFutureDate(110);
      
      await request(app).post('/api/bookings').send({ traveller_name: 'P1', email: 'devika.ed0116@gmail.com', retreat_id: retreatId2, check_in: start, check_out: end });
      await request(app).post('/api/bookings').send({ traveller_name: 'P2', email: 'devika.ed0116@gmail.com', retreat_id: retreatId2, check_in: start, check_out: end });

      // Overlap: 95 to 115 (Encompasses 100-110)
      const res = await request(app).post('/api/bookings').send({
        traveller_name: 'Overlapper',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId2,
        check_in: getFutureDate(95),
        check_out: getFutureDate(115)
      });

      expect(res.status).toBe(409);
    });

    it('should return 404 for non-existent retreat', async () => {
      const res = await request(app).post('/api/bookings').send({
        traveller_name: 'Ghost',
        email: 'devika.ed0116@gmail.com',
        retreat_id: 999999,
        check_in: getFutureDate(1),
        check_out: getFutureDate(5)
      });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/bookings', () => {
    it('should list all bookings', async () => {
      // Create one booking to ensure list isn't empty
      await request(app).post('/api/bookings').send({
        traveller_name: 'List User',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: getFutureDate(1),
        check_out: getFutureDate(5)
      });

      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('retreat_name');
    });
  });

  describe('CANCEL /api/bookings/:id', () => {
    it('should successfully cancel a booking', async () => {
      const createRes = await request(app).post('/api/bookings').send({
        traveller_name: 'To Cancel',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: getFutureDate(200),
        check_out: getFutureDate(205)
      });

      const bookingId = createRes.body.id;
      const cancelRes = await request(app).delete(`/api/bookings/${bookingId}`);
      
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.status).toBe('cancelled');

      // Verify it's cancelled in list
      const listRes = await request(app).get('/api/bookings');
      const cancelled = listRes.body.find((b: any) => b.id === bookingId);
      expect(cancelled.status).toBe('cancelled');
    });

    it('should return 404 for cancelling non-existent booking', async () => {
      const res = await request(app).delete('/api/bookings/999999');
      expect(res.status).toBe(404);
    });

    it('should return 404 for cancelling an already cancelled booking', async () => {
      const createRes = await request(app).post('/api/bookings').send({
        traveller_name: 'Double Cancel',
        email: 'devika.ed0116@gmail.com',
        retreat_id: retreatId1,
        check_in: getFutureDate(210),
        check_out: getFutureDate(215)
      });

      const bookingId = createRes.body.id;
      await request(app).delete(`/api/bookings/${bookingId}`);
      const secondCancel = await request(app).delete(`/api/bookings/${bookingId}`);
      
      expect(secondCancel.status).toBe(404);
    });
  });
});

