// data/itineraries.ts

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface LocalizedContent {
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  timeline: ItineraryDay[];
}

export interface Itinerary {
  id: number;
  slug: string;
  image: string;
  duration: string;
  price: string;
  styles: string[];
  personalities: string[];
  content: {
    en: LocalizedContent;
    id: LocalizedContent;
  };
}

export const itinerariesData: Record<string, Itinerary> = {
  "3d2n-explorer": {
    id: 1,
    slug: "3d2n-explorer",
    image: "/jogja-1.WEBP",
    duration: "3 Days 2 Nights",
    price: "Start from Rp 1.850.000 /pax",
    styles: ["Culture & Heritage", "City & Urban Life", "Culinary & Lifestyle"],
    personalities: ["History Buff", "Foodie", "City Explorer"],
    content: {
      en: {
        title: "3D2N Yogyakarta Explorer",
        tagline: "The Perfect Introduction to Java's Soul",
        description: "Experience the magic of Yogyakarta in 3 days. From the magnificence of ancient temples to the hustle and bustle of Malioboro streets.",
        highlights: ["Sunrise Borobudur", "Sunset Prambanan", "Merapi Lava Tour", "Malioboro Street Food"],
        timeline: [
          { day: 1, title: "Arrival & Temple Run", activities: ["Pick up at YIA", "Lunch at Sate Klathak", "Hotel Check-in", "Sunset Prambanan", "Gudeg Dinner"] },
          { day: 2, title: "Merapi Adventure & Heritage", activities: ["Sunrise Punthuk Setumbu", "Explore Borobudur", "Merapi Lava Tour", "Lunch at Kopi Klotok", "Malioboro"] },
          { day: 3, title: "City Tour & Departure", activities: ["Breakfast & Checkout", "Tamansari & Keraton", "Souvenir Shopping", "Airport Drop"] },
        ]
      },
      id: {
        title: "Eksplorasi Yogyakarta 3H2M",
        tagline: "Perkenalan Sempurna dengan Jiwa Jawa",
        description: "Rasakan magisnya Yogyakarta dalam 3 hari. Mulai dari kemegahan Candi kuno hingga hiruk pikuk jalanan Malioboro.",
        highlights: ["Sunrise Borobudur", "Sunset Prambanan", "Merapi Lava Tour", "Kuliner Malioboro"],
        timeline: [
          { day: 1, title: "Kedatangan & Candi", activities: ["Penjemputan di YIA", "Makan Siang Sate Klathak", "Check-in Hotel", "Sunset Prambanan", "Makan Malam Gudeg"] },
          { day: 2, title: "Petualangan Merapi & Budaya", activities: ["Sunrise Punthuk Setumbu", "Eksplor Borobudur", "Merapi Lava Tour", "Makan Siang Kopi Klotok", "Malioboro"] },
          { day: 3, title: "Wisata Kota & Kepulangan", activities: ["Sarapan & Checkout", "Tamansari & Keraton", "Oleh-oleh", "Antar ke Bandara"] },
        ]
      }
    }
  },
  "4d3n-culture": {
    id: 2,
    slug: "4d3n-culture",
    image: "/jogja-2.WEBP",
    duration: "4 Days 3 Nights",
    price: "Start from Rp 2.500.000 /pax",
    styles: ["Culture & Heritage", "Nature & Adventure", "Photography & Instagrammable"],
    personalities: ["Nature Lover", "History Buff", "Photographer"],
    content: {
      en: {
        title: "4D3N Culture + Nature Trip",
        tagline: "Deep Dive into Javanese Culture & Scenic Nature",
        description: "Complete package for culture and nature lovers. Explore the best museums and lush pine forests.",
        highlights: ["Ullen Sentalu", "Timang Beach", "HeHa Sky View", "Keraton"],
        timeline: [
          { day: 1, title: "Highlands", activities: ["Ullen Sentalu", "Bhumi Merapi", "HeHa Sky View"] },
          { day: 2, title: "Gunung Kidul", activities: ["Gondola Timang", "Indrayanti Beach", "Pinus Pengger"] },
          { day: 3, title: "Heritage", activities: ["Keraton", "Kotagede Silver", "Warungboto", "Alun-alun Kidul"] },
          { day: 4, title: "Departure", activities: ["Manding Leather", "Bakpia", "Airport Transfer"] },
        ]
      },
      id: {
        title: "4H3M Budaya + Alam",
        tagline: "Menyelami Budaya Jawa & Alam yang Indah",
        description: "Paket lengkap untuk pecinta budaya dan alam. Jelajahi museum terbaik dan hutan pinus yang asri.",
        highlights: ["Ullen Sentalu", "Pantai Timang", "HeHa Sky View", "Keraton"],
        timeline: [
          { day: 1, title: "Dataran Tinggi", activities: ["Ullen Sentalu", "Bhumi Merapi", "HeHa Sky View"] },
          { day: 2, title: "Gunung Kidul", activities: ["Gondola Timang", "Pantai Indrayanti", "Pinus Pengger"] },
          { day: 3, title: "Warisan Budaya", activities: ["Keraton", "Perak Kotagede", "Warungboto", "Alun-alun Kidul"] },
          { day: 4, title: "Kepulangan", activities: ["Kulit Manding", "Bakpia", "Antar ke Bandara"] },
        ]
      }
    }
  },
  "2d1n-culinary": {
    id: 3,
    slug: "2d1n-culinary",
    image: "/jogja-3.WEBP",
    duration: "2 Days 1 Night",
    price: "Start from Rp 1.200.000 /pax",
    styles: ["Culinary & Lifestyle", "Wellness & Healing"],
    personalities: ["Foodie", "Relaxed Traveler"],
    content: {
      en: {
        title: "2D1N Culinary + Hidden Gems",
        tagline: "Short Escape for Foodies",
        description: "Short vacation but fulfilling! Focus on tasting legendary Jogja culinary delights.",
        highlights: ["Kopi Klotok", "Mangut Lele", "Gumuk Pasir", "Obelix Hills"],
        timeline: [
          { day: 1, title: "Authentic Flavors", activities: ["Mangut Lele", "Gumuk Pasir", "Obelix Hills", "Bakmi Jowo"] },
          { day: 2, title: "Morning Vibes", activities: ["Kopi Klotok", "Kaliurang Rice Fields", "Tempo Gelato", "Transfer Out"] },
        ]
      },
      id: {
        title: "2H1M Kuliner + Permata Tersembunyi",
        tagline: "Pelarian Singkat untuk Pecinta Makanan",
        description: "Liburan singkat namun kenyang! Fokus mencicipi kuliner legendaris Jogja.",
        highlights: ["Kopi Klotok", "Mangut Lele", "Gumuk Pasir", "Obelix Hills"],
        timeline: [
          { day: 1, title: "Rasa Otentik", activities: ["Mangut Lele", "Gumuk Pasir", "Obelix Hills", "Bakmi Jowo"] },
          { day: 2, title: "Suasana Pagi", activities: ["Kopi Klotok", "Sawah Kaliurang", "Tempo Gelato", "Antar Keluar"] },
        ]
      }
    }
  },
};