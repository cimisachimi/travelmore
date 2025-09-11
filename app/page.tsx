// app/page.tsx
import HeroSlider from "@/components/HeroSlider";
import ServiceHighlights from "@/components/ServiceHighlights";

import PopularPackages from "@/components/PopularPackages";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import PersonalizedTripPlanner from "@/components/PersonalizedTripPlanner";
import Testimonials from "@/components/Testimoni";
import BlogSection from "../components/BlogSection";
import HowItWorks from "@/components/HowItWork";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <HowItWorks />
      <PersonalizedTripPlanner />
      <ServiceHighlights />

      <PopularPackages />
      <WhyChooseUs />
      <CTASection />
      <Testimonials />
      <BlogSection />

      {/* Konten lain bisa diletakkan di bawah */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Konten Tambahan</h1>
        <p className="mb-4">Bagian ini untuk konten lainnya di halaman utama.</p>
      </div>
    </>
  );
}