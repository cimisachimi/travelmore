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
  MapPin,
  Clock,
  Tag,
  ChevronLeft,
  Camera,
  Info,
  ShieldCheck,
  CheckCircle2,
  LucideIcon
} from "lucide-react";

// --- Types ---
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

export interface Activity {
  id: number;
  name: string;
  duration: string;
  category: string;
  description: string;
  location: string;
  price: number;
  images_url: { id: number; url: string; type: string }[];
  thumbnail_url: string | null;
  addons?: Addon[]; // ✅ Added here
}

export type TFunction = (key: string, values?: Record<string, string | number | Date>) => string;

// --- Components ---
const SectionTitle = ({ children, icon: Icon, theme }: { children: React.ReactNode; icon?: LucideIcon; theme: string }) => (
  <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${theme === "regular" ? "text-gray-900" : "text-white"}`}>
    {Icon && <Icon className="w-6 h-6 text-blue-600" />}
    {children}
  </h3>
);

export default function ActivityDetailPage() {
  const { theme } = useTheme();
  const t = useTranslations("activities");
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        // ✅ Fetch from API
        const response = await api.get(`/activities/${id}`);
        setActivity(response.data);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        setError(t("status.fetchError") || "Activity not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id, t]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !activity) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || t("status.notFound")}</div>;

  const images = activity.images_url.map(img => img.url);
  const title = activity.name;
  
  // Styles
  const isDark = theme === "exclusive";
  const mainBg = isDark ? "bg-black" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";

  const formatPrice = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className={`min-h-screen ${mainBg} transition-colors duration-300`}>
      
      {/* Gallery Section */}
      <div className="relative h-[400px] w-full md:h-[500px]">
        <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            className="h-full w-full"
        >
            {images.length > 0 ? images.map((src, index) => (
            <SwiperSlide key={index}>
                <div className="relative h-full w-full">
                <Image src={src} alt={`${title} ${index + 1}`} fill className="object-cover" priority={index === 0} />
                <div className="absolute inset-0 bg-black/30 md:hidden" />
                </div>
            </SwiperSlide>
            )) : (
                <div className="h-full flex items-center justify-center bg-gray-200 text-gray-500"><Camera size={48} /></div>
            )}
        </Swiper>
        
        <div className="absolute top-4 left-4 z-10">
            <Link href="/activities" className="bg-white/90 p-2 rounded-full text-black shadow-lg backdrop-blur-sm flex items-center gap-2 px-4 hover:bg-white transition">
              <ChevronLeft size={20} /> Back
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className={`lg:col-span-2 p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
                <div className="mb-6">
                    <div className="flex flex-wrap gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${isDark ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                            <Clock size={12} /> {activity.duration}
                        </span>
                        {activity.category && (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                                <Tag size={12} /> {activity.category}
                            </span>
                        )}
                    </div>
                    <h1 className={`text-3xl md:text-4xl font-black ${textColor}`}>{activity.name}</h1>
                    <p className={`flex items-center gap-2 mt-2 ${textMuted}`}><MapPin size={16}/> {activity.location}</p>
                </div>

                <div className="space-y-8">
                    <div>
                        <SectionTitle icon={Info} theme={theme}>{t("trip.about")}</SectionTitle>
                        <p className={`whitespace-pre-wrap leading-relaxed ${textMuted}`}>{activity.description || "No description available."}</p>
                    </div>

                    {/* ✅ Add-ons Display */}
                    {activity.addons && activity.addons.length > 0 && (
                        <div>
                            <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textColor}`}>
                                <Camera className="w-5 h-5 text-purple-500" /> Optional Add-ons
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activity.addons.map((addon, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex justify-between items-center ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                                        <span className={`font-medium ${textColor}`}>{addon.name}</span>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${isDark ? "bg-gray-700 text-white" : "bg-white text-gray-900 shadow-sm"}`}>
                                            +{formatPrice(addon.price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
                <div className={`p-6 rounded-3xl border shadow-xl sticky top-8 ${cardBg}`}>
                    <div className="mb-6">
                        <p className={`text-sm font-medium mb-1 ${textMuted}`}>Price per person</p>
                        <span className={`text-4xl font-black ${isDark ? "text-white" : "text-blue-600"}`}>{formatPrice(Number(activity.price))}</span>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-4 rounded-xl font-bold text-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:-translate-y-1"
                    >
                        {user ? t("booking.checkAvailability") : t("booking.loginToBook")}
                    </button>

                    <div className={`mt-6 space-y-3 p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <div><p className={`text-sm font-bold ${textColor}`}>Secure Booking</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <div><p className={`text-sm font-bold ${textColor}`}>Instant Confirmation</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {activity && (
        <ActivityBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activity={activity}
          user={user as AuthUser | null}
          t={t as TFunction}
        />
      )}
    </div>
  );
}