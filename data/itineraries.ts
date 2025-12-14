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


export interface PriceTier {
  pax: string;   
  price: string; 
}

export interface Itinerary {
  id: number;
  slug: string;
  image: string;
  duration: string;
  price: string; 
  priceList: PriceTier[]; 
  styles: string[];
  personalities: string[];
  content: {
    en: LocalizedContent;
    id: LocalizedContent;
  };
}

export const itinerariesData: Record<string, Itinerary> = {
  "gateway-of-java": {
    id: 1,
    slug: "gateway-of-java",
    image: "/jogja2.webp",
    duration: "2 Days 1 Night",
    price: "Start from IDR 2,150,000 /pax", 
    
    priceList: [
      { pax: "2-3 Pax", price: "IDR 2,950,000 /pax" },
      { pax: "4-6 Pax", price: "IDR 2,450,000 /pax" },
      { pax: "7-10 Pax", price: "IDR 2,150,000 /pax" },
    ],
    styles: ["Exclusive", "Culture & Heritage", "Luxury"],
    personalities: ["Couple", "Culture Seeker", "History Buff"],
    content: {
      en: {
        title: "Gateway of Java",
        tagline: "Explore the Cultural Richness of Yogyakarta",
        description: "A carefully curated journey designed to introduce travelers to the cultural soul of Yogyakarta. Combine iconic sunrise viewpoints, UNESCO World Heritage temples, royal heritage sites, and authentic local craftsmanship.",
        highlights: ["Puthuk Setumbu Sunrise", "Borobudur Temple", "Fine Dining at Abhayagiri", "Prambanan Temple", "Ratu Boko Sunset"],
        timeline: [
          { day: 1, title: "Sunrise, Temples & Royal Sunset", activities: ["03:30 – Transfer to Puthuk Setumbu", "04:30 – Puthuk Setumbu Sunrise", "06:30 – Breakfast at Bukit Rhema", "07:30 – Borobudur Temple", "12:30 – Lunch at Abhayagiri", "14:30 – Prambanan Temple", "17:00 – Ratu Boko Sunset", "18:00 – Hotel Transfer"] },
          { day: 2, title: "Royal Heritage & Local Craftsmanship", activities: ["08:00 – Kotagede Silver Workshops", "10:30 – Yogyakarta Palace (Kraton)", "12:30 – Lunch at Bale Raos", "14:00 – Taman Sari Water Castle", "16:00 – Airport Transfer"] },
        ]
      },
      id: {
        title: "Gerbang Jawa",
        tagline: "Menjelajahi Kekayaan Budaya Yogyakarta",
        description: "Perjalanan kurasi 2 hari untuk memperkenalkan jiwa budaya Yogyakarta. Kombinasi sunrise ikonik, candi UNESCO, situs kerajaan, dan kerajinan lokal.",
        highlights: ["Sunrise Puthuk Setumbu", "Candi Borobudur", "Makan Siang Abhayagiri", "Candi Prambanan", "Sunset Ratu Boko"],
        timeline: [
          { day: 1, title: "Sunrise, Candi & Sunset Kerajaan", activities: ["03:30 – Ke Puthuk Setumbu", "04:30 – Sunrise Puthuk Setumbu", "06:30 – Sarapan Bukit Rhema", "07:30 – Candi Borobudur", "12:30 – Makan Siang Abhayagiri", "14:30 – Candi Prambanan", "17:00 – Sunset Ratu Boko", "18:00 – Ke Hotel"] },
          { day: 2, title: "Warisan Kerajaan & Kerajinan", activities: ["08:00 – Perak Kotagede", "10:30 – Keraton Yogyakarta", "12:30 – Makan Siang Bale Raos", "14:00 – Taman Sari", "16:00 – Antar Bandara"] },
        ]
      }
    }
  },
  "gems-of-yogyakarta": {
    id: 2,
    slug: "gems-of-yogyakarta",
    image: "/jogja1.webp",
    duration: "3 Days 2 Nights",
    price: "Start from IDR 3,250,000 /pax",
  
    priceList: [
      { pax: "2-3 Pax", price: "IDR 4,200,000 /pax" },
      { pax: "4-6 Pax", price: "IDR 3,650,000 /pax" },
      { pax: "7-10 Pax", price: "IDR 3,250,000 /pax" },
    ],
    styles: ["Adventure", "Nature", "Culture & Heritage"],
    personalities: ["Couple", "Solo Traveler", "Nature Lover"],
    content: {
      en: {
        title: "Gems of Yogyakarta",
        tagline: "Adventure, Culture & Hidden Gems",
        description: "Explore the most iconic natural landscapes and cultural heritage. From volcanic sunrise adventures to underground caves and dramatic coastal scenery.",
        highlights: ["Merapi Lava Tour", "Jomblang Cave", "Parangtritis Sand Dunes", "Watukodok Beach Sunset", "Kopi Klothok"],
        timeline: [
          { day: 1, title: "Volcano Adventure & Royal Heritage", activities: ["04:00 – Jeep Lava Tour Merapi", "06:30 – Breakfast Kopi Klothok", "08:30 – Borobudur Temple", "12:00 – Lunch Bale Raos", "13:30 – Kraton", "16:00 – Parangtritis Sunset"] },
          { day: 2, title: "Cave Adventure & Coastal Sunset", activities: ["09:30 – Jomblang Cave", "12:30 – Local Lunch", "15:30 – Watukodok Beach Sunset", "17:30 – Back to City"] },
          { day: 3, title: "Crafts & Ancient Temples", activities: ["08:30 – Kotagede Walking Tour", "13:30 – Prambanan Temple", "16:00 – Ratu Boko Sunset", "18:00 – Airport Transfer"] },
        ]
      },
      id: {
        title: "Permata Yogyakarta",
        tagline: "Petualangan, Budaya & Alam Tersembunyi",
        description: "Jelajahi lanskap alam paling ikonik dan warisan budaya. Mulai dari petualangan gunung berapi hingga gua bawah tanah.",
        highlights: ["Merapi Lava Tour", "Gua Jomblang", "Gumuk Pasir", "Sunset Pantai Watukodok", "Kopi Klothok"],
        timeline: [
          { day: 1, title: "Petualangan Merapi & Warisan", activities: ["04:00 – Jeep Lava Tour", "06:30 – Sarapan Kopi Klothok", "08:30 – Borobudur", "12:00 – Makan Siang Bale Raos", "13:30 – Keraton", "16:00 – Sunset Parangtritis"] },
          { day: 2, title: "Petualangan Gua & Pantai", activities: ["09:30 – Gua Jomblang", "12:30 – Makan Siang", "15:30 – Sunset Watukodok", "17:30 – Kembali ke Kota"] },
          { day: 3, title: "Kerajinan & Candi", activities: ["08:30 – Tur Jalan Kaki Kotagede", "13:30 – Prambanan", "16:00 – Sunset Ratu Boko", "18:00 – Antar Bandara"] },
        ]
      }
    }
  },
  "viral-in-jogja": {
    id: 3,
    slug: "viral-in-jogja",
    image: "/jogja3.webp",
    duration: "1 Day",
    price: "Start from IDR 950,000 /pax",
    
    priceList: [
      { pax: "2-3 Pax", price: "IDR 1,450,000 /pax" },
      { pax: "4-6 Pax", price: "IDR 1,150,000 /pax" },
      { pax: "7-10 Pax", price: "IDR 950,000 /pax" },
    ],
    styles: ["Instagrammable", "City & Urban Life", "Relaxed"],
    personalities: ["Family", "Explorer", "Photographer"],
    content: {
      en: {
        title: "Viral in Jogja",
        tagline: "Photogenic Spots & Classic Vibes",
        description: "A one-day journey designed to explore Yogyakarta’s most popular and instagrammable destinations.",
        highlights: ["VW Safari Borobudur", "Taman Sari", "Obelix Sea View Sunset", "Sate Klathak Dinner"],
        timeline: [
          { day: 1, title: "Full Day Viral Trip", activities: ["08:00 – VW Borobudur Safari", "11:30 – Lunch", "12:30 – Kraton", "14:00 – Taman Sari", "16:30 – Obelix Sea View Sunset", "18:30 – Sate Klathak Dinner"] }
        ]
      },
      id: {
        title: "Viral di Jogja",
        tagline: "Spot Fotogenik & Nuansa Klasik",
        description: "Perjalanan satu hari menjelajahi destinasi paling populer dan instagramable di Yogyakarta.",
        highlights: ["VW Safari Borobudur", "Taman Sari", "Sunset Obelix Sea View", "Makan Malam Sate Klathak"],
        timeline: [
          { day: 1, title: "Perjalanan Viral Seharian", activities: ["08:00 – Safari VW Borobudur", "11:30 – Makan Siang", "12:30 – Keraton", "14:00 – Taman Sari", "16:30 – Sunset Obelix Sea View", "18:30 – Makan Malam Sate Klathak"] }
        ]
      }
    }
  },
};