// components/SampleItineraries.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { itinerariesData } from "@/data/itineraries";

// Import Swiper untuk Mobile
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// --- 1. DEFINISIKAN TIPE DATA (FIX ERROR 'ANY') ---
interface ItineraryItemProps {
  id: number;
  title: string;
  image: string;
  link: string;
}


type TranslateFn = (key: string) => string;


const ItineraryCard = ({ item, t }: { item: ItineraryItemProps; t: TranslateFn }) => (
  <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    
    {/* Gambar */}
    <div className="relative w-full h-40 sm:h-48 md:h-40 rounded-lg overflow-hidden mb-4 group">
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>

    {/* Judul */}
    <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-3 leading-tight min-h-[2.5rem] line-clamp-2">
      {item.title}
    </h3>

    {/* Tombol */}
    <div className="mt-auto">
      <Link 
        href={item.link}
        className="flex w-full py-2.5 px-3 rounded-lg border border-gray-200 items-center justify-center gap-2 text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors group"
      >
        <span>{t("preview")}</span>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
      </Link>
    </div>
  </div>
);

// --- 3. Komponen Utama ---
export default function SampleItineraries() {
  const t = useTranslations("Itinerary");
  const locale = useLocale();
  
  const itinerariesList: ItineraryItemProps[] = Object.values(itinerariesData).map((item) => {
    // Pastikan key valid untuk content
    const currentLang = (locale === "id" ? "id" : "en") as keyof typeof item.content;
    
    // Safety check sederhana
    const content = item.content[currentLang] || item.content["en"];

    return {
      id: item.id,
      title: content.title,
      image: item.image,
      link: `/itinerary/${item.slug}`,
    };
  });

  return (
    <section className="relative z-30 pb-8 px-0 md:px-4 overflow-hidden md:overflow-visible">
      <div className="container mx-auto max-w-6xl">
        
        {/* --- TAMPILAN MOBILE (SLIDER) --- */}
        <div className="mt-6 px-4 md:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1.1} 
            className="pb-12 !overflow-visible"
          >
            {itinerariesList.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <ItineraryCard item={item} t={t} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* --- TAMPILAN DESKTOP (GRID TETAP) --- */}
        <div className="hidden md:grid md:-mt-16 grid-cols-3 gap-6 px-4 md:px-0">
          {itinerariesList.map((item) => (
            <div key={item.id} className="h-full">
               <ItineraryCard item={item} t={t} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}