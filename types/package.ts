// types/package.ts


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

export interface PackagePriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

export interface HolidayPackage {
  id: number;
  name: string;
  duration: number;
  category: string;
  description: string;
  location: string;
  rating: number | null;
  images_url: string[];
  addons?: Addon[]; 
  itinerary: { day: number; title: string; description: string }[];
  cost: { included: string[]; excluded: string[] };
  faqs: { question: string; answer: string }[];
  tripInfo: { label: string; value: string; icon: string }[];
  mapUrl: string;
  price_tiers: PackagePriceTier[];
  starting_from_price: number | null;
}

export type TFunction = (key: string, values?: Record<string, string | number | Date>) => string;