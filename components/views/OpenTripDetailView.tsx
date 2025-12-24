// components/views/OpenTripDetailView.tsx
"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Clock, MapPin, ArrowLeft, CheckCircle2, Users, 
  Camera, Info, Map as MapIcon, DollarSign, HelpCircle, CalendarDays, XCircle,
  MessageCircle // Added for the help button
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 
import OpenTripBookingModal from "@/app/[locale]/open-trip/[slug]/OpenTripBookingModal"; 
import { OpenTrip, ItineraryItem, AuthUser } from "@/types/opentrip";

interface OpenTripDetailViewProps {
  initialData: OpenTrip;
}

export default function OpenTripDetailView({ initialData }: OpenTripDetailViewProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useTranslations("OpenTripDetail");
  const tBooking = useTranslations("booking");

  // State
  const trip = initialData; 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const sliderRef = useRef<HTMLDivElement>(null);

  // Theme Logic
  const isDark = (theme as unknown as string) === "dark";
  const mainBgClass = isDark ? "bg-black" : "bg-gray-50";
  const contentBgClass = isDark ? "bg-gray-900" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900"; 
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-600";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";

  // WhatsApp Config
  const whatsappNumber = "6282224291148";
  const whatsappMsg = encodeURIComponent(`Hi TravelMore! I'm interested in the "${trip.name}" open trip. Can you provide more details?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  const displayImages = trip.images && trip.images.length > 0 
    ? trip.images 
    : [trip.thumbnail_url || "/placeholder.jpg"];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "itinerary", label: "Itinerary", icon: CalendarDays },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "map", label: "Map", icon: MapIcon },
  ];

  return (
    <div className={`min-h-screen pb-20 pt-24 ${mainBgClass}`}>
      {/* HEADER SECTION */}
      <div className={`${contentBgClass} border-b ${borderClass} pt-6 pb-6`}>
        <div className="container mx-auto px-4 lg:px-8">
            <Link href="/open-trip" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4 transition-colors">
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
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6 md:py-8">
        {/* GALLERY SECTION */}
        <div className="mb-8 md:mb-10 rounded-2xl overflow-hidden shadow-sm">
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-2 h-[300px]" style={{ scrollbarWidth: 'none' }} >
                {displayImages.map((img: string, index: number) => (
                    <div key={index} className="flex-shrink-0 w-[85%] snap-center relative rounded-xl overflow-hidden shadow-md">
                        <Image src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img}`} alt={`${trip.name} ${index + 1}`} fill className="object-cover" unoptimized={img.startsWith('http')} />
                    </div>
                ))}
            </div>
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[500px]">
                {[0, 1, 2, 3].map((idx) => {
                    const imgUrl = displayImages[idx] || "/placeholder.jpg";
                    const safeUrl = imgUrl.startsWith('http') ? imgUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${imgUrl}`;
                    const isMain = idx === 0;
                    return (
                        <div key={idx} className={`${isMain ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'} relative group cursor-pointer ${idx === 1 ? 'col-span-2 row-span-1' : ''}`}>
                             <Image src={safeUrl} alt={`Gallery ${idx}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized={imgUrl.startsWith('http')}/>
                             {idx === 3 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors">
                                    <div className="text-white flex flex-col items-center"><Camera size={24} /><span className="text-xs font-bold mt-1">View All</span></div>
                                </div>
                             )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Navigation */}
            <div className="sticky top-20 lg:top-24 z-10 bg-inherit pt-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 transition-all">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${activeTab === tab.id ? "bg-primary text-white border-primary shadow-md shadow-primary/30" : `bg-white text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700`}`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                    <div className={`${contentBgClass} rounded-2xl p-6 md:p-8 border ${borderClass}`}>
                        <div className="flex items-center gap-2 mb-4"><Info className="text-primary" size={20} /><h3 className={`text-xl md:text-2xl font-bold ${textClass}`}>About This Trip</h3></div>
                        <p className={`${textMutedClass} leading-relaxed text-base md:text-lg whitespace-pre-line`}>{trip.description || t("defaultDescription", { name: trip.name, location: trip.location || "Indonesia" })}</p>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: Itinerary */}
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
                                            <li key={i} className={`text-sm ${textMutedClass} flex items-start gap-2`}><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"/><span>{act}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (<p className={textMutedClass}>No itinerary details available.</p>)}
                </div>
            )}

            {/* TAB CONTENT: Pricing */}
            {activeTab === "pricing" && (
                <div className={`${contentBgClass} rounded-2xl p-6 md:p-8 border ${borderClass} animate-fadeIn`}>
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4"><DollarSign className="text-primary" size={24} /><h3 className={`text-xl font-bold ${textClass}`}>Price Tier Applied</h3></div>
                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-xs">Pax</th>
                                        <th className="px-6 py-4 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-xs text-right">Price per Pax</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {trip.price_tiers && trip.price_tiers.length > 0 ? (
                                        trip.price_tiers.sort((a,b) => a.min_pax - b.min_pax).map((tier, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{tier.min_pax} {tier.max_pax ? `- ${tier.max_pax}` : "+"} Pax</td>
                                                <td className="px-6 py-4 text-right font-bold text-primary text-base">{formatCurrency(tier.price)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={2} className="px-6 py-4 text-center text-gray-500 italic">Standard Price: {formatCurrency(Number(trip.starting_from_price))}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <h3 className={`text-xl font-bold ${textClass} mb-6`}>Inclusions & Exclusions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2"><CheckCircle2 size={20} /> {t("included")}</h4>
                            <ul className="space-y-3">{trip.includes?.map((inc, i) => (<li key={i} className={`text-sm ${textMutedClass} flex items-start gap-2`}><CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0"/><span className={textMutedClass}>{inc}</span></li>))}</ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-red-500 mb-4 flex items-center gap-2"><XCircle size={20} /> {t("excluded")}</h4>
                            <ul className="space-y-3">{trip.excludes?.map((exc, i) => (<li key={i} className={`text-sm ${textMutedClass} flex items-start gap-2`}><XCircle size={16} className="text-red-400 mt-0.5 shrink-0"/><span className={textMutedClass}>{exc}</span></li>))}</ul>
                        </div>
                    </div>
                </div>
            )}

             {/* TAB CONTENT: Map */}
             {activeTab === "map" && (
                <div className={`${contentBgClass} rounded-2xl p-2 border ${borderClass} animate-fadeIn overflow-hidden`}>
                    {trip.map_url ? (
                        <iframe src={trip.map_url} width="100%" height="450" style={{ border: 0, borderRadius: '1rem' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
                    ) : (<div className="h-64 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl"><p>Map data not available.</p></div>)}
                </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (BOOKING & HELP) */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-28 h-fit">
            {/* Booking Card */}
            <div className={`${contentBgClass} rounded-3xl p-6 shadow-xl border ${borderClass}`}>
              <div className="mb-6">
                <span className={`text-sm font-medium ${textMutedClass}`}>{t("startingFrom")}</span>
                <div className="flex flex-wrap items-baseline gap-1">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-primary">{formatCurrency(Number(trip.starting_from_price))}</h3>
                    <span className={`text-sm ${textMutedClass}`}>/ pax</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 italic">{t("priceDisclaimer")}</p>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                {t("bookNow")}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h4 className={`text-sm font-bold ${textClass} mb-2 flex items-center gap-2`}><MapPin size={16} className="text-primary" /> {t("meetingPointTitle")}</h4>
                  <p className={`text-xs leading-relaxed bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 p-3 rounded-lg`}>
                    {trip.meeting_points && trip.meeting_points.length > 0 ? trip.meeting_points.map(mp => mp.name).join(', ') : t("pickupDesc")}
                  </p>
              </div>
            </div>

            {/* Need Help Card */}
            <div className={`${contentBgClass} rounded-3xl p-6 shadow-lg border ${borderClass}`}>
               <h4 className={`font-bold mb-2 ${textClass}`}>{tBooking("needHelp")}</h4>
               <p className={`text-sm mb-4 ${textMutedClass}`}>Contact our support team for custom rental arrangements or special requests.</p>
               <a 
                 href={whatsappUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border font-bold text-center transition-all duration-300 hover:shadow-md active:scale-95 ${isDark ? "border-gray-700 hover:bg-gray-800 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-900"}`}
               >
                 <MessageCircle size={18} />
                 {tBooking("sendMessage")}
               </a>
            </div>
          </div>
        </div>
      </div>

      <OpenTripBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} pkg={trip} user={user as AuthUser | null} t={(key) => tBooking(key)} />
    </div>
  );
}