import request from 'supertest';
import app from '../app.js';
import { pool } from '../db/index.js';

const getRetreatId = async (roomType: string): Promise<number> => {
  const result = await pool.query(
    `SELECT id FROM retreats 
     WHERE name = 'Test Retreat' AND room_type = $1`,
    [roomType]
  );
  return result.rows[0].id;
};

describe('POST /bookings — critical path', () => {

  // ✓ Happy path
  it('creates a booking successfully', async () => {
    const retreatId = await getRetreatId('Standard Room');

    const res = await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     retreatId,
        traveller_name: 'John Doe',
        email:          'trussiwettassu-1242@yopmail.com',
        room_type:      'Standard Room',
        check_in:       '2026-06-01',
        check_out:      '2026-06-14'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('confirmed');
    expect(res.body.traveller_name).toBe('John Doe');
  });

  // ✓ Date conflict — same room
  it('rejects overlapping dates on same room', async () => {
    const retreatId = await getRetreatId('Standard Room');

    // First booking
    await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     retreatId,
        traveller_name: 'John Doe',
        email:          'lakafaddikau-9597@yopmail.com',
        room_type:      'Standard Room',
        check_in:       '2026-06-01',
        check_out:      '2026-06-14'
      });

    // Second booking — overlapping dates, same room
    const res = await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     retreatId,
        traveller_name: 'Jane Smith',
        email:          'graqueffakiquo-4398@yopmail.com',
        room_type:      'Standard Room',
        check_in:       '2026-06-07',  // overlaps
        check_out:      '2026-06-20'
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Room not available for selected dates');
  });

  // ✓ Room awareness — same dates different room = allowed
  it('allows same dates on different room type', async () => {
    const standardId = await getRetreatId('Standard Room');
    const deluxeId   = await getRetreatId('Deluxe Suite');

    // Book standard room
    await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     standardId,
        traveller_name: 'John Doe',
        email:          'megressupitra-6153@yopmail.com',
        room_type:      'Standard Room',
        check_in:       '2026-06-01',
        check_out:      '2026-06-14'
      });

    // Book deluxe suite — same dates, should succeed
    const res = await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     deluxeId,
        traveller_name: 'Jane Smith',
        email:          'moiprixommaugrei-8441@yopmail.com',
        room_type:      'Deluxe Suite',
        check_in:       '2026-06-01',
        check_out:      '2026-06-14'
      });

    expect(res.status).toBe(201);
  });

  // ✓ Adjacent dates — not a conflict
  it('allows adjacent dates on same room', async () => {
    const retreatId = await getRetreatId('Standard Room');

    await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     retreatId,
        traveller_name: 'John Doe',
        email:          'cannauxauvumu-7670@yopmail.com',
        room_type:      'Standard Room',
        check_in:       '2026-06-01',
        check_out:      '2026-06-14'
      });

    // Starts exactly when previous ends — not a conflict
    const res = await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     retreatId,
        traveller_name: 'Jane Smith',
        email:          'woinemmogeca-1971@yopmail.comm',
        room_type:      'Standard Room',
        check_in:       '2026-06-14',  // starts when previous ends
        check_out:      '2026-06-21'
      });

    expect(res.status).toBe(201);
  });

  // ✓ Validation — missing fields
  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        traveller_name: 'John Doe'
        // missing everything else
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  // ✓ Validation — invalid email
  it('rejects invalid email', async () => {
    const retreatId = await getRetreatId('Standard Room');

    const res = await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     retreatId,
        traveller_name: 'John Doe',
        email:          'not-an-email',
        room_type:      'Standard Room',
        check_in:       '2026-06-01',
        check_out:      '2026-06-14'
      });

    expect(res.status).toBe(400);
  });

  // ✓ Validation — check_out before check_in
  it('rejects check_out before check_in', async () => {
    const retreatId = await getRetreatId('Standard Room');

    const res = await request(app)
      .post('/api/bookings')
      .send({
        retreat_id:     retreatId,
        traveller_name: 'John Doe',
        email:          'john@example.com',
        room_type:      'Standard Room',
        check_in:       '2026-06-14',
        check_out:      '2026-06-01'  // before check_in
      });

    expect(res.status).toBe(400);
  });

});