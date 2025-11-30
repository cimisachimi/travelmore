"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Clock, MapPin, Star, ArrowLeft, CheckCircle2, Users, 
  Camera, Info, Map as MapIcon, DollarSign, HelpCircle, CalendarDays 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 

// Import Data Dummy
import { openTripsData } from "@/data/trips"; 
// Import Modal Booking
import OpenTripBookingModal from "./OpenTripBookingModal"; 

export default function OpenTripDetail() {
  const params = useParams();
  const { theme } = useTheme();
  const { user } = useAuth(); 
  
  const t = useTranslations("OpenTripDetail"); 
  const tBooking = useTranslations("booking");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const sliderRef = useRef<HTMLDivElement>(null);

  // Styling Variables
  const isDark = theme === "dark";
  const mainBgClass = isDark ? "bg-black" : "bg-gray-50";
  const contentBgClass = isDark ? "bg-gray-900" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900"; 
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-600";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";

  useEffect(() => {
    if (params?.id) {
      const id = Number(params.id);
      const foundTrip = openTripsData.find((item) => item.id === id);
      
      if (foundTrip) {
        if (!foundTrip.images) {
            foundTrip.images = [
                foundTrip.thumbnail_url, 
                foundTrip.thumbnail_url, 
                foundTrip.thumbnail_url,
                foundTrip.thumbnail_url
            ];
        }
        setTrip(foundTrip);
      }
      setLoading(false);
    }
  }, [params]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${mainBgClass}`}><p className="animate-pulse">Loading...</p></div>;
  if (!trip) return notFound();

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "itinerary", label: "Itinerary", icon: CalendarDays },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "map", label: "Map", icon: MapIcon },
  ];

  return (
    <div className={`min-h-screen pb-20 ${mainBgClass}`}>
      
      {/* --- HEADER SECTION --- */}
      <div className={`${contentBgClass} border-b ${borderClass} pt-6 pb-6`}>
        <div className="container mx-auto px-4 lg:px-8">
            <Link 
                href="/open-trip" 
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4 transition-colors"
            >
                <ArrowLeft size={16} /> {t("back")}
            </Link>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} /> {trip.duration} {tBooking("date") === "Pilih Tanggal" ? "Hari" : "Days"}
                </span>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                   {t("badge")}
                </span>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                   <MapPin size={14} /> {trip.location || "Indonesia"}
                </span>
            </div>

            <h1 className={`text-2xl md:text-4xl lg:text-5xl font-extrabold ${textClass} mb-2 leading-tight`}>
                {trip.name}
            </h1>
            
            <div className="flex items-center gap-1 text-yellow-500 mt-2">
                <Star size={18} fill="currentColor" />
                <span className={`font-bold ${textClass}`}>{trip.rating || 4.8}</span>
                <span className={`text-sm ${textMutedClass}`}>(120 Reviews)</span>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6 md:py-8">
        
        {/* --- GALLERY SECTION (Slider on Mobile, Grid on Desktop) --- */}
        <div className="mb-8 md:mb-10 rounded-2xl overflow-hidden shadow-sm">
            
            {/* MOBILE: Horizontal Slider */}
            <div 
                ref={sliderRef}
                className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-2 h-[300px]"
                style={{ scrollbarWidth: 'none' }} // Hide scrollbar Firefox
            >
                {trip.images?.map((img: string, index: number) => (
                    <div key={index} className="flex-shrink-0 w-[85%] snap-center relative rounded-xl overflow-hidden shadow-md">
                        <Image src={img || "/placeholder.jpg"} alt={`${trip.name} ${index + 1}`} fill className="object-cover" />
                    </div>
                ))}
            </div>

            {/* DESKTOP: Grid Layout */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[500px]">
                <div className="col-span-2 row-span-2 relative group cursor-pointer">
                    <Image src={trip.images?.[0] || "/placeholder.jpg"} alt={trip.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
                </div>
                <div className="col-span-2 row-span-1 relative group cursor-pointer">
                    <Image src={trip.images?.[1] || trip.thumbnail_url} alt="Gallery 2" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="col-span-1 row-span-1 relative group cursor-pointer">
                    <Image src={trip.images?.[2] || trip.thumbnail_url} alt="Gallery 3" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="col-span-1 row-span-1 relative group cursor-pointer">
                    <Image src={trip.images?.[3] || trip.thumbnail_url} alt="Gallery 4" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors">
                        <div className="text-white flex flex-col items-center">
                            <Camera size={24} />
                            <span className="text-xs font-bold mt-1">View All Photos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          
          {/* --- LEFT CONTENT --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tab Navigation */}
            <div className="sticky top-0 z-10 bg-inherit pt-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border
                                ${activeTab === tab.id 
                                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30" 
                                    : `bg-white text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700`}
                            `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                    <div className={`${contentBgClass} rounded-2xl p-6 md:p-8 border ${borderClass}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="text-primary" size={20} />
                            <h3 className={`text-xl md:text-2xl font-bold ${textClass}`}>About This Trip</h3>
                        </div>
                        <p className={`${textMutedClass} leading-relaxed text-base md:text-lg`}>
                            {t("defaultDescription", { name: trip.name, location: trip.location || "Indonesia" })}
                        </p>
                    </div>

                    <div className={`${contentBgClass} rounded-2xl p-6 md:p-8 border ${borderClass}`}>
                        <h3 className={`text-lg md:text-xl font-bold ${textClass} mb-6`}>{t("highlights")}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="flex items-start gap-3"><div className="mt-0.5 text-green-600 bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><CheckCircle2 size={16}/></div><span className={`${textMutedClass} text-sm md:text-base`}>{t("facilities.transport")}</span></div>
                             <div className="flex items-start gap-3"><div className="mt-0.5 text-green-600 bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><CheckCircle2 size={16}/></div><span className={`${textMutedClass} text-sm md:text-base`}>{t("facilities.ticket")}</span></div>
                             <div className="flex items-start gap-3"><div className="mt-0.5 text-green-600 bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><CheckCircle2 size={16}/></div><span className={`${textMutedClass} text-sm md:text-base`}>{t("facilities.doc")}</span></div>
                             <div className="flex items-start gap-3"><div className="mt-0.5 text-green-600 bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><CheckCircle2 size={16}/></div><span className={`${textMutedClass} text-sm md:text-base`}>{t("facilities.guide")}</span></div>
                        </div>
                    </div>
                </div>
            )}

             {activeTab !== "overview" && (
                <div className={`${contentBgClass} rounded-2xl p-10 border ${borderClass} text-center`}>
                    <p className={textMutedClass}>Information for <strong>{activeTab}</strong> will be available soon.</p>
                </div>
             )}

          </div>

          {/* --- RIGHT: BOOKING CARD --- */}
          <div className="lg:col-span-1">
            <div className={`lg:sticky lg:top-28 ${contentBgClass} rounded-3xl p-6 shadow-xl border ${borderClass}`}>
              
              <div className="mb-6">
                <span className={`text-sm font-medium ${textMutedClass}`}>{t("startingFrom")}</span>
                <div className="flex flex-wrap items-baseline gap-1">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-primary">
                        {formatCurrency(trip.starting_from_price || 0)}
                    </h3>
                    <span className={`text-sm ${textMutedClass}`}>/ pax</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 italic">{t("priceDisclaimer")}</p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                      <Users size={18} />
                      <span className="font-semibold text-sm">{t("quota")}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-emerald-100 dark:border-emerald-800 w-fit">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">{t("available")}</span>
                  </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                {t("bookNow")}
              </button>

              {/* 🔥 FIX: MEETING POINT TEXT COLOR */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                 <h4 className={`text-sm font-bold ${textClass} mb-2 flex items-center gap-2`}>
                    <MapPin size={16} className="text-primary" /> {t("meetingPointTitle")}
                 </h4>
                 {/* Menggunakan bg-gray-100 dengan text-gray-600 agar kontras di mode terang & gelap */}
                 <p className="text-xs leading-relaxed bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 p-3 rounded-lg">
                    {t("pickupDesc")}
                 </p>
              </div>

              <div className="mt-4 flex justify-center">
                  <button className={`text-sm font-semibold text-primary hover:underline flex items-center gap-1`}>
                      <HelpCircle size={14} /> Need Help?
                  </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL BOOKING --- */}
      <OpenTripBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pkg={trip}
        user={user}
        t={tBooking}
      />

    </div>
  );
}