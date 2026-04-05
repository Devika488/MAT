import { BookingPayload, PaginatedBookings } from '../types/booking';

export const getBookings = async (params: {
  retreat_id?: number;
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedBookings> => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const searchParams = new URLSearchParams();
  
  if (params.retreat_id) searchParams.append('retreat_id', params.retreat_id.toString());
  if (params.status) searchParams.append('status', params.status);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const url = `${baseUrl}/api/bookings${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch bookings');
  }
  return response.json();
};

export const createBooking = async (payload: BookingPayload) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Conflict generating booking');
  }
  return data;
};

export const cancelBookingForGuest = async (id: number) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/api/bookings/${id}`, {
    method: 'DELETE'
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to cancel booking');
  }
  return data;
};
