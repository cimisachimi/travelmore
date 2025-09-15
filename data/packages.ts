export interface Package {
  id: number;
  title: string;
  description: string;
  regularPrice: number;
  exclusivePrice: number;
  image: string;
  category: string;
}

export const packages: Package[] = [
  {
    id: 1,
    title: "2 Days: Borobudur & Prambanan",
    description: "Witness the majestic sunrise at Borobudur and explore the grand Prambanan temple complex.",
    regularPrice: 2500000,
    exclusivePrice: 3500000,
    image: "/hero-1.jpg",
    category: "Temple",
  },
  {
    id: 2,
    title: "3 Days: Yogyakarta Adventure",
    description: "Experience the thrill of Jomblang Cave, Timang Beach, and the slopes of Merapi Volcano.",
    regularPrice: 3800000,
    exclusivePrice: 5000000,
    image: "/hero-2.jpg",
    category: "Adventure",
  },
  {
    id: 3,
    title: "4 Days: Cultural Immersion",
    description: "Dive deep into Jogja's culture with visits to the Sultan's Palace, Taman Sari, and a batik workshop.",
    regularPrice: 4200000,
    exclusivePrice: 5800000,
    image: "/hero-3.jpg",
    category: "Culture",
  },
  // ... other packages updated similarly
];