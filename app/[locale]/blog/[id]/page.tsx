"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api"; // Assuming you have an api helper

// --- Impor Swiper ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- Tipe data baru dari API ---
interface Blog {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  published_at: string;
  author: string;
  images: string[]; // Ini adalah array string URL
}

// --- Komponen MobileImageSlider ---
const MobileImageSlider = ({ images, title }: { images: string[]; title: string; }) => (
    <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} loop={images.length > 1} className="w-full h-72 md:h-96">
        {images.map((src, i) => (
            <SwiperSlide key={i}>
                <div className="relative w-full h-full">
                    <Image src={src} alt={`${title}-${i}`} fill className="object-cover" priority={i === 0} />
                </div>
            </SwiperSlide>
        ))}
    </Swiper>
);

export default function BlogDetail() {
  const { theme } = useTheme();
  const params = useParams();
  const t = useTranslations("blogDetail");
  const tPackages = useTranslations("packages"); // For "no image" text

  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dapatkan slug dari params (file [id] akan menangkap slug)
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

  // Styling dinamis
  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

  // --- Fungsi Render Galeri ---
  const renderGallery = (images: string[], title: string) => {
    const count = images.length;
    if (count === 0) return ( <div className={`w-full h-[400px] ${theme === "regular" ? "bg-gray-200" : "bg-gray-900"} rounded-lg flex items-center justify-center text-gray-500`}> {tPackages("gallery.noImage")} </div> );

    return (
      <>
        {/* Mobile Slider */}
        <div className="md:hidden">
          <MobileImageSlider images={images} title={title} />
        </div>
        {/* Desktop Grid (adaptasi dari packages) */}
         {count === 1 && ( <div className="relative h-96 md:h-[500px] hidden md:block"> <Image src={images[0]} alt={title} fill className="object-cover" priority /> </div> )}
         {count === 2 && ( <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-2 h-72 md:h-[400px]"> {images.map((src, i) => ( <div key={i} className="relative w-full h-full"> <Image src={src} alt={`${title}-${i}`} fill className="object-cover" /> </div> ))} </div> )}
         {count > 2 && ( <div className="hidden md:grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-96 md:h-[500px]"> <div className="relative md:col-span-2 md:row-span-2"> <Image src={images[0]} alt={title} fill className="object-cover" priority /> </div> {images.slice(1, 4).map((src, i) => ( <div key={i} className="relative"> <Image src={src} alt={`${title}-${i + 1}`} fill className="object-cover" /> </div> ))} </div> )}
      </>
    );
  };

  // --- Render States ---
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

  // Data sudah ada
  const { title, images = [], content, published_at, author } = blogData;

  return (
    <div className={mainBgClass}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Link href="/blog" className={`text-primary font-medium hover:underline mb-4 inline-block ${textClass}`}>
             ← {t("back")}
        </Link>
        <div className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}>
          {renderGallery(images, title)}

          <div className={`p-6 md:p-10 border-b ${borderClass}`}>
            {/* Judul dan Info Penulis */}
            <h1 className={`text-3xl md:text-5xl font-extrabold ${textClass}`}>{title}</h1>
            <p className={`mt-3 text-sm ${textMutedClass}`}>
              {t("by")} {author} • {new Date(published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
            {/* Kolom Konten Utama */}
            <div className="lg:col-span-2">
              {/* Konten Blog */}
              {/* prose: class dari tailwind-typography untuk styling HTML */}
              <div 
                className={`prose dark:prose-invert max-w-none ${textMutedClass}`} 
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            </div>

            {/* Kolom Sidebar Info Penulis */}
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
  );
}