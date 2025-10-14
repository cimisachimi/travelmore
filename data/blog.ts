// data/Blog.ts
export interface Blog {
  id: string; // baru
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  content: string; // optional, nanti di artikel detail
}

export const blogs: Blog[] = [
  {
    id: "destinasi-jogja-2025",
    title: "10 Destinasi Wisata Hits di Jogja 2025",
    excerpt: "Temukan tempat-tempat wisata terbaru dan populer di Yogyakarta yang wajib masuk daftar perjalanan Anda.",
    image: "/articles-image/cover1.webp",
    date: "5 September 2025",
    author: "Travelmore Team",
    content: "Ini isi lengkap artikel untuk 10 Destinasi Wisata Hits di Jogja 2025..."
  },
  {
    id: "tips-hemat-liburan-jogja",
    title: "Tips Hemat Liburan di Yogyakarta",
    excerpt: "Nikmati perjalanan seru tanpa menguras dompet. Berikut tips hemat saat liburan di Jogja.",
    image: "/articles-image/cover2.webp",
    date: "28 Agustus 2025",
    author: "Travelmore Team",
    content: "Isi lengkap artikel tips hemat liburan di Jogja..."
  },
  {
    id: "kuliner-khas-jogja",
    title: "Kuliner Khas Jogja yang Wajib Dicoba",
    excerpt: "Tidak lengkap rasanya ke Jogja tanpa mencicipi makanan khasnya. Ini rekomendasi terbaik untuk Anda.",
    image: "/articles-image/cover3.webp",
    date: "20 Agustus 2025",
    author: "Travelmore Team",
    content: "Isi lengkap artikel kuliner khas Jogja..."
  },
];
