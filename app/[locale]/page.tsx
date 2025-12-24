import React from "react";
import dynamic from "next/dynamic"; // Impor fungsi dynamic

// Komponen Atas Fold (Tetap gunakan static import agar LCP cepat)
import HeroSlider from "@/components/HeroSlider";
import SampleItineraries from "@/components/SampleItineraries";

// Komponen Bawah Fold (Ubah menjadi Dynamic Import)
const ActivitySlider = dynamic(() => import("@/components/ActivitySlider"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl" />, // Placeholder saat loading
  ssr: true, // Tetap gunakan SSR jika konten penting untuk SEO
});

const PopularPackagesSlider = dynamic(() => import("@/components/PopularPackagesSlider"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl" />,
});

const BlogSection = dynamic(() => import("@/components/BlogSection"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl" />,
});

const DiscountBanner = dynamic(() => import("@/components/DiscountBanner"));
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const CTASection = dynamic(() => import("@/components/CTASection"));

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* 1. Hero Section (Static Import - Prioritas Utama) */}
      <HeroSlider />
      
      <SampleItineraries />

      
      {/* 4. Banner Diskon */}
      <DiscountBanner />
      
      {/* 5. Paket Populer Slider */}
      <PopularPackagesSlider />
      
      {/* 6. Aktivitas / Wisata */}
      <ActivitySlider />
      
      
      {/* 7. Keunggulan Kami */}
      <WhyChooseUs />
      
      {/* 8. Call to Action */}
      <CTASection />
      
      {/* 9. Blog Terbaru */}
      <BlogSection />
      
      
    </main>
  );
}