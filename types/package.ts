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
  slug: string; // ✅ Matches translated attribute
  name: string;
  duration: number;
  category: string;
  description: string;
  location: string;
  rating: number | string | null; // Matches decimal cast in Laravel
  images_url: string[]; // Matches appended attribute in model
  thumbnail_url: string | null; // ✅ Matches appended attribute in model
  addons?: Addon[]; // Decoded JSON field
  itinerary: { day: number; title: string; description: string }[]; // Decoded JSON field
  cost: { included: string[]; excluded: string[] }; // Decoded JSON field
  faqs: { question: string; answer: string }[]; // Decoded JSON field
  tripInfo: { label: string; value: string; icon: string }[]; // ✅ Matches appended camelCase attribute
  mapUrl: string; // ✅ Matches appended camelCase attribute
  price_tiers: PackagePriceTier[]; // Decoded JSON field
  starting_from_price: number | null;
  is_active: boolean; // ✅ Added to match backend visibility control
}

export type TFunction = (key: string, values?: Record<string, string | number | Date>) => string;