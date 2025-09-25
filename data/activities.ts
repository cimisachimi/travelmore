// data/activities.ts
export interface Activity {
  id: string;
  title: string;
  description: string;
  regularPrice: number;
  exclusivePrice: number;
  image: string;
  category: string;
  location: string;
  duration: string;
  highlights: string[];       // ✨ New
  includes: string[];         // ✨ New
  excludes: string[];         // ✨ New
  faqs: { q: string; a: string }[]; // ✨ New
  mapLink: string;            // ✨ New
}

export const activities: Activity[] = [
  {
    id: "jeep-volcano-tour",
    title: "Jeep Volcano Tour Merapi",
    description: "Experience the thrill of an off-road adventure on the slopes of the active Merapi volcano, visiting key sites affected by its eruptions.",
    regularPrice: 450000,
    exclusivePrice: 600000,
    image: "/activities/Parangtritis.webp",
    category: "Adventure",
    location: "Sleman, Yogyakarta",
    duration: "4 Hours",
    highlights: [
      "Ride a legendary Willis Jeep through rugged terrain.",
      "Visit the 'Alien Stone' and Sisa Hartaku Museum.",
      "Witness the stunning volcanic landscape up close."
    ],
    includes: ["Private Jeep Charter", "Professional Driver & Guide", "Safety Helmet", "Entrance Tickets"],
    excludes: ["Meals and beverages", "Personal expenses", "Hotel pickup and drop-off"],
    faqs: [
      { q: "Is this activity safe?", a: "Yes, all tours are conducted by experienced drivers who know the routes well. Safety equipment is provided." },
      { q: "What should I wear?", a: "Comfortable clothes, sturdy shoes, and a jacket are recommended as the weather can be cool." }
    ],
    mapLink: "https://maps.app.goo.gl/uCa7z5A3nB1x9f8c6"
  },
  {
    id: "prambanan-ramayana-ballet",
    title: "Prambanan Ramayana Ballet",
    description: "Witness the legendary Ramayana story performed by over 200 dancers with the magnificent Prambanan Temple as the backdrop.",
    regularPrice: 200000,
    exclusivePrice: 350000,
    image: "/activities/Prambanan.webp",
    category: "Culture",
    location: "Prambanan Temple",
    duration: "2 Hours",
    highlights: [
      "A spectacular performance combining dance and drama.",
      "Stunning open-air stage with a view of the illuminated temples.",
      "An unforgettable cultural experience."
    ],
    includes: ["Entrance ticket to the show based on selected class"],
    excludes: ["Dinner", "Transportation to the venue"],
    faqs: [
      { q: "Is there an indoor venue if it rains?", a: "Yes, during the rainy season, the performance is moved to a covered indoor stage." },
      { q: "Can I take photos?", a: "Yes, photography without flash is permitted during the performance." }
    ],
    mapLink: "https://maps.app.goo.gl/qV2QhX8YmY3z9f8A6"
  },
  {
    id: "batik-making-class",
    title: "Batik Making Class",
    description: "Learn the ancient art of Batik from local artisans and create your own unique masterpiece to take home.",
    regularPrice: 250000,
    exclusivePrice: 400000,
    image: "/activities/Batik.webp",
    category: "Workshop",
    location: "Kotagede, Yogyakarta",
    duration: "3 Hours",
    highlights: [
      "Hands-on experience with traditional batik tools.",
      "Learn the philosophy behind classic batik patterns.",
      "Bring home your self-made batik creation as a souvenir."
    ],
    includes: ["All materials (fabric, wax, dyes)", "Guidance from an expert instructor", "Welcome drink"],
    excludes: ["Meals", "Transportation"],
    faqs: [
      { q: "Do I need any prior experience?", a: "Not at all! This workshop is suitable for beginners of all ages." }
    ],
    mapLink: "https://maps.app.goo.gl/n8f7Z9x9jY6k8a7A9"
  },
  {
    id: "jomblang-cave-tour",
    title: "Jomblang Cave Vertical Caving",
    description: "Descend into the earth to witness the heavenly light of Jomblang Cave, a truly once-in-a-lifetime experience.",
    regularPrice: 750000,
    exclusivePrice: 950000,
    image: "/activities/Nepal.webp",
    category: "Adventure",
    location: "Gunung Kidul, Yogyakarta",
    duration: "6 Hours",
    highlights: [
      "Descend 60 meters into a vertical cave.",
      "Trek through an ancient underground forest.",
      "Witness the famous 'Light from Heaven' phenomenon."
    ],
    includes: ["All required caving equipment", "Professional caving guides", "Simple lunch box", "Insurance"],
    excludes: ["Personal expenses", "Hotel pickup and drop-off"],
    faqs: [
      { q: "Is there a physical fitness requirement?", a: "A moderate level of fitness is required. You should be able to walk on uneven and slippery terrain." }
    ],
    mapLink: "https://maps.app.goo.gl/cK5rZ9jX7kL6f8bA8"
  },
];