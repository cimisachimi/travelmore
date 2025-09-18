// data/activities.ts
export interface Activity {
  id: string;
  title: string;
  description: string;
  regularPrice: number;
  exclusivePrice: number;
  image: string;
  category: string;
}

export const activities: Activity[] = [
  {
    id: "parangtritis-beach",
    title: "Parangtritis Beach",
    description: "Witness the magical sunset, explore vast sand dunes, and feel the legend of Nyai Roro Kidul at one of Yogyakarta’s most iconic beaches.",
    regularPrice: 450000,
    exclusivePrice: 600000,
    image: "/activities/Parangtritis.webp",
    category: "Adventure",
  },
  {
    id: "prambanan-ramayana-ballet",
    title: "Prambanan Ramayana Ballet",
    description: "Witness the legendary Ramayana story performed by over 200 dancers with Prambanan Temple as the backdrop.",
    regularPrice: 200000,
    exclusivePrice: 350000,
    image: "/activities/Prambanan.webp",
    category: "Culture",
  },
  {
    id: "batik-making-class",
    title: "Batik Making Class",
    description: "Learn the ancient art of Batik from local artisans and create your own unique masterpiece to take home.",
    regularPrice: 250000,
    exclusivePrice: 400000,
    image: "/activities/Batik.webp",
    category: "Workshop",
  },
  {
    id: "neval-van-java",
    title: "Neval Van Java",
    description: "Experience the charm of a mountainous village resembling the Himalayan foothills, nestled on the slopes of Mount Sumbing with breathtaking natural views.",
    regularPrice: 750000,
    exclusivePrice: 950000,
    image: "/activities/Nepal.webp", // You can use a more relevant image
    category: "Adventure",
  },
];