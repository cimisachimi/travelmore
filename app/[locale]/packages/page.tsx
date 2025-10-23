"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { AxiosError } from "axios"; // Import AxiosError for better error handling

// --- Interfaces ---
// Interface matching the expected API response data
interface PackageListItem {
  id: number;
  name: string; // From translation
  location?: string | null; // From translation
  duration: number;
  regularPrice?: number; // From accessor (price_regular) - Use correct keys
  exclusivePrice: number; // From accessor (price_exclusive) - Use correct keys
  rating?: number | null;
  category?: string | null; // From translation
  thumbnail_url: string | null; // From accessor
  // images_url is likely available but not strictly needed for this list view
}

// Interface for the overall paginated API response
interface ApiResponse {
  data: PackageListItem[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// --- Helper Icon ---
const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true" // Add aria-hidden for decorative icons
  >
    <path
      fillRule="evenodd"
      d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.59L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Main Component ---
export default function PackagesPage() {
  const { theme } = useTheme();
  const t = useTranslations("PackagesPage");

  const [apiPackages, setApiPackages] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Initialize maxPrice based on potential maximum after fetch
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priceSliderMax, setPriceSliderMax] = useState<number>(10000000); // Separate state for slider max
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Memoize translation strings
  const fetchErrorString = useMemo(() => t("status.fetchError"), [t]);
  const loadingString = useMemo(() => t('status.loading'), [t]);
  const noCategoriesString = useMemo(() => t('status.noCategories'), [t]);
  const noResultsString = useMemo(() => t("noResults"), [t]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ApiResponse>('/public/packages');
        if (isMounted) {
          const packagesData = response.data.data || [];
          setApiPackages(packagesData);

          if (packagesData.length > 0) {
            // Use exclusivePrice which should always exist based on backend logic
            const allPrices = packagesData.map((p) => p.exclusivePrice);
            const numericPrices = allPrices.filter(p => typeof p === 'number' && !isNaN(p));

            if (numericPrices.length > 0) {
              const calculatedMax = Math.max(...numericPrices);
              // Set initial filter max price and slider max based on data
              setPriceSliderMax(calculatedMax);
              setMaxPrice(calculatedMax);
            } else {
              setPriceSliderMax(10000000); // Default if no valid prices
              setMaxPrice(10000000);
            }
          } else {
            setPriceSliderMax(10000000); // Default if no packages
            setMaxPrice(10000000);
          }
        }
      } catch (err: unknown) {
        console.error("Failed to fetch packages:", err);
        if (isMounted) {
          // Provide a more specific error message if possible
          const axiosError = err as AxiosError;
          setError(axiosError.message || fetchErrorString);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPackages();

    return () => {
      isMounted = false; // Cleanup function to set flag on unmount
    }
  }, [fetchErrorString]); // Only refetch if translation changes (rare)

  // Calculate price bounds for the slider's min/max attributes
  const priceBounds = useMemo(() => {
    if (apiPackages.length === 0) return { min: 0, max: priceSliderMax }; // Use slider max
    const allPrices = apiPackages.map((p) => p.exclusivePrice);
    const numericPrices = allPrices.filter(p => typeof p === 'number' && !isNaN(p));
    if (numericPrices.length === 0) return { min: 0, max: priceSliderMax };
    // Set min to 0 or the actual min, max uses the pre-calculated slider max
    return { min: Math.min(0, ...numericPrices), max: priceSliderMax };
  }, [apiPackages, priceSliderMax]);

  const allCategories = useMemo(
    () => [...new Set(apiPackages.map((pkg) => pkg.category).filter((c): c is string => !!c))], // Ensure categories are strings
    [apiPackages]
  );

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const category = event.target.name;
    setSelectedCategories((prev) =>
      event.target.checked
        ? [...prev, category]
        : prev.filter((c) => c !== category)
    );
  };

  const filteredPackages = useMemo(() => {
    return apiPackages.filter((pkg) => {
      // Filter by exclusive price which should always be present
      const priceMatch = pkg.exclusivePrice <= maxPrice;
      const categoryMatch =
        selectedCategories.length === 0 ||
        (pkg.category && selectedCategories.includes(pkg.category));
      return priceMatch && categoryMatch;
    });
  }, [apiPackages, maxPrice, selectedCategories]);

  // Ensure formatCurrency handles potential null/undefined and uses exclusivePrice
  const formatCurrency = (amount: number | null | undefined): string => {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // Ensure no decimals for IDR
    }).format(numericAmount);
  }

  // Memoize CSS classes
  const mainBgClass = useMemo(() => theme === "regular" ? "bg-gray-50" : "bg-black", [theme]);
  const cardBgClass = useMemo(() => theme === "regular" ? "bg-white" : "bg-gray-800", [theme]);
  const textClass = useMemo(() => theme === "regular" ? "text-gray-900" : "text-white", [theme]);
  const textMutedClass = useMemo(() => theme === "regular" ? "text-gray-600" : "text-gray-300", [theme]);
  const headerBgClass = useMemo(() => theme === "regular" ? "bg-white" : "bg-gray-900", [theme]);
  const borderClass = useMemo(() => theme === "regular" ? "border-gray-200" : "border-gray-700", [theme]);


  return (
    <div className={mainBgClass}>
      <header
        className={`py-12 ${headerBgClass} border-b ${borderClass}`}
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
          {/* --- Filters Sidebar --- */}
          <aside
            // Use aria-controls and aria-expanded for accessibility
            id="filter-sidebar"
            aria-hidden={!isFilterOpen && typeof window !== 'undefined' && window.innerWidth < 768}
            className={`w-full md:w-1/4 transition-all duration-300 ease-in-out ${isFilterOpen ? "block max-h-screen" : "hidden md:block max-h-0 md:max-h-full overflow-hidden"}`}
          >
            <div
              className={`${cardBgClass} p-6 rounded-lg shadow-md sticky top-24`} // Keep sticky for desktop
            >
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>
                {t("filters")}
              </h3>
              {/* Price Filter */}
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
                  max={priceBounds.max} // Use calculated slider max
                  step="100000" // Adjust step if needed
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  disabled={loading || apiPackages.length === 0} // Disable if no packages
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-valuemin={priceBounds.min}
                  aria-valuemax={priceBounds.max}
                  aria-valuenow={maxPrice}
                  aria-label={t("priceRange")}
                />
                <div className={`mt-2 text-sm ${textMutedClass}`}> {/* Smaller text */}
                  {t("upTo")}: <strong>{formatCurrency(maxPrice)}</strong>
                </div>
              </div>
              <hr className={`my-6 ${borderClass}`} />
              {/* Category Filter */}
              <div>
                <h4 className={`font-semibold mb-2 ${textClass}`}>
                  {t("categories")}
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Added scroll */}
                  {loading ? (
                    <p className={textMutedClass}>{loadingString}</p>
                  ) : allCategories.length > 0 ? (
                    allCategories.map((category) => (
                      <label key={category} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={category}
                          checked={selectedCategories.includes(category)}
                          onChange={handleCategoryChange}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-600 dark:bg-gray-700 dark:checked:bg-blue-600 dark:focus:ring-offset-gray-800"
                        />
                        <span className={`ml-3 text-sm ${textMutedClass}`}>{category}</span> {/* Smaller text */}
                      </label>
                    ))
                  ) : (
                    <p className={`text-sm ${textMutedClass}`}>{noCategoriesString}</p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* --- Main Content Area --- */}
          <main className="w-full md:flex-1"> {/* Use flex-1 to take remaining space */}
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-controls="filter-sidebar"
                aria-expanded={isFilterOpen}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-semibold ${cardBgClass} ${textClass} shadow-md`}
              >
                <FilterIcon />{" "}
                {isFilterOpen ? t("closeFilters") : t("showFilters")}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <p className={`${textMutedClass} text-xl`}>{loadingString}</p>
                {/* Optional: Add a spinner */}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-200 font-semibold">{t('status.fetchErrorTitle', { defaultMessage: "Error Loading Packages" })}</p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Content Display */}
            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <Link key={pkg.id} href={`/packages/${pkg.id}`} className="block group h-full"> {/* Make Link block and group */}
                      <div
                        className={`${cardBgClass} rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition duration-300 ease-in-out group-hover:shadow-2xl group-hover:-translate-y-1`}
                      >
                        <div className="relative h-56 w-full overflow-hidden">
                          {/* Add Next.js Image Optimization */}
                          <Image
                            // Ensure thumbnail_url is used, fallback added
                            src={pkg.thumbnail_url || "/placeholder.jpg"}
                            alt={pkg.name || 'Holiday Package'} // Fallback alt text
                            fill // Use fill for responsive sizing
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1023px) 100vw, 50vw" // Define sizes for optimization
                            priority={filteredPackages.indexOf(pkg) < 4} // Prioritize loading first few images
                            onError={(e) => {
                              // Optional: Handle image load error specifically
                              (e.target as HTMLImageElement).srcset = '/placeholder.jpg'; // Set fallback on error
                              (e.target as HTMLImageElement).src = '/placeholder.jpg';
                            }}
                          />
                          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white py-1 px-3 rounded-full text-sm font-bold backdrop-blur-sm">
                            {pkg.duration} {t("days")}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          {/* Display Category if it exists */}
                          {pkg.category && (
                            <p className={`text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1`}> {/* Style adjustments */}
                              {pkg.category}
                            </p>
                          )}
                          <h2 className={`text-xl font-bold mb-2 ${textClass} line-clamp-2`}> {/* Limit title lines */}
                            {/* Basic title cleanup (remove prefix if present) */}
                            {pkg.name?.split(": ")[1] || pkg.name || 'Unnamed Package'}
                          </h2>
                          {/* Optional: Add Location */}
                          {pkg.location && (
                            <p className={`text-sm ${textMutedClass} mb-3`}>{pkg.location}</p>
                          )}
                          <div
                            className={`flex justify-between items-center mt-auto pt-4 border-t ${borderClass}`}
                          >
                            <p
                              className={`text-lg font-bold text-blue-600 dark:text-blue-400`}
                            >
                              {formatCurrency(pkg.exclusivePrice)}
                            </p>
                            <span
                              className={`text-sm font-semibold ${textClass} group-hover:text-blue-500 transition-colors duration-300`} // Smoother transition
                            >
                              {t("viewDetails")} →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  // No Results Message
                  <div className="lg:col-span-2 text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400 text-xl">{noResultsString}</p>
                  </div>
                )}
              </div>
            )}
            {/* Optional: Add Pagination if API supports it */}
          </main>
        </div>
      </div>
    </div>
  );
}