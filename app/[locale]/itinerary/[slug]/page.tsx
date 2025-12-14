// app/[locale]/itinerary/[slug]/page.tsx

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { 
  Clock, MapPin, CheckCircle2, CalendarDays, Users, 
  Utensils, Camera, ArrowLeft, Compass, Heart, 
  Car, Mountain, Sunset, Info
} from "lucide-react";
import { itinerariesData, ItineraryDay } from "@/data/itineraries";

// ✅ IMPORT KOMPONEN TOMBOL BARU
import CustomizeButton from "./CustomizeButton";

// --- HELPER FUNCTIONS ---

// Mengambil angka durasi dari string (misal: "3 Days" -> "3")
const getDaysFromDuration = (durationStr: string) => {
  const match = durationStr.match(/(\d+)\s*Days?/i);
  return match ? match[1] : "1";
};

// Memilih ikon berdasarkan kata kunci aktivitas
const getActivityIcon = (act: string) => {
  const lower = act.toLowerCase();
  
  if (lower.includes("makan") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("sarapan") || lower.includes("breakfast") || lower.includes("restaurant") || lower.includes("warung")) 
    return <Utensils size={14} />;
  
  if (lower.includes("foto") || lower.includes("photo") || lower.includes("view") || lower.includes("instagram")) 
    return <Camera size={14} />;
  
  if (lower.includes("jeep") || lower.includes("vw") || lower.includes("mobil") || lower.includes("transfer") || lower.includes("antar") || lower.includes("jemput") || lower.includes("pick-up")) 
    return <Car size={14} />;
  
  if (lower.includes("cave") || lower.includes("gua") || lower.includes("mountain") || lower.includes("merapi") || lower.includes("lava") || lower.includes("hill") || lower.includes("bukit")) 
    return <Mountain size={14} />;
  
  if (lower.includes("sunset") || lower.includes("sunrise")) 
    return <Sunset size={14} />;
    
  if (lower.includes("temple") || lower.includes("candi") || lower.includes("palace") || lower.includes("kraton") || lower.includes("museum"))
    return <Compass size={14} />;

  // Default dot
  return <div className="w-3.5 h-3.5 rounded-full bg-gray-400" />;
};

// --- MAIN COMPONENT ---

export default async function ItineraryDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  
  // Load Translations
  const t = await getTranslations("Itinerary");
  const tData = await getTranslations("ItineraryData");

  // Load Data
  const rawData = itinerariesData[slug];

  if (!rawData) {
    notFound();
  }

  // Tentukan konten berdasarkan bahasa (id/en)
  const currentLang = (locale === "id" ? "id" : "en") as keyof typeof rawData.content;
  const content = rawData.content[currentLang];

  // Siapkan parameter untuk link Custom Planner
  const daysValue = getDaysFromDuration(rawData.duration);
  const styleParams = rawData.styles.join(",");
  const personalityParams = rawData.personalities.join(",");

  // ✅ BUAT URL TARGET UNTUK PLANNER
  const plannerUrl = `/planner?dest=Yogyakarta&days=${daysValue}&base=${slug}&style=${styleParams}&personality=${personalityParams}&mode=custom`;

  // ✅ LOGIKA WHATSAPP
  const waNumber = "6282224291148"; 
  const waMessage = currentLang === "id"
    ? `Halo, saya tertarik dengan paket wisata "${content.title}". Bolehkah saya bertanya lebih lanjut?`
    : `Hello, I am interested in the "${content.title}" tour package. Can I get more details?`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* --- HEADER IMAGE SECTION --- */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={rawData.image}
          alt={content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-white/80 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            {t("backHome")}
          </Link>

          <span className="text-white font-bold tracking-wider uppercase mb-3 bg-primary/90 backdrop-blur-md w-fit px-4 py-1.5 rounded-full text-xs shadow-lg">
            Jogja Special Package
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight drop-shadow-md">
            {content.title}
          </h1>

          <p className="text-lg md:text-xl text-white/90 font-serif italic max-w-2xl drop-shadow-sm">
            &quot;{content.tagline}&quot;
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* === LEFT COLUMN: CONTENT === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Overview Box */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-100">
                {/* Duration */}
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-1.5">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      {t("duration")}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{rawData.duration}</p>
                </div>

                {/* Region */}
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-1.5">
                    <MapPin size={16} />
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      {t("region")}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">Yogyakarta</p>
                </div>

                {/* Genre */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 text-purple-600 mb-1.5">
                    <Compass size={16} />
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      {t("genre")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rawData.styles.slice(0, 2).map((s) => (
                      <span key={s} className="text-[10px] md:text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium border border-purple-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vibe */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 text-red-500 mb-1.5">
                    <Heart size={16} />
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      {t("vibe")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rawData.personalities.slice(0, 2).map((p) => (
                      <span key={p} className="text-[10px] md:text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium border border-red-100">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("overview")}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base md:text-lg">
                  {content.description}
                </p>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <span className="w-1 h-6 bg-primary rounded-full block"></span>
                   {t("highlights")}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Timeline */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <CalendarDays size={24} />
                </div>
                {t("schedule")}
              </h3>

              <div className="space-y-8 relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block" />
                {content.timeline.map((day: ItineraryDay) => (
                  <div key={day.day} className="flex flex-col md:flex-row gap-6 relative">
                    <div className="flex-shrink-0 flex flex-row md:flex-col items-center gap-4 md:gap-2">
                       <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30 z-10 relative">
                         {day.day}
                       </div>
                       <span className="md:hidden font-bold text-lg text-gray-900">Day {day.day}</span>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex-grow hover:border-primary/30 transition-colors">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                        {day.title}
                      </h4>
                      <ul className="space-y-4">
                        {day.activities.map((act, i) => (
                          <li key={i} className="flex items-start gap-3 group">
                            <div className="mt-1 p-1.5 bg-gray-100 rounded-full text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {getActivityIcon(act)}
                            </div>
                            <span className="text-gray-600 text-sm md:text-base leading-snug">{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN: STICKY SIDEBAR === */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Pricing & Booking Card */}
              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
                
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-3">
                    {t("pricingPackages") || "PACKAGE RATES"}
                  </p>
                  
                  {/* List Harga */}
                  <div className="bg-gray-50 rounded-xl p-1 border border-gray-200/60">
                    {rawData.priceList && rawData.priceList.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {rawData.priceList.map((tier, index) => (
                          <div key={index} className="flex justify-between items-center p-3 hover:bg-white transition-colors rounded-lg">
                            <div className="flex items-center gap-2.5">
                              <div className="bg-white p-1.5 rounded-md text-gray-400 shadow-sm border border-gray-100">
                                <Users size={14} />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{tier.pax}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-sm font-bold text-primary">
                                {tier.price.replace("IDR", "Rp").split("/")[0]}
                              </span>
                              <span className="text-[10px] text-gray-400 block -mt-0.5">/ person</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4"><h3 className="text-2xl font-bold text-primary">{rawData.price}</h3></div>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Info size={12} />
                    Includes tax & service charge
                  </p>
                </div>

                {/* ✅ TOMBOL CUSTOMIZE (YANG SUDAH DIPERBARUI) */}
                <CustomizeButton 
                   url={plannerUrl}
                   btnText={t("customizeBtn")}
                   loginText={currentLang === "id" ? "Login untuk Kustomisasi" : "Login to Customize"}
                   description={t("customizeDesc")}
                />

                {/* Includes Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h5 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider">
                    {t("includes")}
                  </h5>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5 text-sm text-gray-600"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0" /><span>{tData("facilities.transport")}</span></li>
                    <li className="flex items-center gap-2.5 text-sm text-gray-600"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0" /><span>{tData("facilities.hotel")}</span></li>
                    <li className="flex items-center gap-2.5 text-sm text-gray-600"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0" /><span>{tData("facilities.driver")}</span></li>
                    <li className="flex items-center gap-2.5 text-sm text-gray-600"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0" /><span>{tData("facilities.tickets")}</span></li>
                  </ul>
                </div>
              </div>

              {/* ✅ HELP BOX (LINK WA DIPERTAHANKAN) */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 flex gap-4 items-start border border-blue-100">
                <div className="p-2.5 bg-white rounded-full text-blue-600 shadow-sm shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-blue-900 text-sm mb-1">
                    {t("needHelp")}
                  </h5>
                  <p className="text-xs text-blue-700/80 leading-relaxed mb-2">
                    {t("chatExpert")}
                  </p>
                  
                  {/* Link WA */}
                  <a 
                    href={waLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                  >
                    Chat via WhatsApp →
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}