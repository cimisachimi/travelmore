"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Clock, MapPin, Star, ArrowLeft, CheckCircle2, Users, 
  Camera, Info, Map as MapIcon, DollarSign, HelpCircle, CalendarDays, XCircle 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 
import api from "@/lib/api"; // ✅ Import API

import OpenTripBookingModal from "./OpenTripBookingModal"; 

// --- INTERFACES MATCHING BACKEND ---
interface ItineraryItem {
  day: number;
  title: string;
  activities: string[];
}

interface MeetingPoint {
  id: number;
  name: string;
  time?: string;
}

interface PriceTier {
  min_pax: number;
  max_pax: number | null;
  price: number;
}

export interface TripDetail {
  id: number;
  name: string;
  description?: string;
  location?: string;
  duration: number;
  rating?: number;
  thumbnail_url?: string | null;
  images?: string[];
  starting_from_price: number | null;
  
  // JSON Fields from Backend
  price_tiers: PriceTier[];
  itinerary_details?: ItineraryItem[];
  includes?: string[];
  excludes?: string[];
  meeting_points?: MeetingPoint[];
  map_url?: string;
}

export default function OpenTripDetail() {
  const params = useParams();
  const { theme } = useTheme();
  const { user } = useAuth(); 
  
  const t = useTranslations("OpenTripDetail"); 
  const tBooking = useTranslations("booking");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const sliderRef = useRef<HTMLDivElement>(null);

  const isDark = (theme as unknown as string) === "dark";
  const mainBgClass = isDark ? "bg-black" : "bg-gray-50";
  const contentBgClass = isDark ? "bg-gray-900" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900"; 
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-600";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";

  // ✅ Fetch Data from API
  useEffect(() => {
    if (params?.id) {
      const fetchTrip = async () => {
        try {
          const response = await api.get(`/open-trips/${params.id}`);
          const tripData: TripDetail = response.data;
          
          // Fallback if images array is empty
          if (!tripData.images || tripData.images.length === 0) {
             const thumb = tripData.thumbnail_url || "/placeholder.jpg";
             tripData.images = [thumb, thumb, thumb, thumb];
          }

          setTrip(tripData);
        } catch (error) {
          console.error("Error fetching trip:", error);
          setTrip(null);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTrip();
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
      
      {/* HEADER SECTION */}
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
        
        {/* GALLERY SECTION */}
        <div className="mb-8 md:mb-10 rounded-2xl overflow-hidden shadow-sm">
            <div 
                ref={sliderRef}
                className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-2 h-[300px]"
                style={{ scrollbarWidth: 'none' }} 
            >
                {trip.images?.map((img: string, index: number) => (
                    <div key={index} className="flex-shrink-0 w-[85%] snap-center relative rounded-xl overflow-hidden shadow-md">
                        <Image 
                            src={img.startsWith('http') ? img : `/storage/${img}`} 
                            alt={`${trip.name} ${index + 1}`} 
                            fill 
                            className="object-cover"
                            unoptimized={img.startsWith('http')}
                        />
                    </div>
                ))}
            </div>

            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[500px]">
                {/* Helper to get safe image URL */}
                {[0, 1, 2, 3].map((idx) => {
                    const imgUrl = trip.images?.[idx] || trip.thumbnail_url || "/placeholder.jpg";
                    const safeUrl = imgUrl.startsWith('http') ? imgUrl : `/storage/${imgUrl}`;
                    const isMain = idx === 0;
                    
                    return (
                        <div key={idx} className={`${isMain ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'} relative group cursor-pointer ${idx === 1 ? 'col-span-2 row-span-1' : ''}`}>
                             <Image 
                                src={safeUrl} 
                                alt={`Gallery ${idx}`} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                                unoptimized={imgUrl.startsWith('http')}
                             />
                             {idx === 3 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors">
                                    <div className="text-white flex flex-col items-center">
                                        <Camera size={24} />
                                        <span className="text-xs font-bold mt-1">View All Photos</span>
                                    </div>
                                </div>
                             )}
                        </div>
                    );
                })}
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

            {/* --- TAB CONTENT LOGIC --- */}
            
            {/* 1. OVERVIEW */}
            {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                    <div className={`${contentBgClass} rounded-2xl p-6 md:p-8 border ${borderClass}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="text-primary" size={20} />
                            <h3 className={`text-xl md:text-2xl font-bold ${textClass}`}>About This Trip</h3>
                        </div>
                        <p className={`${textMutedClass} leading-relaxed text-base md:text-lg whitespace-pre-line`}>
                            {trip.description || t("defaultDescription", { name: trip.name, location: trip.location || "Indonesia" })}
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

            {/* 2. ITINERARY */}
            {activeTab === "itinerary" && (
                <div className={`${contentBgClass} rounded-2xl p-6 md:p-8 border ${borderClass} animate-fadeIn`}>
                    <h3 className={`text-xl font-bold ${textClass} mb-6`}>Trip Itinerary</h3>
                    {trip.itinerary_details && trip.itinerary_details.length > 0 ? (
                        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                            {trip.itinerary_details.map((item: ItineraryItem, idx: number) => (
                                <div key={idx} className="relative pl-6">
                                    <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-gray-900"></span>
                                    <h4 className={`text-lg font-bold ${textClass} mb-2`}>Day {item.day}: {item.title}</h4>
                                    <ul className="space-y-2">
                                        {item.activities.map((act: string, i: number) => (
                                            <li key={i} className={`text-sm ${textMutedClass} flex items-start gap-2`}>
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"/>
                                                <span>{act}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={textMutedClass}>No itinerary details available.</p>
                    )}
                </div>
            )}

            {/* 3. PRICING - UPDATED TO SHOW TIERS */}
            {activeTab === "pricing" && (
                <div className={`${contentBgClass} rounded-2xl p-6 md:p-8 border ${borderClass} animate-fadeIn`}>
                    
                    {/* Price Tiers Table */}
                    <div className="mb-8">
                        <h3 className={`text-xl font-bold ${textClass} mb-4`}>Price Tiers</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Pax (People)</th>
                                        <th className="px-4 py-3 rounded-r-lg text-right">Price per Pax</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trip.price_tiers && trip.price_tiers.length > 0 ? (
                                        trip.price_tiers.sort((a,b) => a.min_pax - b.min_pax).map((tier, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className={`px-4 py-3 font-medium ${textClass}`}>
                                                    {tier.min_pax} {tier.max_pax ? `- ${tier.max_pax}` : "+"} Pax
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-primary">
                                                    {formatCurrency(tier.price)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 text-center text-gray-500">
                                                Standard Price: {formatCurrency(trip.starting_from_price || 0)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h3 className={`text-xl font-bold ${textClass} mb-6`}>Inclusions & Exclusions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Includes */}
                        <div>
                            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={20} /> {t("included") || "What's Included"}
                            </h4>
                            <ul className="space-y-3">
                                {trip.includes && trip.includes.length > 0 ? trip.includes.map((inc: string, i: number) => (
                                    <li key={i} className={`text-sm ${textMutedClass} flex items-start gap-2`}>
                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0"/>
                                        {inc}
                                    </li>
                                )) : <p className={`text-sm ${textMutedClass}`}>-</p>}
                            </ul>
                        </div>
                        
                        {/* Excludes */}
                        <div>
                            <h4 className="font-bold text-red-500 mb-4 flex items-center gap-2">
                                <XCircle size={20} /> {t("excluded") || "What's Not Included"}
                            </h4>
                            <ul className="space-y-3">
                                {trip.excludes && trip.excludes.length > 0 ? trip.excludes.map((exc: string, i: number) => (
                                    <li key={i} className={`text-sm ${textMutedClass} flex items-start gap-2`}>
                                        <XCircle size={16} className="text-red-400 mt-0.5 shrink-0"/>
                                        {exc}
                                    </li>
                                )) : <p className={`text-sm ${textMutedClass}`}>-</p>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. MAP */}
            {activeTab === "map" && (
                <div className={`${contentBgClass} rounded-2xl p-2 border ${borderClass} animate-fadeIn overflow-hidden`}>
                    {trip.map_url ? (
                        <iframe 
                            src={trip.map_url} 
                            width="100%" 
                            height="450" 
                            style={{ border: 0, borderRadius: '1rem' }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <p>Map data not available.</p>
                        </div>
                    )}
                </div>
            )}

          </div>

          {/* --- RIGHT: BOOKING CARD (Sticky) --- */}
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

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                 <h4 className={`text-sm font-bold ${textClass} mb-2 flex items-center gap-2`}>
                    <MapPin size={16} className="text-primary" /> {t("meetingPointTitle")}
                 </h4>
                 <p className={`text-xs leading-relaxed bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 p-3 rounded-lg`}>
                    {trip.meeting_points && trip.meeting_points.length > 0 
                        ? trip.meeting_points.map(mp => mp.name).join(', ') 
                        : t("pickupDesc")}
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
      {trip && (
          <OpenTripBookingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            pkg={trip} // ✅ Passing Real Backend Data
            user={user}
            t={tBooking}
          />
      )}

    </div>
  );
}