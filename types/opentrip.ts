// types/opentrip.ts

export interface PriceTier {
  min_pax: number;
  max_pax: number | null;
  price: number;
}

export interface MeetingPoint {
  id: number;
  name: string;
  time?: string;
  notes?: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  activities: string[];
}

export interface Addon {
  name: string;
  price: number;
}

export interface OpenTrip {
  id: number;
  name: string;
  description?: string;
  location?: string;
  duration: number; // dalam hari
  rating?: number;
  thumbnail_url?: string | null;
  images?: string[];
  starting_from_price: number | null;
  price_tiers?: PriceTier[];
  itinerary_details?: ItineraryItem[];
  includes?: string[];
  excludes?: string[];
  meeting_points?: MeetingPoint[];
  map_url?: string;
  addons?: Addon[];
  updated_at?: string;
  category?: string;
  is_active?: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  phone?: string;
}