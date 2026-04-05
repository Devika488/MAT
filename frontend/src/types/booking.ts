import { Retreat } from './index';

export interface AvailabilityResponse {
  retreat_id: number;
  retreat_name: string;
  capacity: number;
  booked?: number | null;
  available_slots?: number | null;
  available?: boolean | null;
}

export interface BookingPayload {
  traveller_name: string;
  email: string;
  retreat_id: number;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
}

export interface BookingResponse extends BookingPayload {
  id: number;
  status: string;
}

export interface FetchedBooking extends BookingResponse {
  retreat_name: string;
  location: string;
  country: string;
}

// Ensure Retreat is fully typed with database keys
export interface ExtendedRetreat extends Retreat {}

export interface PaginatedBookings {
  data: FetchedBooking[];
  total: number;
  page: number;
  limit: number;
}
