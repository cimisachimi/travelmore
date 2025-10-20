"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import { activities } from "@/data/activities";
import type { Activity } from "@/data/activities";

// --- Impor Swiper untuk Slider ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- Komponen Slider untuk Mobile (Diambil dari PackageDetail) ---
const MobileImageSlider = ({
  images,
  title,
}: {
  images: string[];
  title: string;
}) => (
  <Swiper
    modules={[Navigation, Pagination]}
    navigation
    pagination={{ clickable: true }}
    loop={true}
    className="w-full h-96"
  >
    {images.map((src, i) => (
      <SwiperSlide key={i}>
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={`${title}-${i}`}
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
);



const CheckIcon = () => ( <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> </svg> );
const XIcon = () => ( <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> </svg> );
const ClockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 Sio 11-18 0 9 9 0 0118 0z" /> </svg> );
const LocationIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> );


// --- Komponen Utama Halaman ---
export default function ActivityDetailPage() {
  const { theme } = useTheme();
  const params = useParams();
  const t = useTranslations("activityDetail");
  const tPackages = useTranslations("packages");
  const [activeTab, setActiveTab] = useState("Overview");

  const activity = activities.find(a => a.id.toString() === params.id);

  if (!activity) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">{t("notFound")}</div>;
  }
  
  
  const images = [activity.image, activity.image, activity.image, activity.image];

  const tripInfo = [
    { label: t('location'), value: activity.location, icon: <LocationIcon /> },
    { label: t('duration'), value: activity.duration, icon: <ClockIcon /> }
  ];
  
  const tabs = ["Overview", "FAQs", "Map"];
  const price = theme === 'regular' ? activity.regularPrice : activity.exclusivePrice;

  // Class styling dinamis berdasarkan tema
  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  // --- Fungsi Render Galeri ---
  const renderGallery = () => {
    const count = images.length;
    if (count === 0) return ( <div className={`w-full h-[400px] ${theme === "regular" ? "bg-gray-200" : "bg-gray-900"} rounded-lg flex items-center justify-center text-gray-500`}> {t("gallery.noImage")} </div> );

    return (
      <>
        {/* Tampilan Mobile: Slider */}
        <div className="md:hidden">
          <MobileImageSlider images={images} title={activity.title} />
        </div>

        {/* Tampilan Desktop: Grid Mosaic */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-96 md:h-[600px]">
            <div className="relative md:col-span-2 md:row-span-2">
                <Image src={images[0]} alt={activity.title} fill className="object-cover" priority />
            </div>
            {images.slice(1, 4).map((src, i) => (
                <div key={i} className="relative">
                    <Image src={src} alt={`${activity.title}-${i + 1}`} fill className="object-cover" />
                </div>
            ))}
        </div>
      </>
    );
  };


  return (
    <div className={mainBgClass}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* --- Breadcrumbs --- */}
        <nav className="text-sm text-foreground/60 mb-4" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center"> <Link href={`/${params.locale}`} className="hover:underline">Home</Link> </li>
            <li className="flex items-center"> <span className="mx-2">/</span> <Link href={`/${params.locale}/activities`} className="hover:underline capitalize">Activities</Link> </li>
            <li className="flex items-center"> <span className="mx-2">/</span> <span className="font-medium text-foreground">{activity.title}</span> </li>
          </ol>
        </nav>

        <div className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}>
          {renderGallery()}

          <div className={`p-6 md:p-10 border-b ${borderClass}`}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular" ? "bg-teal-100 text-teal-800" : "bg-teal-900 text-teal-200"}`}>
                {activity.category}
              </div>
            </div>
            <h1 className={`text-3xl md:text-5xl font-extrabold ${textClass}`}>{activity.title}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
            {/* --- Kolom Kiri: Konten Utama --- */}
            <div className="lg:col-span-2">
              <div className="w-full">
                
                {/* Navigasi Tab */}
                <div className={`w-full border-b ${borderClass} overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${ activeTab === tab ? "border-primary text-primary" : `border-transparent ${textMutedClass} hover:border-gray-300 hover:text-gray-700` } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        {tPackages(`tabs.${tab.toLowerCase()}`)}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Konten Tab */}
                <div className="py-8">
                  {activeTab === "Overview" && (
                    <div className="space-y-6">
                        <p className={`text-lg leading-relaxed ${textMutedClass}`}>{activity.description}</p>
                        <h3 className={`text-xl font-bold ${textClass}`}>{t("highlights")}</h3>
                        <ul className="space-y-2">
                            {activity.highlights.map(item => ( <li key={item} className="flex items-start gap-3"> <CheckIcon /> <span className={textMutedClass}>{item}</span> </li> ))}
                        </ul>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div>
                                <h4 className={`text-lg font-bold mb-4 ${textClass}`}>{t("includes")}</h4>
                                <ul className="space-y-2">
                                    {activity.includes.map((item) => ( <li key={item} className="flex items-start gap-3"> <CheckIcon /> <span className={textMutedClass}>{item}</span> </li> ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className={`text-lg font-bold mb-4 ${textClass}`}>{t("excludes")}</h4>
                                <ul className="space-y-2">
                                    {activity.excludes.map((item) => ( <li key={item} className="flex items-start gap-3"> <XIcon /> <span className={textMutedClass}>{item}</span> </li> ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                  )}

                  {activeTab === "FAQs" && (
                     <div className="space-y-6">
                        {activity.faqs.map((faq, index) => (
                          <div key={index} className={`pb-4 border-b ${borderClass} last:border-b-0`}>
                            <h4 className={`font-bold text-lg ${textClass} mb-1`}>{faq.q}</h4>
                            <p className={textMutedClass}>{faq.a}</p>
                          </div>
                        ))}
                      </div>
                  )}

                  {activeTab === "Map" && (
                    <iframe src={activity.mapLink} width="100%" height="450" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="rounded-lg"></iframe>
                  )}
                </div>
              </div>

              {/* Info Penting */}
              <div className={`mt-10 pt-10 border-t ${borderClass}`}>
                <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>{tPackages("trip.info")}</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  {tripInfo.map((item) => (
                    <div key={item.label} className="flex items-start space-x-4">
                      <div className="text-2xl mt-1 text-primary">{item.icon}</div>
                      <div>
                        <p className={`text-sm ${textMutedClass}`}>{item.label}</p>
                        <p className={`font-bold ${textClass}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-28`}>
                <div className="text-center mb-5">
                    <p className={`text-sm ${textMutedClass}`}>{t("startingFrom")}</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(price)}</p>
                    
                    <p className={`text-sm ${textMutedClass}`}>/ {tPackages("trip.adult")}</p>
                </div>
                <Link
                  href={`/${params.locale}/booking?activity=${encodeURIComponent(activity.title)}`}
                  className="w-full block text-center bg-primary text-black font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 hover:brightness-90"
                >
                  {t("bookNow")}
                </Link>
                <p className="text-center text-xs text-gray-500 mt-4">
                  {t("bookingNote")}
                </p>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

