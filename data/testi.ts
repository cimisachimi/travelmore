export interface Testimonial {
  name: string;
  role: string;
  text: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Andi Prasetyo",
    role: "Traveler",
    text: "Pengalaman wisata yang luar biasa! Semua diatur dengan sangat rapi dan fleksibel sesuai keinginan kami.",
  },
  {
    name: "Siti Lestari",
    role: "Backpacker",
    text: "Timnya sangat membantu, perjalanan saya ke Jogja jadi lebih menyenangkan dan berkesan.",
  },
  {
    name: "Budi Santoso",
    role: "Family Trip",
    text: "Pelayanan ramah, harga terjangkau, dan itinerary sesuai kebutuhan keluarga kami. Sangat puas!",
  },
  {
    name: "Rani Suryani",
    role: "Mahasiswa",
    text: "Pemandu wisata yang informatif dan sabar. Liburan jadi lebih mudah dan penuh cerita!",
  },
  {
    name: "Rudi Hartono",
    role: "Solo Traveler",
    text: "Destinasi yang dipilih sangat menarik, jauh dari keramaian. Saya mendapatkan pengalaman otentik yang tidak terlupakan.",
  },
];