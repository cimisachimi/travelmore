"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from '@/i18n/navigation';

export default function DiscountBanner() {
  const t = useTranslations("DiscountBanner");

  return (
   
    <section className="mt-8 mb-16 md:mt-12 md:mb-24">
      <div className="relative w-full h-[500px] md:h-[350px] overflow-hidden shadow-xl flex">
        
        <div className="relative flex-grow">
        
          <Image
            src="/banner.webp" 
            alt="Yogyakarta cityscape"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          <div
            className="absolute inset-0 bg-primary/80 md:bg-primary 
                       md:[clip-path:polygon(100%_0,_100%_100%,_35%_100%,_50%_0)]"
          />

          <div className="absolute inset-0 flex justify-center items-center md:justify-end z-10">
            <div className="w-11/12 md:w-3/5 lg:w-1/2 p-8 md:p-12 text-white text-center md:text-left">
              <span className="inline-block bg-white/20 text-white text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider mb-4">
                {t("badge")}
              </span>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                {t("title")}
              </h2>
            
              <p className="mt-4 text-sm max-w-xs mx-auto md:mx-0">
                {t("description")}
              </p>
              <div className="mt-6 space-y-4">
                
                <Link
                  href="/packages"
                  className="inline-block bg-white text-gray-900 font-bold py-3 px-8 rounded-lg text-sm shadow-md transition-transform hover:scale-105"
                >
                  {t("ctaButton")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}