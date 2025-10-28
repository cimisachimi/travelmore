// data/blog.ts

// Definisikan tipe data TripInfoItem jika belum ada (bisa copy dari data/packages.ts)
export interface TripInfoItem {
  label: string;
  value: string;
  icon: string; // Emoji atau path SVG
}

// Ubah interface Blog
export interface Blog {
  id: string;
  title: string; // Judul asli tetap ada
  description: string; // Konten utama artikel (sebelumnya 'content')
  images: string[]; // Menggantikan 'image' tunggal
  date: string;
  author: string;
  category: string; // Tambahkan kategori
  duration?: number; // Opsional, jika relevan (misal: "Waktu Baca: 5 menit")
  tripInfo?: TripInfoItem[]; // Opsional, jika ada info ringkas relevan
  itinerary?: { // Opsional, bisa digunakan untuk listicle/langkah-langkah
    day: number; // Atau ganti 'day' menjadi 'step' atau 'point'
    title: string;
    description: string;
  }[];
  faqs?: { // Opsional
    question: string;
    answer: string;
  }[];
  mapUrl?: string; // Opsional
}

// Sesuaikan data blogs (contoh untuk satu artikel)
export const blogs: Blog[] = [
  {
    id: "destinasi-jogja-2025",
    title: "10 Destinasi Wisata Hits di Jogja", // Judul dari messages/id.json
    description: `
      Yogyakarta selalu punya pesona baru! Jika Anda merencanakan liburan ke Jogja di tahun mendatang,
      pastikan destinasi-destinasi paling hits ini masuk dalam daftar Anda. Dari keindahan alam
      hingga warisan budaya yang megah, Jogja menawarkan pengalaman yang tak terlupakan.
      Berikut adalah 10 tempat yang kami rekomendasikan:
    `, // Paragraf pengantar
    images: [
      "/articles-image/cover1.webp", // Gambar utama
      "/articles-image/borobudur.webp",
      "/articles-image/prambanan.webp",
      "/articles-image/keraton.webp",
      "/articles-image/tamansari.webp",
      "/articles-image/malio.webp",
      // Tambahkan gambar lain jika ada untuk galeri
    ],
    date: "5 September 2025",
    author: "Travelmore Team",
    category: "Destinasi",
    duration: 10, // Misalnya 10 menit waktu baca
    itinerary: [ // Menggunakan itinerary untuk daftar destinasi
      {
        day: 1, // Ganti jadi 'point' atau 'nomor' jika lebih cocok
        title: "Candi Borobudur",
        description: "Sebagai candi Buddha terbesar di dunia dan Situs Warisan Dunia UNESCO, Borobudur adalah mahakarya arsitektur dan spiritual yang wajib dikunjungi. Kemegahan struktur, relief kisah luhur, dan pemandangan matahari terbit magis menawarkan pengalaman tak terlupakan."
      },
      {
        day: 2,
        title: "Candi Prambanan",
        description: "Kompleks candi Hindu epik yang didedikasikan untuk Trimurti (Brahma, Wisnu, Siwa) dengan arsitektur menjulang tinggi dan anggun. Saksikan puncak keindahan arsitektur Hindu kuno dan kisah Ramayana di reliefnya. Pertunjukan Sendratari Ramayana di malam hari adalah bonus spektakuler."
      },
      {
        day: 3,
        title: "Keraton Ngayogyakarta Hadiningrat",
        description: "Jantung budaya dan sejarah Yogyakarta. Dapatkan wawasan langsung tentang kehidupan keluarga kerajaan, arsitektur Jawa penuh makna filosofis, dan tradisi yang masih hidup."
      },
      {
        day: 4,
        title: "Taman Sari",
        description: "Situs bersejarah dengan arsitektur unik perpaduan gaya Jawa dan Portugis. Dulunya taman dan pemandian Sultan, kini memukau dengan keindahan fotogenik dan lorong bawah tanah misterius."
      },
      {
        day: 5,
        title: "Jalan Malioboro",
        description: "Urat nadi perekonomian dan pariwisata Jogja. Rasakan energi kota, belanja oleh-oleh khas (batik, bakpia), dan cicipi kuliner lesehan malam hari."
      },
      {
        day: 6,
        title: "Goa Pindul",
        description: "Petualangan cave tubing unik menyusuri sungai bawah tanah. Nikmati keindahan stalaktit dan stalagmit di dalam gua yang gelap. Aman untuk hampir semua usia."
      },
      {
        day: 7,
        title: "Tur Jip Lava Merapi",
        description: "Pengalaman adrenalin dan edukatif menyusuri lereng Merapi dengan jip. Kunjungi Museum Sisa Hartaku dan Bunker Kaliadem, saksikan kedahsyatan alam dan ketangguhan warga."
      },
      {
        day: 8,
        title: "Hutan Pinus Mangunan",
        description: "Wisata alam modern populer di Dlingo. Hutan pinus rimbun dan sejuk dengan gardu pandang dan spot foto artistik. Cocok untuk mencari ketenangan dan foto lanskap menakjubkan."
      },
      {
        day: 9,
        title: "Pantai Timang",
        description: "Keindahan pesisir selatan Jogja yang eksotis dan menantang. Coba gondola tradisional atau jembatan gantung ekstrem menyeberang ke Pulau Watu Panjang."
      },
      {
        day: 10,
        title: "Museum Ullen Sentalu",
        description: "Salah satu museum terbaik Indonesia, menyajikan budaya dan sejarah Kerajaan Mataram (Yogyakarta & Surakarta) secara modern, elegan, dan mendalam. Dipandu pemandu menyusuri lorong waktu."
      }
    ],
    faqs: [ // Contoh FAQ
      { question: "Kapan waktu terbaik mengunjungi Jogja?", answer: "Musim kemarau (sekitar April hingga Oktober) umumnya lebih nyaman untuk berkeliling, tetapi Jogja menarik sepanjang tahun." },
      { question: "Apakah destinasi ini cocok untuk keluarga?", answer: "Sebagian besar cocok, namun aktivitas seperti Goa Pindul atau Tur Jip Merapi mungkin punya batasan usia atau memerlukan kondisi fisik tertentu." }
    ],
    // mapUrl: "...", // Bisa ditambahkan jika artikel fokus pada satu area
  },
  // ... (artikel lainnya disesuaikan serupa)
];