// components/ActivitySlider.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import api from "@/lib/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Activity {
  id: number;
  slug: string; //
  name: string;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number;
  thumbnail_url: string | null;
}

interface ApiResponse {
  data: Activity[];
}

const ApiActivityCard = ({ activity }: { activity: Activity }) => {
  const { theme } = useTheme();
  const t = useTranslations("activities");
  const tDetail = useTranslations("activityDetail");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`${theme === "regular" ? "bg-white" : "bg-gray-800"} rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full`}>
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={activity.thumbnail_url || "/placeholder.jpg"}
          alt={activity.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Perbaikan Warning
        />
      </div>
      <div className="p-6 flex flex-col grow">
        {activity.category && <p className="text-sm font-semibold text-primary mb-2">{activity.category}</p>}
        <h2 className={`text-xl font-bold mb-2 ${theme === "regular" ? "text-gray-900" : "text-white"} line-clamp-2`}>{activity.name}</h2>
        <p className={`mb-4 grow ${theme === "regular" ? "text-gray-600" : "text-gray-400"} text-sm line-clamp-3`}>{activity.description}</p>
        <div className={`flex justify-between items-center mt-auto pt-4 border-t ${theme === "regular" ? "border-gray-100" : "border-gray-700"}`}>
          <div className="flex flex-col">
            <span className={`text-xs ${theme === "regular" ? "text-gray-600" : "text-gray-400"}`}>{tDetail("startingFrom")}</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(activity.price)}</span>
          </div>
          <span className={`text-sm font-semibold ${theme === "regular" ? "text-gray-900" : "text-white"} group-hover:text-primary transition`}>
            {t("buttons.details")} →
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ActivitySlider() {
  const t = useTranslations("activities");
  const params = useParams();
  const locale = params.locale as string;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get<ApiResponse>("/activities?limit=6");
        setActivities(response.data.data || []);
      } catch (err) {
        setError("Could not load activities.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">{t("popularActivities")}</h2>
            <p className="text-lg text-foreground/70 max-w-xl">{t("popularActivitiesDesc")}</p>
          </div>
          <Link href={`/${locale}/activities`} className="mt-4 sm:mt-0 bg-primary text-black font-bold py-2 px-5 rounded-lg text-sm transition transform hover:scale-105">
            {t("showMore")}
          </Link>
        </div>

        {loading ? <div className="text-center p-12">Loading...</div> : error ? <div className="text-center p-12 text-red-500">{error}</div> : (
          <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={30} slidesPerView={1} breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} className="pb-12">
            {activities.map((activity) => (
              <SwiperSlide key={activity.id} className="h-full">
                {/* Perbaikan: Menggunakan activity.slug bukan activity.id */}
                <Link href={`/${locale}/activities/${activity.slug}`} className="block h-full">
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