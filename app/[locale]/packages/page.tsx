"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api";

// --- Interfaces ---
interface PackageListItem {
  id: number;
  name: string;
  location?: string;
  duration: number;
  price_regular: number;
  price_exclusive: number;
  rating?: number;
  category: string;
  images_url: string[]; // Masih ada untuk fallback
  thumbnail_url: string | null; // ✅ TAMBAHKAN INI
}

interface ApiResponse {
  data: PackageListItem[];
  links?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}


// --- Helper Icon ---
const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.59L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Komponen Utama ---
export default function PackagesPage() {
  const { theme } = useTheme();
  const t = useTranslations("PackagesPage");

  const [apiPackages, setApiPackages] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchErrorString = t("status.fetchError",);
  const loadingString = t('status.loading');
  const noCategoriesString = t('status.noCategories');
  const noResultsString = t("noResults");

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ApiResponse>('/public/packages');
        const packagesData = response.data.data || [];
        setApiPackages(packagesData);

        if (packagesData.length > 0) {
          const allPrices = packagesData.flatMap((p) => [
            p.price_regular,
            p.price_exclusive,
          ]);
          const numericPrices = allPrices.filter(p => typeof p === 'number' && !isNaN(p));
          if (numericPrices.length > 0) {
            setMaxPrice(Math.max(...numericPrices));
          } else {
            setMaxPrice(10000000);
          }
        } else {
          setMaxPrice(10000000);
        }

      } catch (err: unknown) {
        console.error("Failed to fetch packages:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(fetchErrorString);
        }
      }

    };

    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchErrorString]);

  const priceBounds = useMemo(() => {
    if (apiPackages.length === 0) return { min: 0, max: 10000000 };
    const allPrices = apiPackages.flatMap((p) => [p.price_regular, p.price_exclusive]);
    const numericPrices = allPrices.filter(p => typeof p === 'number' && !isNaN(p));
    if (numericPrices.length === 0) return { min: 0, max: 10000000 };
    return { min: Math.min(...numericPrices), max: Math.max(...numericPrices) };
  }, [apiPackages]);

  const allCategories = useMemo(
    () => [...new Set(apiPackages.map((pkg) => pkg.category).filter(Boolean))], // Filter out null/undefined categories
    [apiPackages]
  );

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const category = event.target.name;
    if (event.target.checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  const filteredPackages = useMemo(() => {
    return apiPackages.filter((pkg) => {
      const currentPrice = pkg.price_exclusive;
      const priceMatch = currentPrice <= maxPrice;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(pkg.category);
      return priceMatch && categoryMatch;
    });
  }, [apiPackages, maxPrice, selectedCategories]);

  const formatCurrency = (amount: number | string | null | undefined): string => {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numericAmount);
  }

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const headerBgClass = theme === "regular" ? "bg-white" : "bg-gray-900";

  return (
    <div className={`${mainBgClass}`}>
      <header
        className={`py-12 ${headerBgClass} border-b ${theme === "regular" ? "border-gray-200" : "border-gray-800"
          }`}
      >
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className={`text-4xl md:text-5xl font-extrabold ${textClass}`}>
            {t("title")}
          </h1>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${textMutedClass}`}>
            {t("subtitle")}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <aside
            className={`w-full md:w-1/4 md:block ${isFilterOpen ? "block" : "hidden"}`}
          >
            <div
              className={`${cardBgClass} p-6 rounded-lg shadow-md sticky top-24`}
            >
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>
                {t("filters")}
              </h3>
              <div className="mb-6">
                <label
                  htmlFor="priceRange"
                  className={`block font-semibold mb-2 ${textClass}`}
                >
                  {t("priceRange")}
                </label>
                <input
                  id="priceRange"
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  disabled={loading}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50"
                />
                <div className={`mt-2 ${textMutedClass}`}>
                  {t("upTo")}: <strong>{formatCurrency(maxPrice)}</strong>
                </div>
              </div>
              <hr className="my-6 border-gray-200 dark:border-gray-700" />
              <div>
                <h4 className={`font-semibold mb-2 ${textClass}`}>
                  {t("categories")}
                </h4>
                <div className="space-y-2">
                  {loading ? (
                    <p className={textMutedClass}>{loadingString}</p>
                  ) : allCategories.length > 0 ? (
                    allCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          name={category}
                          checked={selectedCategories.includes(category)}
                          onChange={handleCategoryChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className={`ml-3 ${textMutedClass}`}>{category}</span>
                      </label>
                    ))
                  ) : (
                    <p className={textMutedClass}>{noCategoriesString}</p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <main className="w-full md:w-3/4">
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-semibold ${cardBgClass} ${textClass} shadow-md`}
              >
                <FilterIcon />{" "}
                {isFilterOpen ? t("closeFilters") : t("showFilters")}
              </button>
            </div>

            {loading && (
              <div className="text-center py-16">
                <p className={`${textMutedClass} text-xl`}>{loadingString}</p>
              </div>
            )}
            {error && !loading && (
              <div className="text-center py-16">
                <p className="text-red-500 text-xl">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <Link key={pkg.id} href={`/packages/${pkg.id}`}>
                      <div
                        className={`${cardBgClass} rounded-lg shadow-lg overflow-hidden flex flex-col group transition hover:shadow-2xl hover:-translate-y-1 h-full`}
                      >
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            // Uses thumbnail_url if available, otherwise falls back to placeholder.jpg
                            src={pkg.thumbnail_url || "/placeholder.jpg"}
                            alt={pkg.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1023px) 100vw, 50vw"
                          />
                          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white py-1 px-3 rounded-full text-sm font-bold backdrop-blur-sm">
                            {pkg.duration} {t("days")}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <p className={`text-sm font-semibold text-blue-500 mb-2`}>
                            {pkg.category}
                          </p>
                          <h2 className={`text-xl font-bold mb-2 ${textClass}`}>
                            {pkg.name.split(": ")[1] || pkg.name}
                          </h2>
                          <div
                            className={`flex justify-between items-center mt-auto pt-4 border-t ${theme === "regular"
                              ? "border-gray-100"
                              : "border-gray-700"
                              }`}
                          >
                            <p
                              className={`text-lg font-bold text-blue-600 dark:text-blue-400`}
                            >
                              {formatCurrency(pkg.price_exclusive)}
                            </p>
                            <span
                              className={`text-sm font-semibold ${textClass} group-hover:text-blue-500 transition`}
                            >
                              {t("viewDetails")} →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="lg:col-span-2 text-center py-16">
                    <p className="text-gray-500 text-xl">{noResultsString}</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}