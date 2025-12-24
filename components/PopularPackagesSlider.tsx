// components/PopularPackagesSlider.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import api from "@/lib/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface PackagePriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

interface PackageListItem {
  id: number;
  slug: string; //
  name: string;
  location?: string | null;
  duration: number;
  thumbnail_url: string | null;
  starting_from_price: number | null; 
  price_tiers: PackagePriceTier[];
  category?: string | null;
}

interface ApiResponse {
  data: PackageListItem[];
}

const calculateStartingPrice = (pkg: PackageListItem): number => {
  if (pkg.starting_from_price && pkg.starting_from_price > 0) return pkg.starting_from_price;
  const priceTiers = pkg.price_tiers || [];
  if (priceTiers.length > 0) {
    const sortedTiers = [...priceTiers].sort((a, b) => a.min_pax - b.min_pax);
    const smallGroupTier = sortedTiers.find(t => t.min_pax <= 4);
    return smallGroupTier ? smallGroupTier.price : sortedTiers[0].price;
  }
  return 0;
};

const ApiPackageCard = ({ pkg }: { pkg: PackageListItem }) => {
  const { theme } = useTheme();
  const tDetail = useTranslations("activityDetail"); 
  const t = useTranslations("PopularPackages");
  const price = calculateStartingPrice(pkg);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`${theme === "regular" ? "bg-white" : "bg-gray-800"} rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full`}>
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={pkg.thumbnail_url || "/placeholder.jpg"}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Perbaikan Warning
        />
        <div className="absolute top-4 right-4 bg-black/70 text-white py-1 px-3 rounded-full text-xs font-bold backdrop-blur-sm">
          {pkg.duration} Days
        </div>
      </div>
      <div className="p-6 flex flex-col grow">
        {pkg.category && <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">{pkg.category}</p>}
        <h2 className={`text-xl font-bold mb-2 ${theme === "regular" ? "text-gray-900" : "text-white"} line-clamp-2`}>{pkg.name}</h2>
        <p className={`mb-4 text-sm ${theme === "regular" ? "text-gray-600" : "text-gray-400"}`}>📍 {pkg.location || "Yogyakarta"}</p>
        <div className={`flex justify-between items-center mt-auto pt-4 border-t ${theme === "regular" ? "border-gray-100" : "border-gray-700"}`}>
          <div className="flex flex-col">
            <span className={`text-xs ${theme === "regular" ? "text-gray-600" : "text-gray-400"}`}>{tDetail("startingFrom")}</span>
            <span className="text-lg font-bold text-primary">{price > 0 ? formatCurrency(price) : "Check Detail"}</span>
          </div>
          <span className={`text-sm font-semibold ${theme === "regular" ? "text-gray-900" : "text-white"} group-hover:text-primary transition`}>
            {t("cta")} →
          </span>
        </div>
      </div>
    </div>
  );
};

export default function PopularPackagesSlider() {
  const t = useTranslations("PopularPackages");
  const tActivities = useTranslations("activities");
  const params = useParams();
  const locale = params.locale as string;

  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get<ApiResponse>("/public/packages?per_page=10");
        if (response.data?.data) setPackages(response.data.data.slice(0, 6));
      } catch (err) {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">{t("title")}</h2>
            <p className="text-lg text-foreground/70 max-w-xl">{t("subtitle")}</p>
          </div>
          <Link href={`/${locale}/packages`} className="mt-4 sm:mt-0 bg-primary text-black font-bold py-2 px-5 rounded-lg text-sm transition transform hover:scale-105">
            {tActivities("showMore")}
          </Link>
        </div>

        {loading ? <div className="text-center p-12">Loading...</div> : error ? <div className="text-center p-12 text-red-500">{error}</div> : (
          <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={30} slidesPerView={1} breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} className="pb-12">
            {packages.map((pkg) => (
              <SwiperSlide key={pkg.id} className="h-full">
                {/* Perbaikan: Menggunakan pkg.slug bukan pkg.id */}
                <Link href={`/${locale}/packages/${pkg.slug}`} className="block h-full">
                  <ApiPackageCard pkg={pkg} />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}