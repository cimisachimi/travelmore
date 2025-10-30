// components/ActivitySlider.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import api from "@/lib/api"; // Import your API instance

// Impor Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// [NEW] Define the Activity type based on your API response (from activities/page.tsx)
interface Activity {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number;
  thumbnail_url: string | null;
}

// [NEW] Define the API response structure (from activities/page.tsx)
interface ApiResponse {
  data: Activity[];
}

// [NEW] Helper Component: ApiActivityCard
// This component is modeled after the card structure in activities/page.tsx
const ApiActivityCard = ({ activity }: { activity: Activity }) => {
  const { theme } = useTheme();
  const t = useTranslations("activities");
  const tDetail = useTranslations("activityDetail");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Dynamic classes
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass =
    theme === "regular" ? "text-gray-600" : "text-gray-400";
  const borderClass =
    theme === "regular" ? "border-gray-100" : "border-gray-700";

  return (
    <div
      className={`${cardBgClass} rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full`}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={activity.thumbnail_url || "/placeholder.jpg"}
          alt={activity.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            (e.target as HTMLImageElement).srcset = "/placeholder.jpg";
            (e.target as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
      </div>
      <div className="p-6 flex flex-col grow">
        {activity.category && (
          <p className="text-sm font-semibold text-primary mb-2">
            {activity.category}
          </p>
        )}
        <h2
          className={`text-xl font-bold mb-2 ${textClass} line-clamp-2`}
          title={activity.name}
        >
          {activity.name}
        </h2>
        <p
          className={`mb-4 grow ${textMutedClass} text-sm overflow-hidden text-ellipsis`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {activity.description}
        </p>
        <div
          className={`flex justify-between items-center mt-auto pt-4 border-t ${borderClass}`}
        >
          <div className="flex flex-col">
            <span className={`text-xs ${textMutedClass}`}>
              {tDetail("startingFrom")}
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(activity.price)}
            </span>
          </div>
          <span
            className={`text-sm font-semibold ${textClass} group-hover:text-primary transition`}
          >
            {t("buttons.details")} →
          </span>
        </div>
      </div>
    </div>
  );
};

// --- [UPDATED] Main ActivitySlider Component ---
export default function ActivitySlider() {
  const t = useTranslations("activities");
  const params = useParams();
  const locale = params.locale as string;

  // [NEW] State for API data
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // [NEW] Memoize translation strings for useEffect
  const errorFetchString = useMemo(
    () =>
      t("empty.fetchError", {
        defaultMessage: "Could not load activities. Please try again later.",
      }),
    [t]
  );
  const loadingString = useMemo(
    () => t("empty.loading", { defaultMessage: "Loading activities..." }),
    [t]
  );

  // [NEW] Fetch data from the backend
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from API, limit to 6 for the slider
        const response = await api.get<ApiResponse>("/activities?limit=6");
        setActivities(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError(errorFetchString);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [errorFetchString]); // Depend on the memoized string

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section (Unchanged) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              {t("popularActivities")}
            </h2>
            <p className="text-lg text-foreground/70 max-w-xl">
              {t("popularActivitiesDesc")}
            </p>
          </div>
          <Link
            href={`/${locale}/activities`}
            className="mt-4 sm:mt-0 whitespace-nowrap bg-primary text-black font-bold py-2 px-5 rounded-lg text-sm transition transform hover:scale-105 hover:brightness-90"
          >
            {t("showMore")}
          </Link>
        </div>

        {/* [NEW] Slider with Loading/Error/Data states */}
        {loading && (
          <div className="text-center p-12 text-foreground/70">
            {loadingString}
          </div>
        )}
        {error && (
          <div className="text-center p-12 text-red-500">{error}</div>
        )}
        {!loading && !error && activities.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12" // Room for pagination
          >
            {activities.map((activity) => (
              <SwiperSlide key={activity.id} className="h-full">
                {/* [NEW] Link wrapping the new card component */}
                <Link
                  href={`/${locale}/activities/${activity.id}`}
                  className="block h-full"
                >
                  <ApiActivityCard activity={activity} />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}