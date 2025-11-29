"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import { Clock, MapPin, Star, ArrowLeft, CheckCircle2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 

// Import Data Dummy
import { openTripsData } from "@/data/trips"; 
// Import Modal Booking
import OpenTripBookingModal from "./OpenTripBookingModal"; 

export default function OpenTripDetail() {
  const params = useParams();
  const { theme } = useTheme();
  const { user } = useAuth(); 
  
  // ✅ GUNAKAN TRANSLATION
  const t = useTranslations("OpenTripDetail"); 
  const tBooking = useTranslations("booking");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Styling Classes
  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-900";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-400";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

  useEffect(() => {
    if (params?.id) {
      const id = Number(params.id);
      const foundTrip = openTripsData.find((item) => item.id === id);
      
      if (foundTrip) {
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

  if (loading) {
    return (
        <div className={`min-h-screen flex items-center justify-center ${mainBgClass}`}>
            <p className="animate-pulse">Loading Trip Details...</p>
        </div>
    );
  }
  
  if (!trip) {
      return notFound();
  }

  return (
    <div className={`min-h-screen pb-20 ${mainBgClass}`}>
      
      {/* --- HERO IMAGE --- */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={trip.thumbnail_url || "/placeholder.jpg"}
          alt={trip.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-end pb-10 container mx-auto px-4 lg:px-8">
          <Link 
            href="/open-trip" 
            className="text-white/80 hover:text-white flex items-center gap-2 mb-4 w-fit transition-colors"
          >
            <ArrowLeft size={20} /> {t("back")}
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
             <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {t("badge")}
             </span>
             {trip.category && (
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {trip.category}
                </span>
             )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
            {trip.name}
          </h1>
          <div className="flex items-center gap-4 text-white/90 text-sm md:text-base">
            <span className="flex items-center gap-1"><MapPin size={16}/> {trip.location || "Indonesia"}</span>
            <span className="flex items-center gap-1"><Clock size={16}/> {trip.duration} {tBooking("date") === "Pilih Tanggal" ? "Hari" : "Days"}</span>
            <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400"/> {trip.rating || 5.0}</span>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: DETAILS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Card */}
            <div className={`${cardBgClass} rounded-2xl p-6 md:p-8 shadow-lg border ${borderClass}`}>
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>{t("overview")}</h3>
              <p className={`${textMutedClass} leading-relaxed mb-6`}>
                {/* Menggunakan defaultDescription dari JSON dengan interpolasi nama & lokasi */}
                {t("defaultDescription", { name: trip.name, location: trip.location || "Indonesia" })}
              </p>

              <h4 className={`font-bold mb-3 ${textClass}`}>{t("highlights")}</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                <li className={`flex items-center gap-2 ${textMutedClass}`}><CheckCircle2 size={16} className="text-primary"/> {t("facilities.transport")}</li>
                <li className={`flex items-center gap-2 ${textMutedClass}`}><CheckCircle2 size={16} className="text-primary"/> {t("facilities.ticket")}</li>
                <li className={`flex items-center gap-2 ${textMutedClass}`}><CheckCircle2 size={16} className="text-primary"/> {t("facilities.doc")}</li>
                <li className={`flex items-center gap-2 ${textMutedClass}`}><CheckCircle2 size={16} className="text-primary"/> {t("facilities.guide")}</li>
              </ul>
            </div>

            {/* Meeting Point Info */}
            <div className={`${cardBgClass} rounded-2xl p-6 md:p-8 shadow-lg border ${borderClass}`}>
               <h3 className={`text-xl font-bold mb-4 ${textClass}`}>{t("meetingPointTitle")}</h3>
               <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full text-blue-600 dark:text-blue-300">
                      <MapPin size={24} />
                  </div>
                  <div>
                      <p className={`font-semibold ${textClass}`}>{t("pickupLocation")}</p>
                      <p className={`${textMutedClass} text-sm mt-1`}>
                         {t("pickupDesc")}
                      </p>
                  </div>
               </div>
            </div>

          </div>

          {/* RIGHT: BOOKING CARD (Sticky) */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 ${cardBgClass} rounded-2xl p-6 shadow-xl border ${borderClass}`}>
              <div className="text-center mb-6">
                <p className={`text-sm ${textMutedClass} mb-1`}>{t("startingFrom")}</p>
                <h3 className="text-3xl font-extrabold text-primary">
                  {formatCurrency(trip.starting_from_price || 0)}
                  <span className="text-sm font-normal text-gray-500"> /pax</span>
                </h3>
              </div>

              <div className="space-y-4">
                
                {/* --- STATUS KUOTA (Hijau) --- */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-800">
                        <Users size={18} />
                        <span className="font-semibold text-sm">{t("quota")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-green-100">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-bold text-green-700">{t("available")}</span>
                    </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform transform hover:scale-[1.02]"
                >
                  {t("bookNow")}
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                {t("priceDisclaimer")}
              </p>
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