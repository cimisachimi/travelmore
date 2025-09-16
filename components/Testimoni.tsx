// components/Testimoni.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Testimonials() {
  const testimonials = [
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
    // ... other testimonials
  ];

  return (
    <section className="bg-card py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12 text-foreground">Apa Kata Mereka?</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={3}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          className="pb-14"
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="bg-background rounded-2xl shadow-lg p-6 flex flex-col items-center h-full border border-border">
                {/* Avatar Icon */}
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 border-2 border-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-gray-500 dark:text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z"
                    />
                  </svg>
                </div>
                {/* Testimonial Text */}
                <p className="text-foreground/80 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <h3 className="font-semibold text-foreground">{t.name}</h3>
                <span className="text-sm text-foreground/60">{t.role}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button className="custom-prev w-12 h-12 flex items-center justify-center rounded-full bg-primary text-black shadow-md hover:brightness-90 transition">
            ←
          </button>
          <button className="custom-next w-12 h-12 flex items-center justify-center rounded-full bg-primary text-black shadow-md hover:brightness-90 transition">
            →
          </button>
        </div>
      </div>
    </section>
  );
}