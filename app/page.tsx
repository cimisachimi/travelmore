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
import ComparisonSection from "@/components/ComparisonSection";
import OtherServices from "@/components/OtherServices"; // ✨ Import the new component

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ComparisonSection />
      <OtherServices /> {/* ✨ New component is placed here */}
      <HowItWorks />
      <PersonalizedTripPlanner />
      <ServiceHighlights />
      <PopularPackages />
      <WhyChooseUs />
      <CTASection />
      <Testimonials />
      <BlogSection />
    </>
  );
}