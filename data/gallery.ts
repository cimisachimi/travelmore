// data/gallery.ts

export interface Destination {
  id: number;
  name: string;
  imageUrl: string;
  // --- Tambahan 4 Poin Baru ---
  description: string; // 1. Storytelling
  location: string;    // 2. Lokasi
  bestTime: string;    // 3. Waktu Terbaik
  priceStart: string;  // 4. Estimasi Harga
}

export const destinations: Destination[] = [
  {
    id: 1,
    name: "Prambanan Temple",
    imageUrl: "/articles-image/prambanan.webp",
    description: "Candi Hindu terbesar di Indonesia yang dibangun pada abad ke-9. Terkenal dengan legenda Roro Jonggrang dan relief kisah Ramayana yang memukau. Saksikan kemegahan arsitektur kuno yang menjulang tinggi ke langit.",
    location: "Sleman, Yogyakarta",
    bestTime: "15.00 - 17.30 (Sunset)",
    priceStart: "Rp 50.000 (Domestik)"
  },
  {
    id: 2,
    name: "Yogyakarta Monument",
    imageUrl: "/articles-image/malio.webp",
    description: "Tugu Pal Putih adalah landmark paling ikonik di Yogyakarta. Terletak di garis imajiner yang menghubungkan Gunung Merapi, Keraton, dan Laut Selatan. Simbol semangat persatuan rakyat dan penguasa melawan penjajah.",
    location: "Pusat Kota Yogyakarta",
    bestTime: "Malam Hari (Lampu Kota)",
    priceStart: "Gratis"
  },
  {
    id: 3,
    name: "Taman Sari Water Castle",
    imageUrl: "/articles-image/tamansari.webp",
    description: "Bekas taman kerajaan Kesultanan Yogyakarta. Bangunan ini memadukan arsitektur Jawa dan Portugis dengan kolam pemandian yang indah dan lorong bawah tanah yang penuh misteri.",
    location: "Kompleks Keraton, Yogyakarta",
    bestTime: "09.00 - 14.00",
    priceStart: "Rp 15.000"
  },
  // ... Tambahkan data dummy lainnya sesuai kebutuhan (id 4, 5, 6 dst)
];