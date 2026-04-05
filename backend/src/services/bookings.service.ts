import sql from '../db/index.js';
import { emailService } from './email.service.js';

export class BookingsService {
  static async getAllBookings() {
    return await sql`
      SELECT b.*, r.name AS retreat_name, r.location, r.country
      FROM bookings b
      JOIN retreats r ON r.id = b.retreat_id
      ORDER BY b.id DESC
    `;
  }

  static async createBooking(payload: {
    traveller_name: string;
    email: string;
    retreat_id: number;
    room_type: string;
    check_in: string;
    check_out: string;
  }) {
    const { traveller_name, email, retreat_id, room_type, check_in, check_out } = payload;

    return await sql.begin(async (tx: any) => {
      // Get retreat info and lock the row
      const retreatResult = await tx`
        SELECT name, location, price_usd FROM retreats
        WHERE id = ${retreat_id}
        FOR UPDATE
      `;

      if (retreatResult.length === 0) {
        throw { httpStatus: 404, error: 'Retreat not found' };
      }

      const retreat = retreatResult[0];

      // Check for conflicts
      const conflict = await tx`
        SELECT id FROM bookings
        WHERE retreat_id = ${retreat_id}
          AND room_type  = ${room_type}
          AND status     = 'confirmed'
          AND check_in   < ${check_out}
          AND check_out  > ${check_in}
      `;

      if (conflict.length > 0) {
        throw { httpStatus: 409, error: 'Room not available for selected dates' };
      }

      const insertResult = await tx`
        INSERT INTO bookings
        (traveller_name, email, retreat_id, room_type, check_in, check_out, status)
        VALUES (${traveller_name}, ${email}, ${retreat_id}, ${room_type}, ${check_in}, ${check_out}, 'confirmed')
        RETURNING *
      `;

      // Send background email
      emailService.sendBookingConfirmation({
        traveller_name,
        email,
        retreat_name: retreat.name,
        location: retreat.location,
        room_type,
        check_in,
        check_out,
        price: retreat.price_usd
      }).catch(err => console.error('Email background error:', err));

      return insertResult[0];
    });
  }

  static async cancelBooking(id: string) {
    return await sql.begin(async (tx: any) => {
      // Fetch booking and retreat info first
      const bookingResult = await tx`
        SELECT b.*, r.name AS retreat_name, r.location
        FROM bookings b
        JOIN retreats r ON r.id = b.retreat_id
        WHERE b.id = ${id} AND b.status = 'confirmed'
        FOR UPDATE
      `;

      if (bookingResult.length === 0) {
        return null;
      }

      const booking = bookingResult[0];

      // Perform update
      const updateResult = await tx`
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ${id}
        RETURNING *
      `;

      // Trigger cancellation email in background
      emailService.sendCancellationEmail({
        booking_id: booking.id,
        traveller_name: booking.traveller_name,
        email: booking.email,
        retreat_name: booking.retreat_name,
        location: booking.location,
        check_in: booking.check_in,
        check_out: booking.check_out
      }).catch(err => console.error('Cancellation email background error:', err));

      return updateResult[0];
    });
  }
}
