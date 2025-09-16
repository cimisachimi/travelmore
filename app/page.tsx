// app/page.tsx
import HeroSlider from "@/components/HeroSlider";

import PopularPackages from "@/components/PopularPackages";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTASection from "@/components/CTASection";
import PersonalizedTripPlanner from "@/components/PersonalizedTripPlanner";
import Testimonials from "@/components/Testimoni";
import BlogSection from "../components/BlogSection";
import HowItWorks from "@/components/HowItWork";
import OtherServices from "@/components/OtherServices"; // ✨ Import the new component

export default function Home() {
  return (
    <>
      <HeroSlider />
      <PersonalizedTripPlanner />
      <PopularPackages />
      <HowItWorks />
      <OtherServices />  
      <WhyChooseUs />
      <CTASection />
      <BlogSection />
      <Testimonials />
      
    </>
  );
}