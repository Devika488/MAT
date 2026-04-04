export const getRetreats = async (filter?: { country?: string; type?: string }) => {
  const query = new URLSearchParams();
  if (filter?.country) query.append('country', filter.country);
  if (filter?.type) query.append('ayurveda_type', filter.type);

  const response = await fetch(`/api/retreats?${query.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch retreats');
  return response.json();
};
