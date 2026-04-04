export const getBookings = async () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${baseUrl}/api/bookings`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch bookings');
  }
  return response.json();
};
