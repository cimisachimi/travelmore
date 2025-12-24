// types/activity.ts

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  phone?: string;
}

export interface Addon {
  name: string;
  price: number;
}

export interface ActivityPriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

export interface Activity {
  id: number;
  slug: string;
  name: string;
  duration: string | null;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number;
  rating?: number; 
  status: string;
  google_map_url: string | null;
  includes: { included: string[]; excluded: string[] } | null;
  itinerary: string | null;
  notes: string | null;
  addons?: Addon[];
  images_url: { id: number; url: string; type: string }[]; 
  thumbnail_url: string | null;
  faqs?: { question: string; answer: string }[];
  tripInfo?: { label: string; value: string; icon: string }[];
  price_tiers?: ActivityPriceTier[];
}

export type TFunction = (key: string, values?: Record<string, string | number | Date>) => string;