// app/[locale]/blog/[id]/page.tsx
"use client"; // Komponen ini perlu state, jadi harus client component

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation"; // Gunakan dari next/navigation untuk client component
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import { blogs } from "@/data/blog"; // Impor data blog yang baru
import type { Blog } from "@/data/blog"; // Impor tipe Blog

// --- Impor Swiper ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- Impor Ikon (sesuaikan path jika perlu) ---
const CheckIcon = () => ( <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> </svg> );
const XIcon = () => ( <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> </svg> );
// Tambahkan ikon lain jika diperlukan untuk TripInfo

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
  const params = useParams(); // Hook untuk Client Component
  const t = useTranslations("blogDetail"); // Terjemahan spesifik untuk halaman detail
  const tPackages = useTranslations("packages"); // Ambil terjemahan tab dari packages
  const [activeTab, setActiveTab] = useState("Overview"); // State untuk tab aktif

  const id = params?.id as string; // Dapatkan id dari params
  const blogData = blogs.find((b) => b.id === id);

  if (!blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t("notFound")}
      </div>
    );
  }

  // Ambil data dari blogData
  const { title, images = [], category, duration, description, itinerary = [], faqs = [], mapUrl, tripInfo = [], date, author } = blogData;

  // Definisikan tab yang akan ditampilkan
  const tabs = ["Overview"];
  if (itinerary.length > 0) tabs.push("Itinerary");
  // if (blogData.cost) tabs.push("Cost"); // Jika Anda menambahkan struktur 'cost'
  if (faqs.length > 0) tabs.push("FAQs");
  if (mapUrl) tabs.push("Map");

  // Styling dinamis
  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

  // --- Fungsi Render Galeri ---
  const renderGallery = () => {
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

  return (
    <div className={mainBgClass}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Link href="/blog" className={`text-primary font-medium hover:underline mb-4 inline-block ${textClass}`}>
             ← {t("back")}
        </Link>
        <div className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}>
          {renderGallery()}

          <div className={`p-6 md:p-10 border-b ${borderClass}`}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Kategori & Durasi (jika ada) */}
              <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular" ? "bg-gray-100 text-gray-800" : "bg-gray-700 text-gray-200"}`}>
                {category}
              </div>
              {duration && (
                <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular" ? "bg-blue-100 text-blue-800" : "bg-blue-900 text-blue-200"}`}>
                  Baca: {duration} mnt
                </div>
              )}
            </div>
            <h1 className={`text-3xl md:text-5xl font-extrabold ${textClass}`}>{title}</h1>
            {/* Info Penulis & Tanggal */}
            <p className={`mt-3 text-sm ${textMutedClass}`}>
              {t("by")} {author} • {date}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
            {/* Kolom Konten Utama */}
            <div className="lg:col-span-2">
              <div className="w-full">
                {/* Navigasi Tab */}
                <div className={`w-full border-b ${borderClass} overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${activeTab === tab ? "border-primary text-primary" : `border-transparent ${textMutedClass} hover:border-gray-300 hover:text-gray-700`} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        {/* Menggunakan terjemahan tab dari 'packages' */}
                        {tPackages(`tabs.${tab.toLowerCase()}`)}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Konten Tab */}
                <div className="py-8 prose max-w-none"> {/* Tambahkan class 'prose' */}
                  {activeTab === "Overview" && (
                    <div className={textMutedClass} dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }} />
                  )}
                  {activeTab === "Itinerary" && (
                    <div className="space-y-8">
                      {itinerary.map((item) => (
                        <div key={item.day} className="flex gap-4 not-prose"> {/* 'not-prose' untuk styling manual */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary text-black rounded-full font-bold">
                              {item.day}
                            </div>
                            {item.day !== itinerary.length && <div className={`w-px h-full ${borderClass} mt-2`}></div>}
                          </div>
                          <div>
                            <h4 className={`text-lg font-bold ${textClass} mt-1`}>{item.title}</h4>
                            <p className={`${textMutedClass}`}>{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Contoh jika ada Cost
                   {activeTab === "Cost" && (
                     // ... render cost included/excluded ...
                   )}
                   */}
                  {activeTab === "FAQs" && (
                    <div className="space-y-6">
                      {faqs.map((faq) => (
                        <div key={faq.question}>
                          <h4 className={`font-bold text-lg ${textClass}`}>{faq.question}</h4>
                          <p className={textMutedClass}>{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "Map" && mapUrl && (
                     <iframe src={mapUrl} width="100%" height="450" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="rounded-lg not-prose"></iframe>
                  )}
                </div>
              </div>

               {/* Trip Info (jika ada) */}
               {tripInfo.length > 0 && (
                <div className={`mt-10 pt-10 border-t ${borderClass}`}>
                    <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>{tPackages("trip.info")}</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                    {tripInfo.map((item) => (
                        <div key={item.label} className="flex items-start space-x-4">
                        <div className="text-2xl mt-1">{item.icon}</div> {/* Asumsi icon adalah emoji */}
                        <div>
                            <p className={`text-sm ${textMutedClass}`}>{item.label}</p>
                            <p className={`font-bold ${textClass}`}>{item.value}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
               )}

            </div>

            {/* Kolom Sidebar (Opsional untuk Blog - bisa dikosongkan atau diisi info terkait) */}
            <div className="lg:col-span-1">
              {/* Anda bisa menambahkan info penulis, link terkait, atau biarkan kosong */}
               <div className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-28`}>
                  <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Tentang Penulis</h3>
                  <p className={textMutedClass}>
                    Artikel ini ditulis oleh <strong>{author}</strong> pada {date}.
                    {/* Tambahkan bio singkat jika ada */}
                  </p>
                  {/* Tambahkan link media sosial atau artikel terkait di sini */}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}