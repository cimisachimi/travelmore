// app/[locale]/page.tsx
import React from "react";
import HeroSlider from "@/components/HeroSlider";
import ActivitySlider from "@/components/ActivitySlider";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import BlogSection from "@/components/BlogSection"; 
import PopularPackagesSlider from "@/components/PopularPackagesSlider";
import DiscountBanner from "@/components/DiscountBanner";

// Components Khusus Home
import TripPlannerTeaser from "@/components/TripPlannerTeaser"; 
import SampleItineraries from "@/components/SampleItineraries"; // ✅ Pastikan path ini sesuai tempat Anda menyimpan file

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* 1. Hero Section (Slider + Form didalamnya jika pakai versi Glassmorphism) */}
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