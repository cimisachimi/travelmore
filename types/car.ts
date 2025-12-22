// types/car.ts

export interface CarImage {
  url: string;
  type: "thumbnail" | "gallery";
}

export interface Car {
  id: number;
  car_model: string;
  brand: string;
  category: "regular" | "exclusive";
  car_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  capacity: number | null;
  trunk_size: number | null;
  description: string | null;
  features: string[] | null;
  price_per_day: string;
  images: CarImage[];
  status?: string; 
  updated_at?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  phone?: string;
}