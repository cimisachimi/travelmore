// components/views/PackageDetailView.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { HolidayPackage, TFunction, AuthUser } from "@/types/package";
import PackageBookingModal from "@/app/[locale]/packages/[slug]/PackageBookingModal";
import { 
  Check, X as XMark, MapPin, Clock, Tag, Users, 
  CalendarCheck, ChevronLeft, Camera, Info, 
  ShieldCheck, CheckCircle2, LucideIcon, MessageCircle 
} from "lucide-react";

// --- Helper Components ---

// ✅ UPDATE 1: Mobile Slider Image dengan 'sizes' & 'priority'
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
            alt={`${title} - view ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0} // Gambar pertama dimuat prioritas (LCP)
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimasi ukuran
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:hidden" />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
);

const SectionTitle = ({ children, icon: Icon, theme }: { children: React.ReactNode; icon?: LucideIcon; theme: string }) => (
  <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${theme === "regular" ? "text-gray-900" : "text-white"}`}>
    {Icon && <Icon className="w-6 h-6 text-primary" />}
    {children}
  </h2>
);

interface PackageDetailViewProps {
  initialData: HolidayPackage;
}

export default function PackageDetailView({ initialData }: PackageDetailViewProps) {
  const { theme } = useTheme();
  const t = useTranslations("packages");
  const { user } = useAuth();

  const [pkg] = useState<HolidayPackage>(initialData);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // WhatsApp Configuration for Sidebar Help Card
  const whatsappNumber = "6282224291148";
  const whatsappMsg = encodeURIComponent(`Hi TravelMore! I'm interested in the "${pkg.name}" package. Can you provide more details?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  // Data Processing
  const costData = (typeof pkg.cost === 'object' && pkg.cost !== null)
    ? { included: Array.isArray(pkg.cost.included) ? pkg.cost.included : [], excluded: Array.isArray(pkg.cost.excluded) ? pkg.cost.excluded : [] }
    : { included: [], excluded: [] };

  const priceTiers = Array.isArray(pkg.price_tiers) ? pkg.price_tiers : [];

  let startingPrice = 0;
  if (pkg.starting_from_price && pkg.starting_from_price > 0) {
    startingPrice = pkg.starting_from_price;
  } else if (priceTiers.length > 0) {
    const sortedTiers = [...priceTiers].sort((a, b) => a.min_pax - b.min_pax);
    startingPrice = sortedTiers[0].price;
  }

  const hasMultipleTiers = priceTiers.length > 1;
  const bestPriceTier = priceTiers.reduce((lowest, current) => {
    return current.price < lowest.price ? current : lowest;
  }, priceTiers[0] || { price: startingPrice, min_pax: 1, max_pax: 0 });

  const mapUrl = pkg.mapUrl ?? '';
  const images = pkg.images_url || [];
  const itineraryData = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const tripInfo = Array.isArray(pkg.tripInfo) ? pkg.tripInfo : [];
  const faqsData = Array.isArray(pkg.faqs) ? pkg.faqs : [];
  const title = pkg.name.split(": ")[1] || pkg.name; 

  const tabs = ["Overview", "Itinerary", "Pricing", "Cost", "FAQs", "Map"];

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

  const getTabVisibility = (tabName: string) => {
      return activeTab === tabName ? "block animate-in fade-in slide-in-from-bottom-2 duration-300" : "hidden";
  };

  return (
    <div className={`min-h-screen ${mainBg} transition-colors duration-300`}>
      
      {/* Header / Gallery Section */}
      <div className="relative">
        <div className="md:hidden">
          <MobileImageSlider images={images} title={title} />
          <div className="absolute top-4 left-4 z-10">
            <Link href="/packages" className="bg-white/90 p-2 rounded-full text-black shadow-lg backdrop-blur-sm">
              <ChevronLeft size={24} />
            </Link>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] max-w-7xl mx-auto pt-8 px-8">
           {/* ✅ UPDATE 2: Desktop Main Image (Index 0) - Priority & Sizes */}
           <div className="col-span-2 row-span-2 relative rounded-l-2xl overflow-hidden group">
             {images[0] ? (
                <Image 
                  src={images[0]} 
                  alt={pkg.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  priority={true} // Wajib true untuk LCP
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
             ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center"><Camera /></div>
             )}
             <div className="absolute top-4 left-4">
               <Link href="/packages" className="bg-white/90 py-2 px-4 rounded-full text-black font-semibold text-sm shadow-lg backdrop-blur-sm flex items-center gap-2">
                 <ChevronLeft size={16} /> Back
               </Link>
             </div>
           </div>

           {/* ✅ UPDATE 3: Desktop Secondary Images - Sizes Only (No Priority) */}
           {images.slice(1, 5).map((src, i) => (
             <div key={i} className={`col-span-1 row-span-1 relative overflow-hidden group ${i === 1 ? 'rounded-tr-2xl' : ''} ${i === 3 ? 'rounded-br-2xl' : ''}`}>
               <Image 
                 src={src} 
                 alt={pkg.name} 
                 fill 
                 className="object-cover transition-transform duration-700 group-hover:scale-105" 
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
             </div>
           ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Title & Meta */}
        <div className="mb-8">
           <div className="flex flex-wrap gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                <Clock size={12} /> {pkg.duration} {t("trip.days")}
              </span>
              {pkg.category && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? "bg-blue-900/30 text-primary" : "bg-blue-100 text-primary"}`}>
                  <Tag size={12} /> {pkg.category}
                </span>
              )}
              {pkg.location && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                  <MapPin size={12} /> {pkg.location}
                </span>
              )}
           </div>
           <h1 className={`text-3xl md:text-5xl font-black leading-tight ${textColor}`}>{title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tabs Header */}
            <div className={`sticky top-0 z-30 pt-4 pb-2 -mt-4 ${mainBg}`}>
              <div className={`flex overflow-x-auto gap-2 pb-2 hide-scrollbar border-b ${borderColor}`}>
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                      ${activeTab === tab 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : `${isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white" : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"} border ${borderColor}`
                      }
                    `}
                  >
                    {t(`tabs.${tab.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
              
              {/* Overview */}
              <div className={getTabVisibility("Overview")}>
                  <SectionTitle icon={Info} theme={theme}>{t("trip.about")}</SectionTitle>
                  <p className={`whitespace-pre-wrap leading-relaxed ${textMuted}`}>{pkg.description}</p>
                  {tripInfo.length > 0 && (
                    <div className={`mt-8 pt-8 border-t ${borderColor}`}>
                      <h4 className={`text-lg font-bold mb-4 ${textColor}`}>{t("trip.info")}</h4>
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

              {/* Itinerary */}
              <div className={getTabVisibility("Itinerary")}>
                  <SectionTitle icon={CalendarCheck} theme={theme}>Itinerary</SectionTitle>
                  <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200 dark:before:bg-blue-900">
                    {itineraryData.map((item, index) => (
                      <div key={index} className="relative">
                          <div className="absolute -left-[35px] w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-white dark:ring-gray-900">{item.day}</div>
                          <h3 className={`text-lg font-bold ${textColor}`}>{item.title}</h3>
                          <p className={`mt-2 ${textMuted}`}>{item.description}</p>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Pricing */}
              <div className={getTabVisibility("Pricing")}>
                  <SectionTitle icon={Tag} theme={theme}>{t("tabs.pricing")}</SectionTitle>
                  <div className={`overflow-hidden rounded-xl border ${borderColor}`}>
                    <table className="w-full text-left">
                      <thead className={isDark ? "bg-gray-800" : "bg-gray-50"}>
                        <tr>
                          <th className="px-6 py-4 text-sm font-bold uppercase">Group Size</th>
                          <th className="px-6 py-4 text-sm font-bold uppercase">Price / Person</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${borderColor}`}>
                        {priceTiers.map((tier) => (
                          <tr key={tier.min_pax}>
                            <td className={`px-6 py-4 ${textColor}`}>{formatPaxRange(tier.min_pax, tier.max_pax)}</td>
                            <td className="px-6 py-4 font-bold text-primary">{formatPrice(tier.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              </div>

              {/* Cost */}
              <div className={getTabVisibility("Cost")}>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-600"><Check className="w-5 h-5" /> {t("cost.facilitiesIncluded")}</h4>
                      <ul className="space-y-3">
                        {costData.included?.map((item, i) => <li key={i} className={`flex items-start gap-3 text-sm ${textMuted}`}><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500"><XMark className="w-5 h-5" /> {t("cost.facilitiesExcluded")}</h4>
                      <ul className="space-y-3">
                        {costData.excluded?.map((item, i) => <li key={i} className={`flex items-start gap-3 text-sm ${textMuted}`}><XMark className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> {item}</li>)}
                      </ul>
                    </div>
                </div>
              </div>

              {/* FAQs */}
              <div className={getTabVisibility("FAQs")}>
                  <SectionTitle theme={theme}>Frequently Asked Questions</SectionTitle>
                  {faqsData.map((faq, i) => (
                    <div key={i} className={`p-5 rounded-xl border ${borderColor} ${isDark ? "bg-gray-800/30" : "bg-gray-50/50"} mb-4`}>
                      <h3 className={`font-bold flex gap-3 ${textColor}`}><Users className="w-5 h-5 text-primary shrink-0" />{faq.question}</h3>
                      <p className={`mt-3 pl-8 text-sm leading-relaxed ${textMuted}`}>{faq.answer}</p>
                    </div>
                  ))}
              </div>

              {activeTab === "Map" && (
                <div className="h-[400px] rounded-xl overflow-hidden bg-gray-200 relative animate-in fade-in">
                  {mapUrl ? (
                    <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy"></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">{t("status.noMap")}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-3xl border shadow-xl sticky top-8 ${cardBg}`}>
              <div className="mb-6">
                <p className={`text-sm font-medium mb-1 ${textMuted}`}>Starting from</p>
                <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${isDark ? "text-white" : "text-primary"}`}>{formatPrice(startingPrice)}</span>
                    <span className={textMuted}>/ pax</span>
                </div>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-lg bg-linear-to-r from-primary to-cyan-500 text-white transition-all duration-300 transform hover:-translate-y-1 hover:brightness-110 hover:shadow-primary/25 active:scale-95"
                >
                  {user ? t("booking.checkAvailability") : t("booking.loginToBook")}
                </button>
                <div className={`flex flex-col gap-3 p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <div><p className={`text-sm font-bold ${textColor}`}>Secure Booking</p><p className={`text-xs ${textMuted}`}>Your data is protected</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div><p className={`text-sm font-bold ${textColor}`}>Instant Confirmation</p><p className={`text-xs ${textMuted}`}>Receive ticket via email</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* FIXED Help Card */}
            <div className={`p-6 rounded-3xl border ${cardBg}`}>
               <h4 className={`font-bold mb-2 ${textColor}`}>{t("booking.needHelp")}</h4>
               <p className={`text-sm mb-4 ${textMuted}`}>Contact our support team for custom arrangements.</p>
               <a 
                 href={whatsappUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border font-bold text-center transition ${isDark ? "border-gray-700 hover:bg-gray-800 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-900"}`}
               >
                 <MessageCircle size={18} />
                 {t("booking.sendMessage")}
               </a>
            </div>
          </div>
        </div>
      </div>

      {pkg && (
        <PackageBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pkg={pkg}
          user={user as AuthUser | null}
          t={t as TFunction}
        />
      )}
    </div>
  );
}