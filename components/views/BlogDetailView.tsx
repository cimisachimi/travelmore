// components/views/BlogDetailView.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations, useLocale } from "next-intl"; 
import { X, ArrowLeft, Calendar, User, Share2 } from "lucide-react"; 

// --- Swiper Imports ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- Interfaces ---
interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  published_at: string;
  author?: string;
  images: string[];
}

// --- Helper untuk Image URL ---
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${baseUrl}/storage/${cleanPath}`;
};

// --- Lightbox Component ---
const Lightbox = ({ 
  images, 
  initialIndex, 
  onClose 
}: { 
  images: string[]; 
  initialIndex: number; 
  onClose: () => void; 
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-[101] p-2 bg-white/10 rounded-full backdrop-blur-sm"
      >
        <X size={32} />
      </button>
      
      <div className="w-full h-full max-w-7xl mx-auto p-4 flex items-center">
        <Swiper
          initialSlide={initialIndex}
          modules={[Navigation, Pagination, Keyboard]}
          navigation
          pagination={{ clickable: true, dynamicBullets: true }}
          keyboard={{ enabled: true }}
          loop={images.length > 1}
          className="w-full h-[80vh]"
        >
          {images.map((src, i) => {
            const finalSrc = getImageUrl(src);
            return (
                <SwiperSlide key={i} className="flex items-center justify-center">
                <div className="relative w-full h-full">
                    <Image 
                    src={finalSrc} 
                    alt={`Gallery-${i}`} 
                    fill 
                    className="object-contain" 
                    priority={i === initialIndex}
                    unoptimized={finalSrc.startsWith('http')}
                    />
                </div>
                </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default function BlogDetailView({ initialData }: { initialData: Blog }) {
  const { theme } = useTheme();
  const t = useTranslations("blogDetail");
  const locale = useLocale();

  // State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };
  
  const isLight = theme === "regular";
  const mainBgClass = isLight ? "bg-gray-50" : "bg-black";
  const contentBgClass = isLight ? "bg-white" : "bg-gray-900";
  const textTitleClass = isLight ? "text-gray-900" : "text-white";
  const textBodyClass = isLight ? "text-gray-600" : "text-gray-300";
  const borderClass = isLight ? "border-gray-200" : "border-gray-800";

  const { title, images = [], content, published_at, author } = initialData;

  // --- Desktop Gallery Renderer ---
  const renderDesktopGallery = (images: string[], title: string) => {
    const count = images.length;
    
    // Fallback jika tidak ada gambar
    if (count === 0) return null;

    if (count === 1) {
      return (
        <div 
          className="relative h-[500px] w-full cursor-pointer group overflow-hidden rounded-2xl shadow-lg" 
          onClick={() => openLightbox(0)}
        >
          <Image 
            src={getImageUrl(images[0])} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
            priority 
          />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-4 h-[400px]">
          {images.map((src, i) => (
            <div key={i} className="relative w-full h-full cursor-pointer group overflow-hidden rounded-2xl shadow-md" onClick={() => openLightbox(i)}>
              <Image src={getImageUrl(src)} alt={`${title}-${i}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
      );
    }

    // Grid 3+ images
    return (
      <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
        {/* Main Image */}
        <div 
          className="relative col-span-2 row-span-2 cursor-pointer group overflow-hidden rounded-2xl shadow-md"
          onClick={() => openLightbox(0)}
        >
          <Image src={getImageUrl(images[0])} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
        </div>

        {/* Secondary Images */}
        <div className="relative col-span-2 row-span-1 cursor-pointer group overflow-hidden rounded-2xl shadow-md" onClick={() => openLightbox(1)}>
          <Image src={getImageUrl(images[1])} alt={`${title}-2`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>

        <div className={`relative ${count > 3 ? 'col-span-1' : 'col-span-2'} row-span-1 cursor-pointer group overflow-hidden rounded-2xl shadow-md`} onClick={() => openLightbox(2)}>
          <Image src={getImageUrl(images[2])} alt={`${title}-3`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>

        {count > 3 && (
          <div className="relative col-span-1 row-span-1 cursor-pointer group overflow-hidden rounded-2xl shadow-md" onClick={() => openLightbox(3)}>
            <Image src={getImageUrl(images[3])} alt={`${title}-4`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            
            {count > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-colors group-hover:bg-black/50 backdrop-blur-[2px]">
                <span className="text-white font-medium text-xl">
                  +{count - 4}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen pb-20 ${mainBgClass}`}>
        {/* Navbar Spacer */}
        <div className="h-20"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/blog" 
              className={`inline-flex items-center text-sm font-medium transition-colors hover:text-primary ${textBodyClass}`}
            >
              <div className={`p-2 rounded-full border mr-3 ${isLight ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700"} shadow-sm hover:shadow-md transition-all`}>
                <ArrowLeft size={18} />
              </div>
              {t("back")}
            </Link>
          </div>

          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${borderClass} ${contentBgClass} shadow-sm`}>
                    <Calendar size={14} className="text-primary" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${textBodyClass}`}>
                        {new Date(published_at).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                {author && (
                    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${borderClass} ${contentBgClass} shadow-sm`}>
                        <User size={14} className="text-primary" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${textBodyClass}`}>
                            {author}
                        </span>
                    </div>
                )}
            </div>
            
            <h1 className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${textTitleClass}`}>
              {title}
            </h1>
          </div>
          
          {/* Gallery Section */}
          <div className="mb-16">
            {images.length > 0 && (
              <>
                {/* Mobile Slider */}
                <div className="md:hidden rounded-2xl overflow-hidden shadow-lg">
                  <Swiper 
                    modules={[Navigation, Pagination]} 
                    navigation 
                    pagination={{ clickable: true }} 
                    loop={images.length > 1} 
                    className="w-full h-80"
                  >
                    {images.map((src, i) => (
                      <SwiperSlide key={i} onClick={() => openLightbox(i)}>
                        <div className="relative w-full h-full">
                          <Image src={getImageUrl(src)} alt={`${title}-${i}`} fill className="object-cover" priority={i === 0} />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:block">
                  {renderDesktopGallery(images, title)}
                </div>
              </>
            )}
          </div>

          {/* Content Section */}
          <article className="max-w-3xl mx-auto">
            <div 
              className={`
                prose prose-lg max-w-none 
                ${isLight ? 'prose-slate' : 'prose-invert'}
                prose-headings:font-bold prose-headings:tracking-tight
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-p:leading-relaxed
              `} 
              dangerouslySetInnerHTML={{ __html: content }} 
            />

            {/* Divider */}
            <div className={`my-12 border-t ${borderClass}`}></div>

            {/* Footer / Share */}
            <div className="flex flex-col items-center gap-6">
             
              <Link 
                href="/blog" 
                className="mt-4 inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-white bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 active:scale-95"
              >
                Read More Stories
              </Link>
            </div>
          </article>

        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox 
          images={images} 
          initialIndex={photoIndex} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}
    </>
  );
}