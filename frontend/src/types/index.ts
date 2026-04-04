export interface Retreat {
  id: number;
  name: string;
  location: string;
  country: string;
  duration_days: number;
  price_usd: number | string;
  ayurveda_type: string;
  room_type: string;
  image_url: string;
}

export interface Option {
  label: string;
  value: string;
}

export * from './booking';
