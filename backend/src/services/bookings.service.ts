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
    const result = await sql`
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ${id} AND status = 'confirmed'
      RETURNING *
    `;
    return result.length > 0 ? result[0] : null;
  }
}
