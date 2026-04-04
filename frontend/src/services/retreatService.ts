export const getRetreats = async (filter?: { country?: string; type?: string }) => {
  const query = new URLSearchParams();
  if (filter?.country) query.append('country', filter.country);
  if (filter?.type) query.append('ayurveda_type', filter.type);

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/api/retreats?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch retreats');
  return response.json();
};

export const getRetreatById = async (id: string | number) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/api/retreats/${id}`);
  if (!response.ok) throw new Error('Retreat not found');
  return response.json();
};

export const getAvailability = async (id: number | string, checkIn?: Date | null, checkOut?: Date | null) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  let url = `${baseUrl}/api/retreats/${id}/availability`;
  
  if (checkIn && checkOut && checkIn < checkOut) {
    const ciStr = checkIn.toLocaleDateString('en-CA');
    const coStr = checkOut.toLocaleDateString('en-CA');
    url += `?check_in=${ciStr}&check_out=${coStr}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch availability');
  }
  return response.json();
};

export const getRecommendations = async (goal: string) => {
  const query = new URLSearchParams({ goal });
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/api/retreats/recommend?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
};
