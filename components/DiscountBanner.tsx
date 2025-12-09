"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from '@/i18n/navigation';

export default function DiscountBanner() {
  const t = useTranslations("DiscountBanner");

  return (
    <section className="mt-8 mb-16 md:mt-12 md:mb-24 px-4 md:px-0">
      
     
      <div className="relative w-full min-h-[500px] md:min-h-[400px] lg:min-h-[450px] overflow-hidden shadow-xl  flex items-center">
        
       
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/banner.webp" 
            alt="Yogyakarta cityscape"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          {/* Overlay Warna */}
          <div
            className="absolute inset-0 bg-primary/90 md:bg-primary 
                       md:[clip-path:polygon(100%_0,_100%_100%,_35%_100%,_50%_0)]"
          />
        </div>

        
        <div className="relative z-10 w-full flex justify-center md:justify-end py-12 md:py-0">
          <div className="w-11/12 md:w-3/5 lg:w-1/2 p-4 md:p-12 text-white text-center md:text-left">
            
            {/* Badge */}
            <span className="inline-block bg-white/20 text-white font-bold rounded-full uppercase tracking-wider mb-4 
                             text-[10px] px-2 py-1       
                             md:text-xs md:px-3          
                             lg:text-sm lg:px-4 lg:py-1.5 border border-white/30">
              {t("badge")}
            </span>
            
           
            <h2 className="font-extrabold leading-tight mb-4
                           text-3xl        /* Mobile */
                           md:text-3xl     /* Tablet */
                           lg:text-5xl     /* Laptop */
                           xl:text-6xl     /* Layar Besar */">
              {t("title")}
            </h2>
          
            {/* Deskripsi */}
            <p className="leading-relaxed opacity-90 mx-auto md:mx-0 mb-8
                          text-sm max-w-xs             
                          md:text-sm md:max-w-sm       
                          lg:text-base lg:max-w-md     
                          xl:text-lg xl:max-w-lg">
              {t("description")}
            </p>

            {/* Tombol */}
            <div>
              <Link
                href="/packages"
                className="inline-block bg-white text-gray-900 font-bold rounded-lg shadow-lg transition-transform hover:scale-105
                           text-sm py-3 px-8           
                           md:text-sm md:py-3 md:px-6  
                           lg:text-base lg:py-4 lg:px-8"
              >
                {t("ctaButton")}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}