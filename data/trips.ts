// data/trips.ts

export interface PackagePriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

export interface OpenTripListItem {
  id: number;
  name: string;
  location?: string | null;
  duration: number;
  rating?: number | null;
  category?: string | null;
  thumbnail_url: string | null;
  price_tiers: PackagePriceTier[];
  starting_from_price: number | null;
}

export const openTripsData: OpenTripListItem[] = [
  {
    id: 1,
    name: "Open Trip Bromo Sunrise & Kawah",
    location: "Jawa Timur",
    duration: 1,
    rating: 4.8,
    category: "Mountain",
    thumbnail_url: "/articles-image/borobudur.webp", // Pastikan path gambar sesuai
    price_tiers: [],
    starting_from_price: 350000,
  },
  {
    id: 2,
    name: "Open Trip Dieng Culture Festival",
    location: "Wonosobo",
    duration: 3,
    rating: 4.9,
    category: "Culture",
    thumbnail_url: "/articles-image/prambanan.webp",
    price_tiers: [],
    starting_from_price: 1200000,
  },
  {
    id: 3,
    name: "Open Trip Pahawang Island",
    location: "Lampung",
    duration: 3,
    rating: 4.7,
    category: "Beach",
    thumbnail_url: "/hero-1.jpg", 
    price_tiers: [],
    starting_from_price: 750000,
  },
  {
    id: 4,
    name: "Open Trip Sailing Komodo",
    location: "Labuan Bajo",
    duration: 4,
    rating: 5.0,
    category: "Sailing",
    thumbnail_url: "/hero-2.jpg",
    price_tiers: [],
    starting_from_price: 2500000,
  }
];