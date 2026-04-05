import { z } from 'zod';

export const createBookingSchema = z.object({
  traveller_name: z.string().trim().min(1, 'Name is required'),
  email:          z.string().trim().email('Invalid email').toLowerCase(),
  retreat_id:     z.coerce.number().int().positive('Invalid retreat id'),
  check_in:       z.coerce.date(),
  check_out:      z.coerce.date(),
}).refine(
  data => data.check_out > data.check_in,
  { message: 'check_out must be after check_in', path: ['check_out'] }
).refine(
  data => data.check_in >= new Date(new Date().setHours(0, 0, 0, 0)),
  { message: 'check_in cannot be in the past', path: ['check_in'] }
);
