"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react"; 

// --- Interfaces ---

interface PackagePriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

interface Addon {
  name: string;
  price: number;
}

interface PackageListItem {
  id: number;
  name: string; 
  location?: string | null; 
  duration: number;
  rating?: number | null;
  category?: string | null; 
  thumbnail_url: string | null; 

  // Pricing & Addons
  price_tiers: PackagePriceTier[];
  starting_from_price: number | null; 
  addons?: Addon[];
}

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

// --- Helper Functions ---

const calculateDisplayPrice = (pkg: PackageListItem): number => {
  if (pkg.starting_from_price && pkg.starting_from_price > 0) {
    return pkg.starting_from_price;
  }
  
  const priceTiers = pkg.price_tiers || [];
  if (priceTiers.length > 0) {
    const sortedTiers = [...priceTiers].sort((a, b) => a.min_pax - b.min_pax);
    const smallGroupTier = sortedTiers.find(
      (tier) => tier.min_pax <= 4 && (tier.max_pax || 4) >= 2
    );
    
    if (smallGroupTier) return smallGroupTier.price;
    
    const medianIndex = Math.floor(sortedTiers.length / 2);
    return sortedTiers[medianIndex]?.price || 0;
  }
  
  return 0;
};

// --- Helper Icon ---
const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
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
  
  const [maxPrice, setMaxPrice] = useState<number>(10000000); 
  const [priceSliderMax, setPriceSliderMax] = useState<number>(10000000); 
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6; 

  const fetchErrorString = useMemo(() => t("status.fetchError"), [t]);
  const loadingString = useMemo(() => t("status.loading"), [t]);
  const noCategoriesString = useMemo(() => t("status.noCategories"), [t]);
  const noResultsString = useMemo(() => t("noResults"), [t]);

  useEffect(() => {
    let isMounted = true; 
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ApiResponse>("/public/packages?per_page=100");
        
        if (isMounted) {
          const packagesData = response.data.data || [];
          setApiPackages(packagesData);

          if (packagesData.length > 0) {
            const allPrices = packagesData.map((p) => calculateDisplayPrice(p));
            const numericPrices = allPrices.filter((p) => p > 0);

            if (numericPrices.length > 0) {
              const calculatedMax = Math.max(...numericPrices);
              const niceMax = Math.ceil(calculatedMax / 1000000) * 1000000;
              
              setPriceSliderMax(niceMax);
              setMaxPrice((prev) => prev === 10000000 ? niceMax : prev);
            }
          }
        }
      } catch (err: unknown) {
        console.error("Failed to fetch packages:", err);
        if (isMounted) {
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
      isMounted = false;
    };
  }, [fetchErrorString]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [maxPrice, selectedCategories]);

  const priceBounds = useMemo(() => {
    return { min: 0, max: priceSliderMax };
  }, [priceSliderMax]);

  const allCategories = useMemo(
    () => [
      ...new Set(
        apiPackages.map((pkg) => pkg.category).filter((c): c is string => !!c)
      ),
    ], 
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
      const realPrice = calculateDisplayPrice(pkg);
      const priceMatch = realPrice <= maxPrice;
      
      const categoryMatch =
        selectedCategories.length === 0 ||
        (pkg.category && selectedCategories.includes(pkg.category));
        
      return priceMatch && categoryMatch;
    });
  }, [apiPackages, maxPrice, selectedCategories]);

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const currentPackages = filteredPackages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, 
    }).format(numericAmount);
  };

  
  const mainBgClass = useMemo(() => (theme === "regular" ? "bg-gray-50" : "bg-black"), [theme]);
  const cardBgClass = useMemo(() => (theme === "regular" ? "bg-white border-gray-100" : "bg-gray-900 border-gray-800"), [theme]);
  const textClass = useMemo(() => (theme === "regular" ? "text-gray-900" : "text-white"), [theme]);
  const textMutedClass = useMemo(() => (theme === "regular" ? "text-gray-600" : "text-gray-400"), [theme]);
  const headerBgClass = useMemo(() => (theme === "regular" ? "bg-white" : "bg-gray-900"), [theme]);
  const borderClass = useMemo(() => (theme === "regular" ? "border-gray-200" : "border-gray-700"), [theme]);
  
  
  const activePageClass = "bg-primary text-white border-primary";
  const inactivePageClass = theme === "regular" ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700";

  return (
    <div className={mainBgClass}>
      <header className={`py-12 ${headerBgClass} border-b ${borderClass}`}>
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
            id="filter-sidebar"
            aria-hidden={!isFilterOpen && typeof window !== "undefined" && window.innerWidth < 768}
            className={`w-full md:w-1/4 transition-all duration-300 ease-in-out ${
              isFilterOpen
                ? "block max-h-screen"
                : "hidden md:block max-h-0 md:max-h-full overflow-hidden"
            }`}
          >
            <div className={`${cardBgClass} border p-6 rounded-2xl shadow-sm sticky top-24`}>
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>
                {t("filters")}
              </h3>
              {/* Price Filter */}
              <div className="mb-6">
                <label htmlFor="priceRange" className={`block font-semibold mb-2 ${textClass}`}>
                  {t("priceRange")}
                </label>
                <input
                  id="priceRange"
                  type="range"
                  min={0} 
                  max={priceBounds.max} 
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  disabled={loading || apiPackages.length === 0}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed accent-primary"
                />
                <div className={`mt-2 text-sm ${textMutedClass}`}>
                  {t("upTo")}: <strong>{formatCurrency(maxPrice)}</strong>
                </div>
              </div>
              <hr className={`my-6 ${borderClass}`} />
              {/* Category Filter */}
              <div>
                  <h4 className={`font-semibold mb-2 ${textClass}`}>
                    {t("categories")}
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> 
                    {loading ? (
                      <p className={textMutedClass}>{loadingString}</p>
                    ) : allCategories.length > 0 ? (
                      allCategories.map((category) => (
                        <label key={category} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            name={category}
                            checked={selectedCategories.includes(category)}
                            onChange={handleCategoryChange}
                            // ✅ FIX: Menambahkan accent-primary agar warna centang hijau (primary)
                            className="h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary cursor-pointer"
                          />
                          <span className={`ml-3 text-sm ${textMutedClass} group-hover:text-primary transition-colors`}>
                            {category}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className={`text-sm ${textMutedClass}`}>
                        {noCategoriesString}
                      </p>
                    )}
                  </div>
                </div>
            </div>
          </aside>

          {/* --- Main Content Area --- */}
          <main className="w-full md:flex-1">
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-controls="filter-sidebar"
                aria-expanded={isFilterOpen}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-semibold ${cardBgClass} ${textClass} shadow-md`}
              >
                <FilterIcon /> {isFilterOpen ? t("closeFilters") : t("showFilters")}
              </button>
            </div>
            
            {loading && (
              <div className="text-center py-16">
                <p className={`${textMutedClass} text-xl`}>{loadingString}</p>
              </div>
            )}
            
            {error && !loading && (
              <div className="text-center py-16 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-200 font-semibold">
                  {t("status.fetchError", { defaultMessage: "Error Loading Packages" })}
                </p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {currentPackages.length > 0 ? (
                    currentPackages.map((pkg) => {
                      const startingPrice = calculateDisplayPrice(pkg);

                      return (
                        <Link key={pkg.id} href={`/packages/${pkg.id}`} className="block group h-full">
                        
                          <div className={`h-full flex flex-col rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${cardBgClass}`}>
                            <div className="relative h-56 w-full overflow-hidden">
                              <Image
                                src={pkg.thumbnail_url || "/placeholder.jpg"}
                                alt={pkg.name || "Holiday Package"}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 1023px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                priority={false}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).srcset = "/placeholder.jpg";
                                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                }}
                              />
                              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white py-1 px-3 rounded-full text-xs font-bold">
                                {pkg.duration} {t("days")}
                              </div>
                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                              {pkg.category && (
                                
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                                  {pkg.category}
                                </p>
                              )}

                              
                              <h2 className={`text-lg font-bold mb-2 ${textClass} line-clamp-2 leading-tight`}>
                                {pkg.name?.split(": ")[1] || pkg.name || "Unnamed Package"}
                              </h2>

                              {pkg.location && (
                                <p className={`text-xs ${textMutedClass} mb-4 flex items-center gap-1`}>
                                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                   {pkg.location}
                                </p>
                              )}

                              <div className={`flex justify-between items-end mt-auto pt-4 border-t ${borderClass}`}>
                                <div>
                                  <span className={`text-xs ${textMutedClass} block mb-0.5`}>{t("from")}</span>
                               
                                  <p className="text-lg font-extrabold text-primary dark:text-primary">
                                    {formatCurrency(startingPrice)}
                                  </p>
                                </div>
                               
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="lg:col-span-3 text-center py-16">
                      <p className="text-gray-500 dark:text-gray-400 text-xl">{noResultsString}</p>
                    </div>
                  )}
                </div>

                {/* ✅ Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md border transition-colors ${inactivePageClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                          currentPage === page ? activePageClass : inactivePageClass
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md border transition-colors ${inactivePageClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}