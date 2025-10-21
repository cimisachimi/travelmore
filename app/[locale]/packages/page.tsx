"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { packages } from "@/data/packages";
import { useTranslations } from "next-intl";

// Helper Icon for the filter button
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

export default function PackagesPage() {
  const { theme } = useTheme();
  const t = useTranslations("PackagesPage"); // ✅ ganti namespace

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const priceBounds = useMemo(() => {
    if (packages.length === 0) return { min: 0, max: 10000000 };
    const allPrices = packages.flatMap((p) => [
      p.regularPrice,
      p.exclusivePrice,
    ]);
    return { min: Math.min(...allPrices), max: Math.max(...allPrices) };
  }, []);

  const [maxPrice, setMaxPrice] = useState<number>(priceBounds.max);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const allCategories = useMemo(
    () => [...new Set(packages.map((pkg) => pkg.category))],
    []
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
    return packages.filter((pkg) => {
      const currentPrice =
        theme === "regular" ? pkg.regularPrice : pkg.exclusivePrice;
      const priceMatch = currentPrice <= maxPrice;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(pkg.category);
      return priceMatch && categoryMatch;
    });
  }, [maxPrice, selectedCategories, theme]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass =
    theme === "regular" ? "text-gray-600" : "text-gray-300";
  const headerBgClass = theme === "regular" ? "bg-white" : "bg-gray-900";

  return (
    <div className={`${mainBgClass}`}>
      {/* Header */}
      <header
        className={`py-12 ${headerBgClass} border-b ${
          theme === "regular" ? "border-gray-200" : "border-gray-800"
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
          {/* Filter Sidebar */}
          <aside
            className={`w-full md:w-1/4 md:block ${
              isFilterOpen ? "block" : "hidden"
            }`}
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
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
                  {allCategories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        name={category}
                        checked={selectedCategories.includes(category)}
                        onChange={handleCategoryChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className={`ml-3 ${textMutedClass}`}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Packages Grid */}
          <main className="w-full md:w-3/4">
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-semibold ${cardBgClass} ${textClass} shadow-md`}
              >
                <FilterIcon />{" "}
                {isFilterOpen ? t("closeFilters") : t("showFilters")}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <Link key={pkg.id} href={`/packages/${pkg.id}`}>
                    <div
                      className={`${cardBgClass} rounded-lg shadow-lg overflow-hidden flex flex-col group transition hover:shadow-2xl hover:-translate-y-1 h-full`}
                    >
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          src={
                            pkg.images && pkg.images.length > 0
                              ? pkg.images[0]
                              : "/placeholder.jpg"
                          }
                          alt={pkg.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white py-1 px-3 rounded-full text-sm font-bold backdrop-blur-sm">
                          {pkg.duration} {t("days")}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <p
                          className={`text-sm font-semibold text-blue-500 mb-2`}
                        >
                          {pkg.category}
                        </p>
                        <h2 className={`text-xl font-bold mb-2 ${textClass}`}>
                          {pkg.title.split(": ")[1]}
                        </h2>
                        <p
                          className={`mb-4 flex-grow ${textMutedClass} text-sm`}
                        >
                          {pkg.description}
                        </p>
                        <div
                          className={`flex justify-between items-center mt-auto pt-4 border-t ${
                            theme === "regular"
                              ? "border-gray-100"
                              : "border-gray-700"
                          }`}
                        >
                          <p
                            className={`text-lg font-bold text-blue-600 dark:text-blue-400`}
                          >
                            {formatCurrency(
                              theme === "regular"
                                ? pkg.regularPrice
                                : pkg.exclusivePrice
                            )}
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
                  <p className="text-gray-500 text-xl">{t("noResults")}</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
