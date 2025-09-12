export interface Package {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const packages: Package[] = [
  {
    id: 1,
    title: "2 Days: Borobudur & Prambanan",
    description: "Witness the majestic sunrise at Borobudur and explore the grand Prambanan temple complex.",
    price: 2500000,
    image: "/hero-1.jpg",
    category: "Temple",
  },
  {
    id: 2,
    title: "3 Days: Yogyakarta Adventure",
    description: "Experience the thrill of Jomblang Cave, Timang Beach, and the slopes of Merapi Volcano.",
    price: 3800000,
    image: "/hero-2.jpg",
    category: "Adventure",
  },
  {
    id: 3,
    title: "4 Days: Cultural Immersion",
    description: "Dive deep into Jogja's culture with visits to the Sultan's Palace, Taman Sari, and a batik workshop.",
    price: 4200000,
    image: "/hero-3.jpg",
    category: "Culture",
  },
  {
    id: 4,
    title: "Serene Temple Views",
    description: "Discover the hidden gems and serene temples of Yogyakarta.",
    price: 2800000,
    image: "/hero-1.jpg",
    category: "Temple",
  },
  {
    id: 5,
    title: "City Landmark Tour",
    description: "A guided tour of Yogyakarta's most famous city landmarks.",
    price: 1500000,
    image: "/hero-2.jpg",
    category: "City",
  },
  {
    id: 6,
    title: "Historic Bathing Pools",
    description: "Explore the historic and beautiful bathing pools of Taman Sari.",
    price: 1200000,
    image: "/hero-3.jpg",
    category: "Culture",
  },
];