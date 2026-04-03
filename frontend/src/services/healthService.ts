export interface HealthResponse {
  status: string;
  db: string;
  timestamp: string;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response: Response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Network error');
  }
  return response.json();
};
