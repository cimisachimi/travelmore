"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api"; 
import { X } from "lucide-react"; 

// --- Impor Swiper ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  published_at: string;
  author: string;
  images: string[];
}


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
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full"
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
          {images.map((src, i) => (
            <SwiperSlide key={i} className="flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image 
                  src={src} 
                  alt={`Gallery-${i}`} 
                  fill 
                  className="object-contain" 
                  priority={i === initialIndex}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default function BlogDetail() {
  const { theme } = useTheme();
  const params = useParams();
  const t = useTranslations("blogDetail");
  const tPackages = useTranslations("packages");

  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // State untuk Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const slug = params?.id as string;

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get(`/public/posts/${slug}`);
        setBlogData(response.data);
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  
  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

 
  const renderDesktopGallery = (images: string[], title: string) => {
    const count = images.length;
    
    // Grid Logic
    if (count === 1) {
      return (
        <div 
          className="relative h-96 md:h-[500px] cursor-pointer group overflow-hidden" 
          onClick={() => openLightbox(0)}
        >
          <Image src={images[0]} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 h-96 md:h-[400px]">
          {images.map((src, i) => (
            <div key={i} className="relative w-full h-full cursor-pointer group overflow-hidden" onClick={() => openLightbox(i)}>
              <Image src={src} alt={`${title}-${i}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          ))}
        </div>
      );
    }

    
    return (
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 md:h-[500px]">
        {/* Gambar Utama (Besar Kiri) */}
        <div 
          className="relative col-span-2 row-span-2 cursor-pointer group overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          <Image src={images[0]} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
        </div>

        {/* Gambar Kedua (Kanan Atas) */}
        <div 
          className="relative col-span-2 row-span-1 cursor-pointer group overflow-hidden"
          onClick={() => openLightbox(1)}
        >
          <Image src={images[1]} alt={`${title}-2`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>

        {/* Gambar Ketiga (Kanan Bawah Kiri) */}
        <div 
          className={`relative ${count > 3 ? 'col-span-1' : 'col-span-2'} row-span-1 cursor-pointer group overflow-hidden`}
          onClick={() => openLightbox(2)}
        >
          <Image src={images[2]} alt={`${title}-3`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>

        {/* Gambar Keempat (Kanan Bawah Kanan) dengan Overlay jika ada lebih banyak */}
        {count > 3 && (
          <div 
            className="relative col-span-1 row-span-1 cursor-pointer group overflow-hidden"
            onClick={() => openLightbox(3)}
          >
            <Image src={images[3]} alt={`${title}-4`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            
            {/* Overlay jika sisa gambar > 0 (Artinya total gambar > 4) */}
            {count > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-colors group-hover:bg-black/50">
                <span className="text-white font-bold text-xl md:text-2xl">
                  +{count - 4}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${mainBgClass} ${textMutedClass}`}>
        Loading post...
      </div>
    );
  }

  if (error || !blogData) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${mainBgClass} ${textMutedClass}`}>
        <h1 className="text-2xl font-bold">{t("notFound")}</h1>
        <Link href="/blog" className="text-primary font-medium hover:underline mt-4">
           ← {t("back")}
        </Link>
      </div>
    );
  }

  const { title, images = [], content, published_at, author } = blogData;

  return (
    <>
      <div className={mainBgClass}>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Link href="/blog" className={`text-primary font-medium hover:underline mb-4 inline-block ${textClass}`}>
             ← {t("back")}
          </Link>
          
          <div className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}>
            
            {/* --- Bagian Galeri --- */}
            {images.length === 0 ? (
               <div className={`w-full h-[400px] ${theme === "regular" ? "bg-gray-200" : "bg-gray-900"} flex items-center justify-center text-gray-500`}>
                 {tPackages("gallery.noImage")}
               </div>
            ) : (
              <>
                {/* Mobile Slider (Tetap menggunakan Swiper di Mobile) */}
                <div className="md:hidden">
                  <Swiper 
                    modules={[Navigation, Pagination]} 
                    navigation 
                    pagination={{ clickable: true }} 
                    loop={images.length > 1} 
                    className="w-full h-72"
                  >
                    {images.map((src, i) => (
                      <SwiperSlide key={i} onClick={() => openLightbox(i)}>
                        <div className="relative w-full h-full">
                          <Image src={src} alt={`${title}-${i}`} fill className="object-cover" priority={i === 0} />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Desktop Grid (Custom Layout) */}
                <div className="hidden md:block">
                  {renderDesktopGallery(images, title)}
                </div>
              </>
            )}

            <div className={`p-6 md:p-10 border-b ${borderClass}`}>
              <h1 className={`text-3xl md:text-5xl font-extrabold ${textClass}`}>{title}</h1>
              <p className={`mt-3 text-sm ${textMutedClass}`}>
                {t("by")} {author} • {new Date(published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
              <div className="lg:col-span-2">
                <div 
                  className={`prose dark:prose-invert max-w-none ${textMutedClass}`} 
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              </div>

              <div className="lg:col-span-1">
                 <div className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-28`}>
                   <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Tentang Penulis</h3>
                   <p className={textMutedClass}>
                     Artikel ini ditulis oleh <strong>{author}</strong> pada {new Date(published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Lightbox Modal jika state open */}
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