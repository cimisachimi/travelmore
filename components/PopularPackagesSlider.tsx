// components/PopularPackagesSlider.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image"; // Jangan lupa import Image
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider"; // Import Theme
import api from "@/lib/api";

// Impor Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- 1. Interface yang Benar (Sesuai API Package) ---
interface PackagePriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

interface PackageListItem {
  id: number;
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

// --- 2. Helper Logic Hitung Harga ---
const calculateStartingPrice = (pkg: PackageListItem): number => {
  // Prioritas 1: starting_from_price langsung
  if (pkg.starting_from_price && pkg.starting_from_price > 0) {
    return pkg.starting_from_price;
  }
  
  // Prioritas 2: Hitung dari Tier (Cari harga grup kecil 2-4 orang)
  const priceTiers = pkg.price_tiers || [];
  if (priceTiers.length > 0) {
    const sortedTiers = [...priceTiers].sort((a, b) => a.min_pax - b.min_pax);
    const smallGroupTier = sortedTiers.find(
      (tier) => tier.min_pax <= 4 && (tier.max_pax || 4) >= 2
    );
    if (smallGroupTier) return smallGroupTier.price;
    // Fallback: ambil harga tengah
    const medianIndex = Math.floor(sortedTiers.length / 2);
    return sortedTiers[medianIndex]?.price || 0;
  }
  return 0;
};

// --- 3. Internal Component Card (Mirip ApiActivityCard tapi untuk Package) ---
const ApiPackageCard = ({ pkg }: { pkg: PackageListItem }) => {
  const { theme } = useTheme();
  const tDetail = useTranslations("activityDetail"); 
  const t = useTranslations("PopularPackages");

  const price = calculateStartingPrice(pkg);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Dynamic classes (Sama seperti ActivitySlider)
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-400";
  const borderClass = theme === "regular" ? "border-gray-100" : "border-gray-700";

  return (
    <div className={`${cardBgClass} rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full`}>
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={pkg.thumbnail_url || "/placeholder.jpg"}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Badge Durasi */}
        <div className="absolute top-4 right-4 bg-black/70 text-white py-1 px-3 rounded-full text-xs font-bold backdrop-blur-sm">
          {pkg.duration} Days
        </div>
      </div>
      
      <div className="p-6 flex flex-col grow">
        {pkg.category && (
          <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
            {pkg.category}
          </p>
        )}
        
        <h2 className={`text-xl font-bold mb-2 ${textClass} line-clamp-2`} title={pkg.name}>
          {pkg.name}
        </h2>
        
        <p className={`mb-4 text-sm ${textMutedClass}`}>
           📍 {pkg.location || "Yogyakarta"}
        </p>

        <div className={`flex justify-between items-center mt-auto pt-4 border-t ${borderClass}`}>
          <div className="flex flex-col">
            <span className={`text-xs ${textMutedClass}`}>
              {tDetail("startingFrom") || "Starting from"}
            </span>
            <span className="text-lg font-bold text-primary">
              {price > 0 ? formatCurrency(price) : "Check Detail"}
            </span>
          </div>
          <span className={`text-sm font-semibold ${textClass} group-hover:text-primary transition`}>
            {t("cta") || "View Details"} →
          </span>
        </div>
      </div>
    </div>
  );
};

// --- 4. Main Component ---
export default function PopularPackagesSlider() {
  const t = useTranslations("PopularPackages");
  const tActivities = useTranslations("activities");
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
        // PENTING: Gunakan per_page=100 agar paket ID 24 pasti terambil jika dia ada di urutan belakang
        const response = await api.get<ApiResponse>("/public/packages?per_page=100");
        
        if (response.data && response.data.data) {
          // Ambil 6 data teratas saja untuk slider
          setPackages(response.data.data.slice(0, 6));
        }
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
            className="pb-12"
          >
            {packages.map((pkg) => (
              <SwiperSlide key={pkg.id} className="h-full">
                <Link href={`/${locale}/packages/${pkg.id}`} className="block h-full">
                    {/* Menggunakan Internal Component Card yang sudah diperbaiki logic harganya */}
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