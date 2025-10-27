// components/PopularPackagesSlider.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api"; // Asumsi dari packages/page.tsx
import PackageCard from "./PackageCard";

// Impor Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Interface ini disalin dari packages/page.tsx Anda
interface PackageListItem {
  id: number;
  name: string;
  location?: string | null;
  duration: number;
  regularPrice?: number;
  exclusivePrice: number;
  rating?: number | null;
  category?: string | null;
  thumbnail_url: string | null;
}

interface ApiResponse {
  data: PackageListItem[];
}

export default function PopularPackagesSlider() {
  const t = useTranslations("PopularPackages");
  const tActivities = useTranslations("activities"); // Untuk "showMore"
  const params = useParams();
  const locale = params.locale as string;

  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ambil data dari API, limit ke 6 untuk slider
        const response = await api.get<ApiResponse>("/public/packages?limit=6");
        setPackages(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch packages:", err);
        setError("Failed to load packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              {t("title")}
            </h2>
            <p className="text-lg text-foreground/70 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/packages`}
            className="mt-4 sm:mt-0 whitespace-nowrap bg-primary text-black font-bold py-2 px-5 rounded-lg text-sm transition transform hover:scale-105 hover:brightness-90"
          >
            {tActivities("showMore")}
          </Link>
        </div>

        {/* Slider */}
        {loading && (
          <div className="text-center p-12 text-foreground/70">
            Loading packages...
          </div>
        )}
        {error && (
          <div className="text-center p-12 text-red-500">{error}</div>
        )}
        {!loading && !error && packages.length > 0 && (
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
            className="pb-12" // Ruang untuk pagination
          >
            {packages.map((pkg) => (
              <SwiperSlide key={pkg.id} className="h-full">
                <PackageCard packageItem={pkg} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
