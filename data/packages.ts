// Definisikan tipe data untuk setiap item di "Trip Info"
export interface TripInfoItem {
  label: string;
  value: string;
  icon: string;
}

// Perbarui interface utama untuk Package
export interface Package {
  id: string;
  title: string;
  description: string;
  regularPrice: number;
  exclusivePrice: number;
  childPrice?: number; // Harga untuk anak, dibuat opsional
  images: string[]; // Diubah dari image (string) menjadi images (array of strings)
  category: string;
  tripInfo: TripInfoItem[]; // Data untuk bagian "Trip Info"
  duration: number; // e.g., 2, 3, 4
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  cost: {
    included: string[];
    excluded: string[];
  };
  faqs: {
    question: string;
    answer: string;
  }[];
  mapUrl: string; // URL for an embedded Google Map
}

export const packages: Package[] = [
  {
    id: "borobudur-prambanan",
    title: "2 Days: Borobudur & Prambanan",
    description: "Witness the majestic sunrise at Borobudur and explore the grand Prambanan temple complex in this compact cultural journey.",
    regularPrice: 3500000,
    exclusivePrice: 2500000,
    childPrice: 1250000,
    duration: 2,
    images: [
      "/package-image/boropramba/boropramba1.webp",
      "/package-image/boropramba/boropramba2.webp",
      "/package-image/boropramba/boropramba3.webp",
      "/package-image/boropramba/boropramba4.webp",
    ],
    category: "Temple",
    tripInfo: [
      { label: 'Accomodation', value: '4 Stars Hotel', icon: '🏨' },
      { label: 'Departure City', value: 'Yogyakarta', icon: '🛫' },
      { label: 'Arrival City', value: 'Yogyakarta', icon: '🛬' },
      { label: 'Best Season', value: 'Dry Season (Apr-Oct)', icon: '🍂' },
      { label: 'Guide', value: 'Licensed Local Guide', icon: '🧍' },
      { label: 'Language', value: 'English, Indonesian', icon: '🗣️' },
      { label: 'Meals', value: 'Breakfast Included', icon: '🍽️' },
      { label: 'Tour Availability', value: 'Daily', icon: '🗓️' },
      { label: 'Transportation', value: 'Private Car', icon: '🚌' },
      { label: 'Walking Hours', value: '3-4 Hours/Day', icon: '🕔' },
      { label: 'Minimum Age', value: '5', icon: '🧒' },
      { label: 'Maximum Age', value: '70', icon: '🧑' },
      { label: 'Destinations', value: 'Borobudur, Prambanan', icon: '📍' },
      { label: 'Activities', value: 'Temple Tour, Sunrise Hunt', icon: '🧗' },
      { label: 'Trip Type', value: 'Cultural, Historical', icon: '🏷️' },
    ],
    itinerary: [
      { day: 1, title: "Arrival & Prambanan Sunset", description: "Our team will pick you up from the airport or train station. After checking into your hotel, we'll head to the magnificent Prambanan Temple complex to witness a breathtaking sunset." },
      { day: 2, title: "Borobudur Sunrise & Departure", description: "An early start to catch the magical sunrise at Borobudur Temple, the world's largest Buddhist monument. After exploring the temple, we'll return to the hotel for breakfast before your departure." },
    ],
    cost: {
      included: ["4-Star Hotel Accommodation (1 Night)", "Private Air-Conditioned Vehicle", "Professional English-Speaking Guide", "Entrance Fees to Borobudur & Prambanan", "Daily Breakfast"],
      excluded: ["Flights to/from Yogyakarta", "Lunches and Dinners", "Personal Expenses", "Travel Insurance", "Tips for Guide and Driver"],
    },
    faqs: [
      { question: "Is there a dress code for the temples?", answer: "Yes, visitors are required to dress modestly. Sarongs will be provided at the entrance if your clothing is deemed inappropriate." },
      { question: "How early do we need to start for the Borobudur sunrise?", answer: "We typically depart from the hotel around 3:30 AM to ensure we arrive in time to find a good spot before the sun rises." },
    ],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252963.0211473138!2d110.2615798906972!3d-7.874229796030372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5787bd5b6bc5%3A0x21723fd4d3684f71!2sYogyakarta%2C%20Yogyakarta%20City%2C%20Special%20Region%20of%20Yogyakarta!5e0!3m2!1sen!2sid!4v1695442800000!5m2!1sen!2sid"
  },
  {
    id: "yogyakarta-adventure",
    title: "3 Days: Yogyakarta Adventure",
    description: "Experience the thrill of Jomblang Cave's 'Heavenly Light', the adrenaline rush at Timang Beach, and an off-road journey on the slopes of Merapi Volcano.",
    regularPrice: 5000000,
    exclusivePrice: 3800000,
    childPrice: 1900000,
    duration: 3,
    images: [
      "/hero-2.jpg",
      "/packages/timang-gondola.jpg",
      "/packages/merapi-jeep.jpg",
      "/packages/pine-forest.jpg",
    ],
    category: "Adventure",
    tripInfo: [
      { label: 'Accomodation', value: 'Boutique Hotel', icon: '🏨' },
      { label: 'Departure City', value: 'Yogyakarta', icon: '🛫' },
      { label: 'Arrival City', value: 'Yogyakarta', icon: '🛬' },
      { label: 'Best Season', value: 'All Year', icon: '🍂' },
      { label: 'Guide', value: 'Adventure Specialist', icon: '🧍' },
      { label: 'Language', value: 'English', icon: '🗣️' },
      { label: 'Meals', value: 'Full Board', icon: '🍽️' },
      { label: 'Tour Availability', value: 'Daily', icon: '🗓️' },
      { label: 'Transportation', value: '4x4 Jeep, Private Car', icon: '🚌' },
      { label: 'Walking Hours', value: '4-5 Hours/Day', icon: '🕔' },
      { label: 'Minimum Age', value: '12', icon: '🧒' },
      { label: 'Maximum Age', value: '55', icon: '🧑' },
      { label: 'Destinations', value: 'Jomblang, Timang, Merapi', icon: '📍' },
      { label: 'Activities', value: 'Caving, Off-road, Beach', icon: '🧗' },
      { label: 'Trip Type', value: 'Adrenaline, Nature', icon: '🏷️' },
    ],
    itinerary: [
      { day: 1, title: "Jomblang Cave's Heavenly Light", description: "Descend 60 meters into Jomblang Cave via single rope technique. Witness the incredible 'light from heaven' as sun rays pierce through the darkness of the cave." },
      { day: 2, title: "Timang Beach Adrenaline", description: "Challenge your fears at Timang Beach. Cross the ocean to a small island via a traditional hand-pulled wooden gondola or a suspension bridge." },
      { day: 3, title: "Merapi Volcano Lava Tour", description: "Hop on a 4x4 Jeep for an exciting off-road tour on the slopes of the active Merapi Volcano. Explore villages affected by the last eruption and learn about the volcano's power." },
    ],
    cost: {
      included: ["Boutique Hotel (2 Nights)", "All Transportation (Private Car & 4x4 Jeep)", "Specialist Adventure Guides", "All Safety Equipment (Caving, Gondola)", "All Entrance Fees", "Daily Breakfast, Lunch, and Dinner"],
      excluded: ["Flights", "Travel Insurance", "Personal Gear (e.g., specific hiking shoes)", "Tips for Guides"],
    },
    faqs: [
      { question: "Are the adventure activities safe?", answer: "Yes, safety is our top priority. All activities are handled by certified professionals with international standard safety equipment." },
      { question: "What should I wear for Jomblang Cave?", answer: "Wear comfortable clothes you don't mind getting muddy. We provide boots, but you should bring a change of clothes and socks." },
    ],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252963.0211473138!2d110.2615798906972!3d-7.874229796030372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5787bd5b6bc5%3A0x21723fd4d3684f71!2sYogyakarta%2C%20Yogyakarta%20City%2C%20Special%20Region%20of%20Yogyakarta!5e0!3m2!1sen!2sid!4v1695442800000!5m2!1sen!2sid"
  },
  {
    id: "cultural-immersion",
    title: "4 Days: Cultural Immersion",
    description: "Dive deep into Jogja's rich culture with visits to the Sultan's Palace, Taman Sari water castle, and get hands-on experience in a traditional batik workshop.",
    regularPrice: 5800000,
    exclusivePrice: 4200000,
    childPrice: 2100000,
    duration: 4,
    images: [
      "/hero-3.jpg",
      "/packages/kraton-palace.jpg",
      "/packages/taman-sari.jpg",
      "/packages/kotagede-silver.jpg",
    ],
    category: "Culture",
    tripInfo: [
      { label: 'Accomodation', value: 'Heritage Hotel', icon: '🏨' },
      { label: 'Departure City', value: 'Yogyakarta', icon: '🛫' },
      { label: 'Arrival City', 'value': 'Yogyakarta', icon: '🛬' },
      { label: 'Best Season', value: 'All Year', icon: '🍂' },
      { label: 'Guide', value: 'Cultural Expert', icon: '🧍' },
      { label: 'Language', value: 'English, Dutch', icon: '🗣️' },
      { label: 'Meals', value: 'Breakfast & Lunch', icon: '🍽️' },
      { label: 'Tour Availability', value: 'Mon - Sat', icon: '🗓️' },
      { label: 'Transportation', value: 'Private Car, Becak', icon: '🚌' },
      { label: 'Walking Hours', value: '2-3 Hours/Day', icon: '🕔' },
      { label: 'Minimum Age', value: '8', icon: '🧒' },
      { label: 'Maximum Age', value: 'N/A', icon: '🧑' },
      { label: 'Destinations', value: 'Sultan Palace, Batik Village', icon: '📍' },
      { label: 'Activities', value: 'Workshop, Historical Tour', icon: '🧗' },
      { label: 'Trip Type', value: 'Leisure, Educational', icon: '🏷️' },
    ],
    itinerary: [
      { day: 1, title: "Royal Palaces & Water Castle", description: "Arrive in Yogyakarta and check into your unique heritage hotel. We'll spend the day exploring the Sultan's Palace (Kraton) and the enchanting Taman Sari Water Castle." },
      { day: 2, title: "Artisan Workshops: Batik & Silver", description: "Discover your artistic side with a hands-on Batik making workshop. In the afternoon, we visit the historical district of Kotagede, renowned for its intricate silver craftsmanship." },
      { day: 3, title: "Javanese Village Life", description: "Journey to a traditional village outside the city. Interact with locals, learn about their daily life and farming practices, and enjoy an authentic, home-cooked Javanese lunch." },
      { day: 4, title: "Shopping & Departure", description: "Enjoy a final Javanese breakfast before some free time for souvenir hunting at the famous Malioboro Street. We will then transfer you to the airport for your departure." },
    ],
    cost: {
      included: ["Heritage Hotel (3 Nights)", "All Workshop Fees and Materials", "Private Transportation", "Cultural Expert Guide", "Entrance Fees", "Daily Breakfast and Lunch"],
      excluded: ["Flights", "Dinners", "Personal Shopping", "Travel Insurance", "Tips for Guide and Artisans"],
    },
    faqs: [
      { question: "Do I get to keep the batik I create?", answer: "Absolutely! Your handmade batik is a wonderful and personal souvenir to take home." },
      { question: "Is this tour physically demanding?", answer: "Not at all. This tour is designed for a relaxed pace with a focus on cultural experiences and is suitable for all fitness levels." },
    ],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252963.0211473138!2d110.2615798906972!3d-7.874229796030372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5787bd5b6bc5%3A0x21723fd4d3684f71!2sYogyakarta%2C%20Yogyakarta%20City%2C%20Special%20Region%20of%20Yogyakarta!5e0!3m2!1sen!2sid!4v1695442800000!5m2!1sen!2sid"
  },
];