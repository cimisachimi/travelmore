// components/SampleItineraries.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { itinerariesData } from "@/data/itineraries";

export default function SampleItineraries() {
  const t = useTranslations("Itinerary");
  const locale = useLocale();
  
 
  const itinerariesList = Object.values(itinerariesData).map((item) => {
    
    const currentLang = (locale === "id" ? "id" : "en") as keyof typeof item.content;
    
    return {
      id: item.id,
      title: item.content[currentLang].title,
      image: item.image,
      link: `/itinerary/${item.slug}`,
    };
  });

  return (
    <section className="relative z-30 pb-8 px-2 md:px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="mt-6 md:-mt-16 grid grid-cols-3 gap-2 md:gap-6">
          
          {itinerariesList.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl p-2 md:p-3 shadow-lg border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Gambar Card */}
              <div className="relative w-full h-20 sm:h-32 md:h-40 rounded-lg overflow-hidden mb-2 md:mb-4 group">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Judul Dinamis */}
              <h3 className="text-[10px] sm:text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-4 leading-tight px-1 line-clamp-2 md:line-clamp-none">
                {item.title}
              </h3>

              {/* Tombol Preview */}
              <div className="mt-auto">
                <Link 
                  href={item.link}
                  className="block w-full py-1.5 md:py-2.5 px-1 md:px-3 rounded-md md:rounded-lg border border-gray-200 text-center text-[9px] sm:text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 group"
                >
                  <span className="md:hidden">{t("previewShort")}</span> 
                  <span className="hidden md:inline">{t("preview")}</span>
                  
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-primary transition-colors hidden sm:block" />
                </Link>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}