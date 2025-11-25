// app/[locale]/activities/[id]/page.tsx

"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import Modal Booking Activity
import ActivityBookingModal from "./ActivityBookingModal";
// Import Icons yang sama dengan Packages
import { CheckIcon, UsersIcon, TagIcon, CalendarIcon, X as XIcon } from "lucide-react";

// --- Interfaces (Disamakan dengan struktur Packages agar fitur bisa jalan) ---
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

// Tambahkan PriceTier untuk Activities
export interface ActivityPriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

// Update Interface Activity agar mendukung fitur lengkap
export interface Activity {
  id: number;
  name: string;
  duration: string | null;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number; // Harga single (fallback)
  images_url: { id: number; url: string; type: string }[];
  thumbnail_url: string | null;
  
  // Field tambahan untuk fitur "Packages style" (Optional jika backend belum siap)
  itinerary?: { day: number; title: string; description: string }[];
  cost?: { included: string[]; excluded: string[] };
  faqs?: { question: string; answer: string }[];
  tripInfo?: { label: string; value: string; icon: string }[];
  mapUrl?: string;
  price_tiers?: ActivityPriceTier[]; 
}

export type TFunction = (key: string, defaultMessage?: string) => string;

// --- MobileImageSlider Component ---
interface MobileImageSliderProps {
  images: string[];
  title: string;
}
const MobileImageSlider: React.FC<MobileImageSliderProps> = ({ images, title }) => (
  <Swiper
    modules={[Navigation, Pagination]}
    spaceBetween={0}
    slidesPerView={1}
    navigation
    pagination={{ clickable: true }}
    className="h-72 w-full"
  >
    {images.map((src, index) => (
      <SwiperSlide key={index}>
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={`${title} - image ${index + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
);

// --- Komponen Utama ---
export default function ActivityDetailPage() {
  const { theme } = useTheme();
  const t = useTranslations("packages"); // Gunakan translasi packages agar labelnya sama
  const tAct = useTranslations("activities"); // Fallback untuk spesifik activity
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;

  // State
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview"); // State Tab
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const errorNotFound = tAct("status.notFound");

  useEffect(() => {
    if (!id) return;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/activities/${id}`);
        setActivity(response.data as Activity);
      } catch (err: unknown) {
        console.error("Failed to fetch activity:", err);
        // Error handling logic...
        setError(tAct("status.fetchError", { defaultMessage: "Failed to load activity data." }));
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id, errorNotFound, tAct]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {tAct("status.loading")}
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 p-4 text-center">
        {error || tAct("status.notFound")}
      </div>
    );
  }

  // --- Data Processing (Logika menyamakan format data) ---
  const images = activity.images_url ? activity.images_url.map(img => img.url) : [];
  const title = activity.name; // Nama activity biasanya tidak pakai prefix "Package:" jadi langsung saja

  // Siapkan data untuk Tabs (Gunakan fallback array kosong jika data backend belum ada)
  const itineraryData = activity.itinerary || [];
  const costData = activity.cost || { included: [], excluded: [] };
  const faqsData = activity.faqs || [];
  const tripInfo = activity.tripInfo || [];
  const mapUrl = activity.mapUrl || "";

  // Logika Harga Bertingkat (Price Tiers)
  // Jika backend activity belum kirim price_tiers, kita buat dummy tier dari single price
  const priceTiers = activity.price_tiers && activity.price_tiers.length > 0 
    ? activity.price_tiers 
    : [
        { min_pax: 1, max_pax: 0, price: activity.price } // Default tier
      ];

  // Hitung harga "Starting From"
  const startingPrice = priceTiers.length > 0 
    ? Math.min(...priceTiers.map(t => t.price)) 
    : activity.price;

  const hasMultipleTiers = priceTiers.length > 1;

  // Cari tier terbaik (harga terendah)
  const bestPriceTier = priceTiers.reduce((prev, curr) => prev.price < curr.price ? prev : curr);

  // List Tab yang akan ditampilkan
  const tabs = ["Overview", "Itinerary", "Pricing", "Cost", "FAQs", "Map"];

  // Styling Classes
  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPaxRange = (min: number, max: number): string => {
    if (min === max) return `${min} pax`;
    if (!max || max === 0) return `${min}+ pax`;
    return `${min}–${max} pax`;
  };

  // Render Gallery (Sama seperti sebelumnya)
  const renderGallery = (): ReactNode => {
    const count = images.length;
    if (count === 0) return <div className={`w-full h-72 md:h-[400px] ${theme === "regular" ? "bg-gray-200" : "bg-gray-900"} rounded-lg flex items-center justify-center text-gray-500`}>{tAct("gallery.noImage")}</div>;

    return (
      <>
        <div className="md:hidden"><MobileImageSlider images={images} title={title} /></div>
        <div className="hidden md:block">
          {count === 1 && <div className="relative h-96 md:h-[600px]"><Image src={images[0]} alt={title} fill className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" priority sizes="(max-width: 767px) 100vw, 50vw" /></div>}
          {count >= 2 && (
             <div className={`grid ${count > 2 ? "grid-cols-4 grid-rows-2" : "grid-cols-2"} gap-2 h-96 md:h-[600px]`}>
               {/* Logic grid gambar disederhanakan untuk brevity */}
               <div className={`relative ${count > 2 ? "col-span-2 row-span-2 rounded-tl-2xl" : "w-full h-full rounded-l-2xl"} overflow-hidden`}>
                 <Image src={images[0]} alt={title} fill className="object-cover" priority />
               </div>
               {images.slice(1, count > 2 ? 4 : 2).map((src, i) => (
                 <div key={i} className="relative w-full h-full overflow-hidden">
                   <Image src={src} alt={`${title}-${i}`} fill className="object-cover" />
                 </div>
               ))}
             </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={mainBgClass}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}>
          {renderGallery()}

          <div className={`p-6 md:p-10 border-b ${borderClass}`}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {activity.duration && (
                <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular" ? "bg-blue-100 text-blue-800" : "bg-blue-900 text-blue-200"}`}>
                  {activity.duration}
                </div>
              )}
              {activity.category && (
                <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular" ? "bg-gray-100 text-gray-800" : "bg-gray-700 text-gray-200"}`}>
                  {activity.category}
                </div>
              )}
              {activity.location && (
                <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular" ? "bg-emerald-100 text-emerald-800" : "bg-emerald-900 text-emerald-200"}`}>
                  {activity.location}
                </div>
              )}
            </div>
            <h1 className={`text-3xl md:text-5xl font-extrabold ${textClass}`}>{title}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
            
            {/* --- KONTEN KIRI: TABS & INFO --- */}
            <div className="lg:col-span-2">
              <div className="w-full">
                {/* Tab Navigation */}
                <div className={`w-full border-b ${borderClass} overflow-x-auto [&::-webkit-scrollbar]:hidden`}>
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                          activeTab === tab
                            ? "border-blue-500 text-blue-600"
                            : `border-transparent ${textMutedClass} hover:border-gray-300 hover:text-gray-700`
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        {/* Gunakan translasi packages agar konsisten */}
                        {t(`tabs.${tab.toLowerCase()}`)}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="py-8 min-h-[300px]">
                  {/* CONTENT: OVERVIEW */}
                  {activeTab === "Overview" && (
                    <div>
                      <h3 className={`text-2xl font-bold mb-4 ${textClass}`}>{t("trip.about")}</h3>
                      <p className={`text-lg leading-relaxed ${textMutedClass} whitespace-pre-wrap`}>
                        {activity.description || "No description available."}
                      </p>
                    </div>
                  )}

                  {/* CONTENT: ITINERARY */}
                  {activeTab === "Itinerary" && (
                    <div className="space-y-8">
                      {itineraryData.length > 0 ? (
                        itineraryData.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold">
                                {item.day}
                              </div>
                              {index < itineraryData.length - 1 && <div className={`w-px grow ${borderClass} mt-2`}></div>}
                            </div>
                            <div className="pt-1">
                              <h4 className={`text-lg font-bold ${textClass}`}>{item.title}</h4>
                              <p className={`${textMutedClass}`}>{item.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={textMutedClass}>{t("status.noItinerary", { defaultMessage: "No itinerary details available." })}</p>
                      )}
                    </div>
                  )}

                  {/* CONTENT: PRICING */}
                  {activeTab === "Pricing" && (
                    <div className="space-y-6">
                      <h3 className={`text-2xl font-bold mb-4 ${textClass}`}>{t("tabs.pricing")}</h3>
                      
                      {/* Pricing Table */}
                      <div className={`border ${borderClass} rounded-lg overflow-hidden`}>
                        <table className="w-full">
                          <thead className={theme === "regular" ? "bg-gray-50" : "bg-gray-700"}>
                            <tr>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${textClass} uppercase`}>Group Size</th>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${textClass} uppercase`}>Price per Person</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${borderClass} ${cardBgClass}`}>
                            {priceTiers.map((tier) => (
                              <tr key={tier.min_pax}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                                  {formatPaxRange(tier.min_pax, tier.max_pax)}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${textClass}`}>
                                  {formatPrice(tier.price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CONTENT: COST (Included/Excluded) */}
                  {activeTab === "Cost" && (
                    <div>
                      <h3 className={`text-2xl font-bold mb-6 ${textClass}`}>{t("cost.facilitiesIncluded")}</h3>
                      {costData.included && costData.included.length > 0 ? (
                        <ul className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-10">
                          {costData.included.map((item, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <CheckIcon className="w-5 h-5 text-green-500 shrink-0" />
                              <span className={textMutedClass}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className={`mb-10 ${textMutedClass}`}>No data available.</p>}

                      <h3 className={`text-2xl font-bold mb-6 ${textClass}`}>{t("cost.facilitiesExcluded")}</h3>
                      {costData.excluded && costData.excluded.length > 0 ? (
                        <ul className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          {costData.excluded.map((item, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <XIcon className="w-5 h-5 text-red-500 shrink-0" />
                              <span className={textMutedClass}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className={textMutedClass}>No data available.</p>}
                    </div>
                  )}

                  {/* CONTENT: FAQs */}
                  {activeTab === "FAQs" && (
                    <div className="space-y-6">
                      {faqsData.length > 0 ? (
                        faqsData.map((faq, index) => (
                          <div key={index} className={`p-4 rounded-lg ${borderClass} border`}>
                            <h4 className={`font-bold text-lg ${textClass} mb-2`}>{faq.question}</h4>
                            <p className={textMutedClass}>{faq.answer}</p>
                          </div>
                        ))
                      ) : (
                        <p className={textMutedClass}>No FAQs available.</p>
                      )}
                    </div>
                  )}

                  {/* CONTENT: MAP */}
                  {activeTab === "Map" && (
                    mapUrl ? (
                      <iframe src={mapUrl} width="100%" height="450" style={{ border: 0 }} loading="lazy" className="rounded-lg"></iframe>
                    ) : <p className={textMutedClass}>{t("status.noMap", { defaultMessage: "Map not available." })}</p>
                  )}
                </div>
              </div>
              
              {/* Trip Info Footer */}
              {tripInfo.length > 0 && (
                <div className={`mt-10 pt-10 border-t ${borderClass}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>{t("trip.info")}</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                    {tripInfo.map((item) => (
                      <div key={item.label} className="flex items-start space-x-4">
                        <div className="text-2xl mt-1 shrink-0 w-6 text-center">{item.icon}</div>
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

            {/* --- KONTEN KANAN: SIDEBAR BOOKING (Packages Style) --- */}
            <div className="lg:col-span-1">
              <div className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-8`}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="w-5 h-5 text-blue-500" />
                    <p className={`text-sm font-semibold ${textMutedClass}`}>
                      {tAct("activityDetail.startingFrom")}
                    </p>
                  </div>
                  <p className={`text-3xl font-bold ${textClass} mb-1`}>
                    {formatPrice(startingPrice)}
                  </p>
                  <p className={`text-sm ${textMutedClass}`}>
                    per person
                  </p>
                  {hasMultipleTiers && (
                    <div className={`mt-3 p-3 rounded-lg ${theme === "regular" ? "bg-green-50" : "bg-green-900/20"} mb-4`}>
                      <div className="flex items-start gap-2">
                        <UsersIcon className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className={`text-xs font-semibold ${theme === "regular" ? "text-green-800" : "text-green-300"}`}>
                            Group Discounts Available
                          </p>
                          <p className={`text-xs ${theme === "regular" ? "text-green-700" : "text-green-400"}`}>
                            Save more when you book for more people!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Pricing Preview di Sidebar */}
                  {priceTiers.length > 0 && (
                    <div className={`border-t ${borderClass} pt-4 mt-4`}>
                      <p className={`text-sm font-semibold ${textClass} mb-2`}>
                        Quick Price Guide:
                      </p>
                      <div className="space-y-2">
                        {priceTiers.slice(0, 3).map((tier) => (
                          <div key={tier.min_pax} className="flex justify-between items-center text-sm">
                            <span className={textMutedClass}>
                              {formatPaxRange(tier.min_pax, tier.max_pax)}
                            </span>
                            <span className={`font-semibold ${textClass}`}>
                              {formatPrice(tier.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  disabled={!user}
                >
                  {user ? (
                    <div className="flex items-center justify-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      {tAct("booking.checkAvailability")}
                    </div>
                  ) : (
                    tAct("booking.loginToBook", { defaultMessage: "Login to Book" })
                  )}
                </button>

                <div className={`mt-4 p-3 rounded-lg ${theme === "regular" ? "bg-gray-50" : "bg-gray-700/50"}`}>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className={textMutedClass}>Best price guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className={textMutedClass}>Free cancellation</span>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  {tAct("booking.needHelp")}{" "}
                  <a href="#" className="text-cyan-600 font-semibold hover:underline">
                    {tAct("booking.sendMessage")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            href="/activities"
            className={`inline-block py-3 px-8 rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 ${theme === "regular" ? "bg-white text-blue-600 hover:bg-gray-50" : "bg-gray-800 text-white hover:bg-gray-700"}`}
          >
            {tAct("buttons.back")}
          </Link>
        </div>
      </div>

      {/* Modal Booking (Tetap pakai ActivityBookingModal) */}
      {activity && (
        <ActivityBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activity={activity}
          user={user as AuthUser | null}
          t={tAct as TFunction}
        />
      )}
    </div>
  );
}