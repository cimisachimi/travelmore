// app/page.tsx
import HeroSlider from "@/components/HeroSlider";
import ServiceHighlights from "@/components/ServiceHighlights";
import CustomExperience from "@/components/CustomExperience";
import PopularPackages from "@/components/PopularPackages";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import PersonalizedTripPlanner from "@/components/PersonalizedTripPlanner"; // ✨ Impor komponen baru
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <PersonalizedTripPlanner /> {/* ✨ Ganti ProductDisplay dengan ini */}
      <ServiceHighlights />
      <CustomExperience />
      <PopularPackages />
      <WhyChooseUs />
      <CTASection />

      {/* Konten lain bisa diletakkan di bawah */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Konten Tambahan</h1>
        <p className="mb-4">Bagian ini untuk konten lainnya di halaman utama.</p>
      </div>
    </>
  );
}