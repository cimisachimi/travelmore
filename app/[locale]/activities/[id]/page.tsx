"use client";

import React, { useState, useEffect } from "react";
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

// Import Modal
import ActivityBookingModal from "./ActivityBookingModal";

// Icons
import { 
  Check,       
  X as XMark, 
  MapPin, 
  Clock, 
  Tag, 
  Users,       
  CalendarCheck, 
  ChevronLeft, 
  Camera, 
  Info,
  ShieldCheck,
  CheckCircle2, // ✅ Added missing import
  LucideIcon   
} from "lucide-react";

// --- Interfaces ---
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
}

export interface Addon {
  name: string;
  price: number;
}

export interface ActivityPriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

export interface Activity {
  id: number;
  name: string;
  duration: string | null;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number;
  addons?: Addon[];
  images_url: { id: number; url: string; type: string }[]; 
  thumbnail_url: string | null;
  status: string;
  
  itinerary?: { day: number; title: string; description: string }[];
  cost?: { included: string[]; excluded: string[] };
  faqs?: { question: string; answer: string }[];
  tripInfo?: { label: string; value: string; icon: string }[];
  mapUrl?: string;
  price_tiers?: ActivityPriceTier[]; 
}

export type TFunction = (key: string, values?: Record<string, string | number | Date>) => string;

// --- Components ---

const MobileImageSlider: React.FC<{ images: string[]; title: string }> = ({ images, title }) => (
  <Swiper
    modules={[Navigation, Pagination]}
    spaceBetween={0}
    slidesPerView={1}
    navigation
    pagination={{ clickable: true }}
    className="h-[400px] w-full"
  >
    {images.map((src, index) => (
      <SwiperSlide key={index}>
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={`${title} - image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* ✅ Fixed: Updated to canonical class */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:hidden" />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
);

const SectionTitle = ({ children, icon: Icon, theme }: { children: React.ReactNode; icon?: LucideIcon; theme: string }) => (
  <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${theme === "regular" ? "text-gray-900" : "text-white"}`}>
    {Icon && <Icon className="w-6 h-6 text-blue-600" />}
    {children}
  </h3>
);

// --- Main Page ---
export default function ActivityDetailPage() {
  const { theme } = useTheme();
  const t = useTranslations("packages"); 
  const tAct = useTranslations("activities"); 
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;

  // State
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/activities/${id}`);
        setActivity(response.data as Activity);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        setError(tAct("status.fetchError"));
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id, tAct]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !activity) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Activity not found"}</div>;

  // Data Extraction
  const images = activity.images_url?.map(img => img.url) || [];
  const title = activity.name;
  
  // Fallbacks
  const itineraryData = activity.itinerary || [];
  const costData = activity.cost || { included: [], excluded: [] };
  const faqsData = activity.faqs || [];
  const tripInfo = activity.tripInfo || [];
  const mapUrl = activity.mapUrl || "";

  // Price Logic
  const priceTiers = activity.price_tiers || [{ min_pax: 1, max_pax: 0, price: activity.price }];
  const startingPrice = priceTiers.length > 0 ? Math.min(...priceTiers.map(t => t.price)) : activity.price;
  const hasMultipleTiers = priceTiers.length > 1;

  const tabs = ["Overview", "Itinerary", "Pricing", "Cost", "FAQs", "Map"];

  // Styling
  const isDark = theme === "exclusive";
  const mainBg = isDark ? "bg-black" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  const formatPrice = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const formatPaxRange = (min: number, max: number): string => {
    if (min === max) return `${min} pax`;
    if (!max || max === 0) return `${min}+ pax`;
    return `${min}–${max} pax`;
  };

  return (
    <div className={`min-h-screen ${mainBg} transition-colors duration-300`}>
      
      {/* --- Header / Gallery Section --- */}
      <div className="relative">
        <div className="md:hidden">
          <MobileImageSlider images={images} title={title} />
          <div className="absolute top-4 left-4 z-10">
            <Link href="/activities" className="bg-white/90 p-2 rounded-full text-black shadow-lg backdrop-blur-sm">
              <ChevronLeft size={24} />
            </Link>
          </div>
        </div>

        {/* Desktop Gallery */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] max-w-7xl mx-auto pt-8 px-8">
           <div className="col-span-2 row-span-2 relative rounded-l-2xl overflow-hidden group">
             {images[0] && <Image src={images[0]} alt="Main" fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />}
             <div className="absolute top-4 left-4">
                <Link href="/activities" className="bg-white/90 py-2 px-4 rounded-full text-black font-semibold text-sm shadow-lg backdrop-blur-sm hover:bg-white transition flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
                </Link>
             </div>
           </div>
           <div className="col-span-1 row-span-1 relative overflow-hidden group">
             {images[1] && <Image src={images[1]} alt="Gallery 1" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
           </div>
           <div className="col-span-1 row-span-1 relative rounded-tr-2xl overflow-hidden group">
             {images[2] && <Image src={images[2]} alt="Gallery 2" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
           </div>
           <div className="col-span-1 row-span-1 relative overflow-hidden group">
             {images[3] && <Image src={images[3]} alt="Gallery 3" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />}
           </div>
           <div className="col-span-1 row-span-1 relative rounded-br-2xl overflow-hidden group bg-gray-800 flex items-center justify-center">
             {images[4] ? (
               <Image src={images[4]} alt="Gallery 4" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
             ) : (
               <div className="text-white/70 font-medium flex flex-col items-center">
                 <Camera size={24} className="mb-2" />
                 <span>View Gallery</span>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* --- Title & Meta --- */}
        <div className="mb-8">
           <div className="flex flex-wrap gap-3 mb-4">
              {activity.category && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                  <Tag size={12} /> {activity.category}
                </span>
              )}
              {activity.duration && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                  <Clock size={12} /> {activity.duration}
                </span>
              )}
              {activity.location && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                  <MapPin size={12} /> {activity.location}
                </span>
              )}
           </div>
           <h1 className={`text-3xl md:text-5xl font-black leading-tight ${textColor}`}>{title}</h1>
           {activity.location && <p className={`mt-2 flex items-center gap-2 ${textMuted}`}><MapPin size={16} /> {activity.location}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* --- LEFT COLUMN: CONTENT --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tabs */}
            <div className={`sticky top-0 z-30 pt-4 pb-2 -mt-4 ${mainBg}`}>
              <div className={`flex overflow-x-auto gap-2 pb-2 hide-scrollbar border-b ${borderColor}`}>
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                      ${activeTab === tab 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                        : `${isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white" : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"} border ${borderColor}`
                      }
                    `}
                  >
                    {t(`tabs.${tab.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Card */}
            <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
              
              {activeTab === "Overview" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <SectionTitle icon={Info} theme={theme}>About this activity</SectionTitle>
                  <div className={`prose ${isDark ? "prose-invert" : ""} max-w-none`}>
                    <p className={`whitespace-pre-wrap leading-relaxed ${textMuted}`}>
                      {activity.description || "No description provided."}
                    </p>
                  </div>

                  {tripInfo.length > 0 && (
                    <div className={`mt-8 pt-8 border-t ${borderColor}`}>
                      <h4 className={`text-lg font-bold mb-4 ${textColor}`}>Highlights</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tripInfo.map((info, idx) => (
                          <div key={idx} className={`p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                            <div className="text-2xl mb-2">{info.icon}</div>
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textMuted}`}>{info.label}</p>
                            <p className={`font-bold ${textColor}`}>{info.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Itinerary" && (
                <div className="space-y-6">
                  <SectionTitle icon={CalendarCheck} theme={theme}>Itinerary</SectionTitle>
                  {itineraryData.length > 0 ? (
                    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900">
                      {itineraryData.map((item, index) => (
                        <div key={index} className="relative">
                           <div className="absolute -left-[35px] w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white dark:ring-gray-900">
                             {item.day}
                           </div>
                           <h4 className={`text-lg font-bold ${textColor}`}>{item.title}</h4>
                           <p className={`mt-2 ${textMuted}`}>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={textMuted}>Detailed itinerary is not available for this activity.</p>
                  )}
                </div>
              )}

              {activeTab === "Pricing" && (
                <div className="space-y-8">
                  <SectionTitle icon={Tag} theme={theme}>Pricing Packages</SectionTitle>
                  
                  {/* Price Tiers */}
                  <div className={`overflow-hidden rounded-xl border ${borderColor}`}>
                    <table className="w-full text-left">
                      <thead className={isDark ? "bg-gray-800" : "bg-gray-50"}>
                        <tr>
                          <th className={`px-6 py-4 text-sm font-bold uppercase ${textMuted}`}>Pax</th>
                          <th className={`px-6 py-4 text-sm font-bold uppercase ${textMuted}`}>Price / Person</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${borderColor}`}>
                        {priceTiers.map((tier) => (
                          <tr key={tier.min_pax}>
                            <td className={`px-6 py-4 ${textColor}`}>{formatPaxRange(tier.min_pax, tier.max_pax)}</td>
                            <td className="px-6 py-4 font-bold text-blue-600">{formatPrice(tier.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add-ons Display */}
                  {activity.addons && activity.addons.length > 0 && (
                    <div className="pt-4">
                      <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textColor}`}>
                        <Camera className="w-5 h-5 text-purple-500" /> 
                        Optional Add-ons
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activity.addons.map((addon, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border flex justify-between items-center ${cardBg}`}>
                            <span className={`font-medium ${textColor}`}>{addon.name}</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"}`}>
                              +{formatPrice(addon.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Cost" && (
                <div className="grid md:grid-cols-2 gap-8">
                   <div>
                     <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-600"><Check className="w-5 h-5" /> Included</h4>
                     <ul className="space-y-3">
                       {costData.included?.length ? costData.included.map((item, i) => (
                         <li key={i} className={`flex items-start gap-3 text-sm ${textMuted}`}>
                           <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {item}
                         </li>
                       )) : <li className={textMuted}>-</li>}
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500"><XMark className="w-5 h-5" /> Excluded</h4>
                     <ul className="space-y-3">
                       {costData.excluded?.length ? costData.excluded.map((item, i) => (
                         <li key={i} className={`flex items-start gap-3 text-sm ${textMuted}`}>
                           <XMark className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> {item}
                         </li>
                       )) : <li className={textMuted}>-</li>}
                     </ul>
                   </div>
                </div>
              )}

              {activeTab === "FAQs" && (
                <div className="space-y-6">
                  <SectionTitle theme={theme}>Frequently Asked Questions</SectionTitle>
                  {faqsData.length ? faqsData.map((faq, i) => (
                    <div key={i} className={`p-5 rounded-xl border ${borderColor} ${isDark ? "bg-gray-800/30" : "bg-gray-50/50"}`}>
                      <h4 className={`font-bold flex gap-3 ${textColor}`}>
                        <Users className="w-5 h-5 text-blue-500 shrink-0" />
                        {faq.question}
                      </h4>
                      <p className={`mt-3 pl-8 text-sm leading-relaxed ${textMuted}`}>{faq.answer}</p>
                    </div>
                  )) : <p className={textMuted}>No FAQs available.</p>}
                </div>
              )}

              {activeTab === "Map" && (
                <div className="h-[400px] rounded-xl overflow-hidden bg-gray-200 relative">
                  {mapUrl ? (
                    <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy"></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">Map unavailable</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Booking Card */}
            <div className={`p-6 rounded-3xl border shadow-xl sticky top-8 ${cardBg}`}>
              <div className="mb-6">
                <p className={`text-sm font-medium mb-1 ${textMuted}`}>Starting from</p>
                <div className="flex items-baseline gap-2">
                   <span className={`text-4xl font-black ${isDark ? "text-white" : "text-blue-600"}`}>
                     {formatPrice(startingPrice)}
                   </span>
                   <span className={textMuted}>/ pax</span>
                </div>
                {hasMultipleTiers && (
                  <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"}`}>
                     <Users size={14} /> Group discounts available
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transform transition-all hover:-translate-y-1
                    /* ✅ Fixed: Updated to canonical class */
                    bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white
                  `}
                >
                  {user ? "Book Now" : "Login to Book"}
                </button>

                <div className={`flex flex-col gap-3 p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <div>
                      <p className={`text-sm font-bold ${textColor}`}>Secure Booking</p>
                      <p className={`text-xs ${textMuted}`}>Your data is protected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className={`text-sm font-bold ${textColor}`}>Instant Confirmation</p>
                      <p className={`text-xs ${textMuted}`}>Receive ticket via email</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className={`p-6 rounded-3xl border ${cardBg}`}>
               <h4 className={`font-bold mb-2 ${textColor}`}>Need Help?</h4>
               <p className={`text-sm mb-4 ${textMuted}`}>Contact our support team for custom arrangements.</p>
               <a href="#" className={`block w-full py-3 rounded-xl border font-bold text-center transition ${isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"}`}>
                 Contact Support
               </a>
            </div>

          </div>
        </div>
      </div>

      {/* --- Modal --- */}
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