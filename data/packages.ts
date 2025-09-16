export interface Package {
  id: string; // ID harus berupa string
  title: string;
  description: string;
  regularPrice: number;
  exclusivePrice: number;
  image: string;
  category: string;
}

export const packages: Package[] = [
  {
    id: "borobudur-prambanan",
    title: "2 Days: Borobudur & Prambanan",
    description: "Witness the majestic sunrise at Borobudur and explore the grand Prambanan temple complex.",
    regularPrice: 2500000,
    exclusivePrice: 3500000,
    image: "/hero-1.jpg",
    category: "Temple",
  },
  {
    id: "yogyakarta-adventure",
    title: "3 Days: Yogyakarta Adventure",
    description: "Experience the thrill of Jomblang Cave, Timang Beach, and the slopes of Merapi Volcano.",
    regularPrice: 3800000,
    exclusivePrice: 5000000,
    image: "/hero-2.jpg",
    category: "Adventure",
  },
  {
    id: "cultural-immersion",
    title: "4 Days: Cultural Immersion",
    description: "Dive deep into Jogja's culture with visits to the Sultan's Palace, Taman Sari, and a batik workshop.",
    regularPrice: 4200000,
    exclusivePrice: 5800000,
    image: "/hero-3.jpg",
    category: "Culture",
  },
];