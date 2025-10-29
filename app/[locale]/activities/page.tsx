// app/[locale]/activities/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api"; // Import your API instance

// [NEW] Define the Activity type based on your API response
interface Activity {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number; // Use the single price from the API
  thumbnail_url: string | null;
  // Add any other fields your API returns
}

// [NEW] Define the API response structure (assuming pagination)
interface ApiResponse {
  data: Activity[];
  // Add other pagination fields if needed (e.g., current_page, last_page)
}

export default function ActivitiesPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("activities");
  const tNav = useTranslations("Navbar");

  // [NEW] State for API data, loading, and errors
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [maxPrice, setMaxPrice] = useState<number>(1000000); // Default max
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // [NEW] Fetch data from the backend
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        //
        const response = await api.get<ApiResponse>("/activities");

        // Assuming paginated response, access the 'data' array
        setAllActivities(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        // [FIXED] Pass default message as an object
        setError(
          t("empty.fetchError", {
            defaultMessage: "Could not load activities. Please try again later.",
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [t]);

  // [UPDATED] Get all unique categories from fetched data
  const allCategories = useMemo(
    () => [
      ...new Set(
        allActivities
          .map((act) => act.category)
          .filter((c): c is string => c !== null && c !== "")
      ),
    ],
    [allActivities]
  );

  // Handle category changes (no change needed)
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const category = event.target.name;
    if (event.target.checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  // [UPDATED] Filter logic based on fetched data
  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      // [UPDATED] Use the single 'price' field
      const priceMatch = act.price <= maxPrice;
      const categoryMatch =
        selectedCategories.length === 0 ||
        (act.category && selectedCategories.includes(act.category));
      return priceMatch && categoryMatch;
    });
  }, [allActivities, maxPrice, selectedCategories]);

  // Format currency (no change needed)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Dynamic classes (no change needed)
  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass =
    theme === "regular" ? "text-gray-600" : "text-gray-300";
  const headerBgClass = theme === "regular" ? "bg-white" : "bg-gray-900";

  // [UPDATED] ThemeToggleButton no longer controls price, only theme
  const ThemeToggleButton = () => {
    return (
      <div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-700">
        <button
          onClick={() => setTheme("regular")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
            theme === "regular"
              ? "bg-white text-black shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {tNav("regular")}
        </button>
        <button
          onClick={() => setTheme("exclusive")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
            theme === "exclusive"
              ? "bg-primary text-black shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {tNav("exclusive")}
        </button>
      </div>
    );
  };

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
        <div className="mb-6 flex justify-center md:justify-end">
          <ThemeToggleButton />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full md:w-1/4">
            <div
              className={`${cardBgClass} p-6 rounded-lg shadow-md sticky top-24`}
            >
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>
                {t("filters.title")}
              </h3>

              {/* Price Filter */}
              <div className="mb-6">
                <label
                  htmlFor="priceRange"
                  className={`block font-semibold mb-2 ${textClass}`}
                >
                  {t("filters.price")}
                </label>
                <input
                  id="priceRange"
                  type="range"
                  min="150000"
                  max="1000000" // You might want to make this dynamic later
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer custom-range"
                />
                <div className={`mt-2 ${textMutedClass}`}>
                  {t("filters.upTo")}:{" "}
                  <strong>{formatCurrency(maxPrice)}</strong>
                </div>
              </div>

              <hr className="my-6 border-gray-200 dark:border-gray-700" />

              {/* Categories */}
              <div>
                <h4 className={`font-semibold mb-2 ${textClass}`}>
                  {t("filters.categories")}
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

          {/* Activities Grid */}
          <main className="w-full md:w-3/4">
            {/* [NEW] Loading and Error Handling */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                {/* [FIXED] Pass default message as an object */}
                <p className={`${textMutedClass}`}>
                  {t("empty.loading", {
                    defaultMessage: "Loading activities...",
                  })}
                </p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-red-500 text-xl">{error}</p>
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredActivities.map((act) => (
                  <Link key={act.id} href={`/activities/${act.id}`}>
                    <div
                      className={`${cardBgClass} rounded-lg shadow-lg overflow-hidden flex flex-col group transition hover:shadow-2xl hover:-translate-y-1 h-full`}
                    >
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          // [UPDATED] Use thumbnail_url
                          src={act.thumbnail_url || "/placeholder.jpg"} // Add a placeholder
                          alt={act.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <p
                          className={`text-sm font-semibold text-primary mb-2`}
                        >
                          {act.category}
                        </p>
                        <h2
                          // [UPDATED] Use name
                          className={`text-xl font-bold mb-2 ${textClass}`}
                        >
                          {act.name}
                        </h2>
                        <p
                          // [UPDATED] Use description
                          className={`mb-4 flex-grow ${textMutedClass} text-sm overflow-hidden text-ellipsis`}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {act.description}
                        </p>
                        <div
                          className={`flex justify-between items-center mt-auto pt-4 border-t ${
                            theme === "regular"
                              ? "border-gray-100"
                              : "border-gray-700"
                          }`}
                        >
                          <p
                            className={`text-lg font-bold text-primary dark:text-primary`}
                          >
                            {/* [UPDATED] Use single 'price' */}
                            {formatCurrency(act.price)}
                          </p>
                          <span
                            className={`text-sm font-semibold ${textClass} group-hover:text-primary transition`}
                          >
                            {t("buttons.details")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="lg:col-span-2 text-center py-16">
                <p className="text-gray-500 text-xl">{t("empty.message")}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}