// Shared TypeScript interfaces and types
export interface Retreat {
  id: number;
  name: string;
  description: string;
  country: string;
  location: string;
  price_usd: string;
  duration_days: number;
  ayurveda_type: string;
  room_type: string;
  image_url: string;
  created_at: string;
}

export interface Option {
  label: string;
  value: string;
}
