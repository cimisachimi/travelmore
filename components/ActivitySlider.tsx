// components/ActivitySlider.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { activities } from "@/data/activities";
import ActivityCard from "./ActivityCard";

// Impor Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ActivitySlider() {
  // PERBAIKAN: Menggunakan key "activities" yang sudah ada di en.json
  const t = useTranslations("activities"); 
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              {/* PERBAIKAN: Key ini akan kita tambahkan ke en.json di bawah key "activities" */}
              {t("popularActivities")}
            </h2>
            <p className="text-lg text-foreground/70 max-w-xl">
              {/* PERBAIKAN: Key ini akan kita tambahkan ke en.json di bawah key "activities" */}
              {t("popularActivitiesDesc")}
            </p>
          </div>
          <Link
            href={`/${locale}/activities`}
            className="mt-4 sm:mt-0 whitespace-nowrap bg-primary text-black font-bold py-2 px-5 rounded-lg text-sm transition transform hover:scale-105 hover:brightness-90"
          >
            {/* PERBAIKAN: Key ini akan kita tambahkan ke en.json di bawah key "activities" */}
            {t("showMore")}
          </Link>
        </div>

        {/* Slider */}
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
          className="pb-12"
        >
          {activities.map((activity) => (
            <SwiperSlide key={activity.id} className="h-full">
              <ActivityCard activity={activity} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
