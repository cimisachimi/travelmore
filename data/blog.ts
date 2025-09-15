// data/Blog.ts
export interface Blog {
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
}

export const blogs: Blog[] = [
  {
    title: "10 Destinasi Wisata Hits di Jogja 2025",
    excerpt:
      "Temukan tempat-tempat wisata terbaru dan populer di Yogyakarta yang wajib masuk daftar perjalanan Anda.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    date: "5 September 2025",
    author: "Travelmore Team",
  },
  {
    title: "Tips Hemat Liburan di Yogyakarta",
    excerpt:
      "Nikmati perjalanan seru tanpa menguras dompet. Berikut tips hemat saat liburan di Jogja.",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
    date: "28 Agustus 2025",
    author: "Travelmore Team",
  },
  {
    title: "Kuliner Khas Jogja yang Wajib Dicoba",
    excerpt:
      "Tidak lengkap rasanya ke Jogja tanpa mencicipi makanan khasnya. Ini rekomendasi terbaik untuk Anda.",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
    date: "20 Agustus 2025",
    author: "Travelmore Team",
  },
];
