import { BookingPayload } from '../types';

export const getBookings = async () => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/api/bookings`);
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
