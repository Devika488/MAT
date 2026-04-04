import { Retreat } from './index';

export interface RoomAvailability {
  id: number;
  room_type: string;
  price_usd: string;
  duration_days: number;
  ayurveda_type: string;
  available: boolean;
}

export interface AvailabilityResponse {
  retreat_id: string;
  retreat_name: string;
  check_in: string;
  check_out: string;
  rooms: RoomAvailability[];
}

export interface BookingPayload {
  traveller_name: string;
  email: string;
  retreat_id: number;
  room_type: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
}

export interface BookingResponse extends BookingPayload {
  id: number;
  status: string;
}

// Ensure Retreat is fully typed with database keys
export interface ExtendedRetreat extends Retreat {}
