export interface HealthResponse {
  status: string;
  db: string;
  timestamp: string;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response: Response = await fetch(`${baseUrl}/api/health`);
  if (!response.ok) {
    throw new Error('Network error');
  }
  return response.json();
};
