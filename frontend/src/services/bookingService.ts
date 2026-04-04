export const getBookings = async () => {
  const response = await fetch('/api/bookings');
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch bookings');
  }
  return response.json();
};
