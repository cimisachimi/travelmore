// File: activities/[id]/page.tsx

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

// [NEW] Import the new ActivityBookingModal
import ActivityBookingModal from "./ActivityBookingModal";

// --- Tipe Data (Interfaces) ---
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

// [NEW] Interface for Activity (based on Activity.php model)
export interface Activity {
  id: number;
  name: string;
  duration: string | null;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number; // Corrected: Based on your model
  // This matches the accessor
  images_url: { id: number; url: string; type: string }[];
  thumbnail_url: string | null;
}

export type TFunction = (key: string, defaultMessage?: string) => string;

// --- MobileImageSlider Component (Unchanged) ---
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
// --- End MobileImageSlider ---

// --- Komponen Utama ---
export default function ActivityDetailPage() {
  const { theme } = useTheme();
  const t = useTranslations("activities"); // You can create a new 'activities' translation file if needed
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;

  // [UPDATED] State for Activity
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const errorNotFound = t("status.notFound");

  useEffect(() => {
    if (!id) return;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        // [UPDATED] Fetch from the correct API endpoint
        const response = await api.get(`/activities/${id}`);
        setActivity(response.data as Activity);
      } catch (err: unknown) {
        console.error("Failed to fetch activity:", err);
        if (typeof err === "object" && err !== null && "response" in err) {
          const response = (err as { response?: { status?: number } }).response;
          if (response?.status === 404) {
            setError(errorNotFound);
          } else {
            setError(t("status.fetchError", { defaultMessage: "Failed to load activity data." }));
          }
        } else {
          setError(t("status.fetchError", { defaultMessage: "Failed to load activity data." }));
        }
      }
      finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id, errorNotFound, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t("status.loading")}
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 p-4 text-center">
        {error || t("status.notFound")}
      </div>
    );
  }

  // [UPDATED] Get images from the array of objects
  const images = activity.images_url ? activity.images_url.map(img => img.url) : [];
  const title = activity.name.split(": ")[1] || activity.name;

  // [REMOVED] Tabs are not needed for the simpler activity view
  // const tabs = ["Overview", "Itinerary", "Pricing", "Cost", "FAQs", "Map"];

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass =
    theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass =
    theme === "regular" ? "border-gray-200" : "border-gray-700";

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderGallery = (): ReactNode => {
    // ... (This function remains unchanged as it just needs an array of strings) ...
    const count = images.length;
    if (count === 0)
      return (
        <div
          className={`w-full h-72 md:h-[400px] ${theme === "regular" ? "bg-gray-200" : "bg-gray-900"
            } rounded-lg flex items-center justify-center text-gray-500`}
        >
          {t("gallery.noImage")}
        </div>
      );

    return (
      <>
        <div className="md:hidden">
          <MobileImageSlider images={images} title={title} />
        </div>
        <div className="hidden md:block">
          {count === 1 && (
            <div className="relative h-96 md:h-[600px]">
              <Image
                src={images[0]}
                alt={title}
                fill
                className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
          )}
          {count === 2 && (
            <div className="grid grid-cols-2 gap-2 h-72 md:h-[500px]">
              {images.map((src, i) => (
                <div key={i} className={`relative w-full h-full ${i === 0 ? 'rounded-tl-2xl' : 'rounded-tr-2xl'}`}>
                  <Image
                    src={src}
                    alt={`${title}-${i}`}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              ))}
            </div>
          )}
          {count > 2 && (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 md:h-[600px]">
              <div className="relative col-span-2 row-span-2 rounded-tl-2xl overflow-hidden">
                <Image
                  src={images[0]}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 767px) 100vw, 50vw"
                />
              </div>
              {images.slice(1, 3).map((src, i) => (
                <div key={i} className={`relative ${i === 0 ? 'rounded-tr-2xl' : ''} overflow-hidden`}>
                  <Image
                    src={src}
                    alt={`${title}-${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
              {images.length > 3 && (
                <div className="relative overflow-hidden">
                  <Image
                    src={images[3]}
                    alt={`${title}-3`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              )}
              {images.length <= 3 && <div className="bg-muted"></div>}
            </div>
          )}
        </div>
      </>
    );
  };


  return (
    <div className={mainBgClass}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div
          className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}
        >
          {renderGallery()}

          <div className={`p-6 md:p-10 border-b ${borderClass}`}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* [UPDATED] Show duration string directly */}
              {activity.duration && (
                <div
                  className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-blue-900 text-blue-200"
                    }`}
                >
                  {activity.duration}
                </div>
              )}
              {activity.category && (
                <div
                  className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-700 text-gray-200"
                    }`}
                >
                  {activity.category}
                </div>
              )}
              {activity.location && (
                <div
                  className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-emerald-900 text-emerald-200"
                    }`}
                >
                  {activity.location}
                </div>
              )}
            </div>
            <h1
              className={`text-3xl md:text-5xl font-extrabold ${textClass}`}
            >
              {title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
            {/* [UPDATED] Simplified Main Content */}
            <div className="lg:col-span-2">
              <div className="py-8 min-h-[300px]">
                <h3
                  className={`text-2xl font-bold mb-4 ${textClass}`}
                >
                  {t("trip.about")}
                </h3>
                <p
                  className={`text-lg leading-relaxed ${textMutedClass} whitespace-pre-wrap`}
                >
                  {activity.description || "No description available."}
                </p>
              </div>
            </div>

            {/* --- Sidebar Booking --- */}
            <div className="lg:col-span-1">
              <div
                className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-8`}
              >
                {/* [UPDATED] Price Display */}
                <div className="mb-5">
                  <p className={`text-sm ${textMutedClass}`}>
                    {t("trip.price")}
                  </p>
                  <p className={`text-3xl font-bold ${textClass}`}>
                    {/* [UPDATED] Use activity.price */}
                    {formatPrice(activity.price)}
                  </p>
                  <p className={`text-sm ${textMutedClass}`}>
                    / {t("trip.person")}
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!user}
                >
                  {user ? t("booking.checkAvailability") : t("booking.loginToBook", { defaultMessage: "Login to Book" })}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  {t("booking.needHelp")}{" "}
                  <a
                    href="#"
                    className="text-cyan-600 font-semibold hover:underline"
                  >
                    {t("booking.sendMessage")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            href="/activities" // [UPDATED] Link back to activities list
            className={`inline-block py-3 px-8 rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 ${theme === "regular"
              ? "bg-white text-blue-600 hover:bg-gray-50"
              : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
          >
            {t("buttons.back")}
          </Link>
        </div>
      </div>

      {/* [UPDATED] Render the new ActivityBookingModal */}
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