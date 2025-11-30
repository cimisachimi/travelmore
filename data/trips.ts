// data/trips.ts

// --- INTERFACES ---

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
  
  // ✅ Field Tambahan untuk Detail Page & Modal
  images?: string[];
  meeting_points?: { id: number; name: string; time?: string }[];
  itinerary_details?: { day: number; title: string; activities: string[] }[];
  includes?: string[];
  excludes?: string[];
  map_url?: string; // Link embed Google Maps
}

// --- DATA DUMMY ---

export const openTripsData: OpenTripListItem[] = [
  {
    id: 1,
    name: "Open Trip Bromo Sunrise & Kawah",
    location: "Jawa Timur",
    duration: 1,
    rating: 4.8,
    category: "Mountain",
    thumbnail_url: "/articles-image/borobudur.webp", 
    images: [
        "/articles-image/borobudur.webp", // Main Image
        "/hero-1.jpg",
        "/hero-2.jpg",
        "/articles-image/prambanan.webp"
    ],
    meeting_points: [
        { id: 1, name: "Stasiun Malang Kota Baru", time: "23:00 WIB" },
        { id: 2, name: "Terminal Arjosari", time: "23:30 WIB" },
        { id: 3, name: "Hotel area Malang Kota", time: "23:45 WIB" }
    ],
    itinerary_details: [
        {
            day: 1,
            title: "Midnight Journey & Golden Sunrise",
            activities: [
                "23.00: Penjemputan peserta di Meeting Point",
                "00.00: Perjalanan menuju Transit Point menggunakan Shuttle/MPV",
                "02.00: Oper Jeep 4x4 menuju Penanjakan 1 / King Kong Hill",
                "04.00: Menunggu dan menikmati Golden Sunrise Bromo",
                "06.00: Menuju Lautan Pasir, Kawah Bromo, dan Pura Luhur Poten",
                "08.00: Explore Padang Savana (Bukit Teletubbies) & Pasir Berbisik",
                "10.00: Kembali ke Transit Point, bersih diri, dan makan siang",
                "13.00: Pengantaran kembali ke Meeting Point awal",
            ]
        }
    ],
    includes: [
        "Transportasi PP (Malang - Bromo)",
        "Jeep Hardtop 4x4 (Sekamar ber-6)",
        "Tiket Masuk TNBTS (WNI)",
        "Driver, BBM, Parkir",
        "Dokumentasi Foto DSLR/Mirrorless",
        "Air Mineral & Snack Ringan"
    ],
    excludes: [
        "Makan di luar paket",
        "Sewa Jaket / Kuda",
        "Tiket Masuk WNA (Foreigner +300k)",
        "Pengeluaran Pribadi",
        "Tipping Driver/Guide (Sukarela)"
    ],
    map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.667057423834!2d112.95068027500643!3d-7.930244992093769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd637aaab794a41%3A0x2ea7508d5c314a76!2sGunung%20Bromo!5e0!3m2!1sid!2sid!4v1708934852312!5m2!1sid!2sid",
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
    images: [
        "/articles-image/prambanan.webp",
        "/hero-2.jpg",
        "/hero-1.jpg",
        "/articles-image/borobudur.webp"
    ],
    meeting_points: [
        { id: 1, name: "Stasiun Purwokerto", time: "08:00 WIB" },
        { id: 2, name: "Alun-alun Wonosobo", time: "10:00 WIB" }
    ],
    itinerary_details: [
        {
            day: 1,
            title: "Arrival & Temple Tour",
            activities: [
                "08.00: Meeting point Stasiun Purwokerto",
                "10.00: Perjalanan menuju Dieng Plateau",
                "13.00: Check-in Homestay & Makan Siang",
                "15.00: Mengunjungi Kompleks Candi Arjuna",
                "19.00: Makan Malam & Briefing DCF (Dieng Culture Festival)"
            ]
        },
        {
            day: 2,
            title: "Jazz Atas Awan & Lantern Night",
            activities: [
                "04.00: Sunrise di Bukit Sikunir (Golden Sunrise)",
                "08.00: Sarapan & Persiapan acara festival",
                "10.00: Kirab Budaya & Jamasan Rambut Gimbal",
                "19.00: Menikmati konser Jazz Atas Awan",
                "22.00: Penerbangan Lampion bersama"
            ]
        },
        {
            day: 3,
            title: "Kawah Sikidang & Oleh-oleh",
            activities: [
                "08.00: Check-out & Sarapan",
                "09.00: Mengunjungi Kawah Sikidang & Batu Pandang Ratapan Angin",
                "12.00: Belanja oleh-oleh khas Carica",
                "15.00: Drop off Stasiun Purwokerto"
            ]
        }
    ],
    includes: [
        "Tiket VIP Dieng Culture Festival",
        "Homestay (Sharing Room)",
        "Makan 7x selama trip",
        "Transportasi Shuttle Hiace",
        "Merchandise Kaos & Syal",
        "Guide Lokal Dieng"
    ],
    excludes: [
        "Tiket Kereta ke Purwokerto",
        "Pengeluaran Pribadi",
        "Upgrade Kamar Private"
    ],
    map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.962664314031!2d109.90533607500067!3d-7.189809292814953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70058726e0e42d%3A0x7126762b65938d0!2sDieng%20Plateau!5e0!3m2!1sid!2sid!4v1708934912312!5m2!1sid!2sid",
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
    images: [
        "/hero-1.jpg",
        "/hero-2.jpg",
        "/articles-image/borobudur.webp",
        "/articles-image/prambanan.webp"
    ],
    meeting_points: [
        { id: 1, name: "Pelabuhan Merak (Dunkin Donuts)", time: "23:00 WIB" },
        { id: 2, name: "Pelabuhan Bakauheni", time: "02:00 WIB" }
    ],
    itinerary_details: [
        {
            day: 1,
            title: "Perjalanan Menuju Ketapang",
            activities: [
                "23.00: Meeting Point Merak",
                "00.00: Penyeberangan Kapal Ferry ke Bakauheni"
            ]
        },
        {
            day: 2,
            title: "Hopping Island & Snorkeling",
            activities: [
                "04.00: Tiba di Bakauheni, lanjut ke Dermaga Ketapang",
                "07.00: Sarapan & Ganti baju renang",
                "09.00: Snorkeling di Pulau Kelagian Kecil",
                "11.00: Check-in Homestay di Pulau Pahawang Besar",
                "15.00: Hunting sunset di Pasir Timbul",
                "19.00: BBQ Night & Makrab"
            ]
        },
        {
            day: 3,
            title: "Sunrise & Oleh-oleh",
            activities: [
                "06.00: Sunrise di dermaga homestay",
                "08.00: Snorkeling spot Taman Nemo",
                "11.00: Kembali ke Ketapang & Belanja Oleh-oleh (Keripik Pisang)",
                "16.00: Drop off Pelabuhan Bakauheni"
            ]
        }
    ],
    includes: [
        "Tiket Kapal Ferry Merak-Bakauheni (PP)",
        "Transportasi AC Bakauheni-Ketapang (PP)",
        "Sewa Perahu Snorkeling 2 Hari",
        "Homestay (AC/Non-AC tergantung paket)",
        "Makan 4x + BBQ 1x",
        "Dokumentasi Underwater (Gopro)",
        "Life Jacket"
    ],
    excludes: [
        "Upgrade VIP Class di Kapal Ferry",
        "Sewa Kaki Katak (Fin)",
        "Keperluan Pribadi"
    ],
    map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.366754252725!2d105.21631637498383!3d-5.660109994323265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4124e9a3950631%3A0x78d99519625365b4!2sPulau%20Pahawang!5e0!3m2!1sid!2sid!4v1708935012312!5m2!1sid!2sid",
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
    images: [
        "/hero-2.jpg",
        "/hero-1.jpg",
        "/articles-image/borobudur.webp",
        "/articles-image/prambanan.webp"
    ],
    meeting_points: [
        { id: 1, name: "Bandara Komodo (LBJ)", time: "10:00 WITA" },
        { id: 2, name: "Hotel Area Labuan Bajo", time: "09:30 WITA" }
    ],
    itinerary_details: [
        {
            day: 1,
            title: "Kelor - Manjarite - Kalong",
            activities: [
                "10.00: Penjemputan & Transfer ke Pelabuhan",
                "11.00: Sailing dimulai menuju Pulau Kelor (Trekking)",
                "14.00: Snorkeling di Manjarite Island",
                "17.00: Sunset di Pulau Kalong (Ribuan Kelelawar)",
                "19.00: Dinner & Bermalam di Kapal"
            ]
        },
        {
            day: 2,
            title: "Padar - Pink Beach - Komodo",
            activities: [
                "05.00: Sunrise Trekking di Pulau Padar (Iconic View)",
                "09.00: Santai & Foto di Long Pink Beach",
                "13.00: Trekking melihat Komodo Dragon di Pulau Komodo/Rinca",
                "16.00: Manta Point (Berenang bersama Manta Ray)",
                "18.00: Taka Makassar"
            ]
        },
        {
            day: 3,
            title: "Kanawa - Labuan Bajo",
            activities: [
                "08.00: Snorkeling & Santai di Pulau Kanawa",
                "11.00: Kembali ke Labuan Bajo",
                "12.00: Drop off Bandara/Hotel (End of Trip)"
            ]
        }
    ],
    includes: [
        "Living on Board (LOB) Kapal Phinisi Standard/Luxury",
        "Kamar Tidur AC & Kamar Mandi Dalam",
        "Makan Fullboard selama di kapal (Chef on board)",
        "Air Mineral, Teh, Kopi sepuasnya",
        "Alat Snorkeling",
        "Tour Guide Profesional",
        "Dokumentasi Drone & Mirrorless"
    ],
    excludes: [
        "Tiket Pesawat ke Labuan Bajo",
        "Tiket Masuk Taman Nasional Komodo (WNI/WNA)",
        "Hotel sebelum/sesudah trip",
        "Tipping Crew Kapal"
    ],
    map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.406857326345!2d119.48594237477833!3d-8.494904991544082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2db4686924d78787%3A0x69885874f370690d!2sTaman%20Nasional%20Komodo!5e0!3m2!1sid!2sid!4v1708935100312!5m2!1sid!2sid",
    price_tiers: [],
    starting_from_price: 2500000,
  }
];