// app/[locale]/packages/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { ChevronLeft, ChevronRight, Search, Tag, SlidersHorizontal, X } from "lucide-react"; 

// --- Interfaces ---

interface PackagePriceTier {
  min_pax: number;
  max_pax: number;
  price: number | string; 
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
  price_tiers: PackagePriceTier[];
  starting_from_price: number | string | null; 
  addons?: Addon[];
}

interface ApiResponse {
  data: PackageListItem[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

// --- Helper Functions ---

const parsePrice = (value: string | number | null | undefined): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const cleanString = value.toString().replace(/\D/g, ''); 
    const result = Number(cleanString);
    return isNaN(result) ? 0 : result;
};

const calculateDisplayPrice = (pkg: PackageListItem): number => {
  const startingPrice = parsePrice(pkg.starting_from_price);
  if (startingPrice > 0) return startingPrice;
  
  const priceTiers = pkg.price_tiers || [];
  if (priceTiers.length > 0) {
    const validTiers = priceTiers.filter((tier) => parsePrice(tier.price) > 0);
    if (validTiers.length > 0) {
        const sortedTiers = validTiers.sort((a, b) => Number(a.min_pax) - Number(b.min_pax));
        return parsePrice(sortedTiers[0].price);
    }
  }
  return 0;
};

// --- Main Component ---
export default function PackagesPage() {
  const { theme } = useTheme();
  const t = useTranslations("PackagesPage");

  const [apiPackages, setApiPackages] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State Filter
  const [searchQuery, setSearchQuery] = useState(""); 
  const [maxPrice, setMaxPrice] = useState<number>(50000000); // Default tinggi
  const [priceSliderMax, setPriceSliderMax] = useState<number>(50000000); 
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // State Pagination (Client Side)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6; 

  const fetchErrorString = useMemo(() => t("status.fetchError"), [t]);
  const loadingString = useMemo(() => t("status.loading"), [t]);
  const noCategoriesString = useMemo(() => t("status.noCategories"), [t]);
  
  // --- STRATEGI FETCHING: AGRESSIVE LOOP ---
  useEffect(() => {
    let isMounted = true; 

    const fetchAllPackages = async () => {
      setLoading(true);
      setError(null);
      
      let allData: PackageListItem[] = [];
      let page = 1;
      let hasMore = true;
      // NAIKKAN LIMIT SAFETY KE 100 HALAMAN (5000 item)
      const MAX_PAGES_SAFETY = 100; 

      try {
        while (hasMore && page <= MAX_PAGES_SAFETY) {
            console.log(`Mengambil halaman ${page}...`);
            
            const response = await api.get<ApiResponse>(`/public/packages`, {
                params: { per_page: 50, page: page }
            });
            
            if (!isMounted) return;

            const newData = response.data.data || [];
            
            // Jika API mengembalikan array kosong, berarti data habis
            if (newData.length === 0) {
                hasMore = false;
            } else {
                allData = [...allData, ...newData];
                
                // Cek Meta untuk memastikan apakah ini halaman terakhir
                const meta = response.data.meta;
                if (meta && meta.current_page >= meta.last_page) {
                    hasMore = false;
                }
                
                // Lanjut halaman berikutnya
                page++;
            }
        }

       
        const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());

        console.log("Total Paket Bersih (Unique):", uniqueData.length);
        setApiPackages(uniqueData);

        // Kalkulasi Slider
        if (uniqueData.length > 0) {
            const allPrices = uniqueData.map((p) => calculateDisplayPrice(p));
            const numericPrices = allPrices.filter((p) => p > 0);

            if (numericPrices.length > 0) {
                const calculatedMax = Math.max(...numericPrices);
                // Ceiling ke kelipatan 1 juta terdekat
                const niceMax = Math.ceil(calculatedMax / 1000000) * 1000000;
                
                console.log("Max Price Detected:", calculatedMax, "Slider set to:", niceMax);
                
                setPriceSliderMax(niceMax);
                setMaxPrice(niceMax);
            }
        }

      } catch (err: unknown) {
        console.error("Fetch error:", err);
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

    fetchAllPackages();

    return () => {
      isMounted = false;
    };
  }, [fetchErrorString]); 

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [maxPrice, selectedCategories, searchQuery]);

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

  // Logic Filtering Utama
  const filteredPackages = useMemo(() => {
    return apiPackages.filter((pkg) => {
      const realPrice = calculateDisplayPrice(pkg);
      
      const priceMatch = realPrice > 0 && realPrice <= maxPrice;
      
      const categoryMatch =
        selectedCategories.length === 0 ||
        (pkg.category && selectedCategories.includes(pkg.category));

      const searchMatch = 
        searchQuery === "" || 
        (pkg.name && pkg.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
      return priceMatch && categoryMatch && searchMatch;
    });
  }, [apiPackages, maxPrice, selectedCategories, searchQuery]);

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
  const textMutedClass = useMemo(() => (theme === "regular" ? "text-gray-500" : "text-gray-400"), [theme]);
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
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          <aside
            id="filter-sidebar"
            aria-hidden={!isFilterOpen && typeof window !== "undefined" && window.innerWidth < 768}
            className={`w-full md:w-1/4 md:min-w-[300px] transition-all duration-300 ease-in-out ${
              isFilterOpen
                ? "block max-h-screen"
                : "hidden md:block max-h-0 md:max-h-full overflow-hidden"
            }`}
          >
            <div className={`${cardBgClass} border p-6 rounded-2xl shadow-sm sticky top-24 space-y-8`}>
              
              {/* Search */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                    <Search className="w-5 h-5 text-blue-600" />
                    <h3 className={`text-lg font-bold ${textClass}`}>Search</h3>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                            theme === "regular" 
                            ? "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400" 
                            : "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        }`}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
              </div>

              <hr className={borderClass} />

              {/* Price Range */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <h3 className={`text-lg font-bold ${textClass}`}>Rentang Harga</h3>
                </div>
                
                <div className="mb-2 px-1">
                    <input
                        type="range"
                        min={0} 
                        max={priceBounds.max} 
                        step="100000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        disabled={loading || apiPackages.length === 0}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    />
                </div>
                
                <div className={`flex justify-between items-center text-sm font-medium ${textClass}`}>
                    <span>0</span>
                    <span className="text-primary font-bold">{formatCurrency(maxPrice)}</span>
                </div>
              </div>

              <hr className={borderClass} />

              {/* Category */}
              <div>
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                    <h3 className={`text-lg font-bold ${textClass}`}>Kategori</h3>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar"> 
                    {loading ? (
                      <p className={textMutedClass}>{loadingString}</p>
                    ) : allCategories.length > 0 ? (
                      allCategories.map((category) => (
                        <label key={category} className="flex items-center cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded-md transition-colors -ml-1">
                          <input
                            type="checkbox"
                            name={category}
                            checked={selectedCategories.includes(category)}
                            onChange={handleCategoryChange}
                            className="w-5 h-5 rounded border-gray-300 text-primary accent-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary cursor-pointer"
                          />
                          <span className={`ml-3 text-sm font-medium ${textMutedClass} group-hover:text-primary transition-colors`}>
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
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-6">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-controls="filter-sidebar"
                aria-expanded={isFilterOpen}
                className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold ${cardBgClass} ${textClass} shadow-sm border ${borderClass}`}
              >
                <SlidersHorizontal size={18} /> {isFilterOpen ? t("closeFilters") : t("showFilters")}
              </button>
            </div>
            
            {loading && (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className={`${textMutedClass} text-lg`}>
                   {loadingString}...
                </p>
                <p className="text-xs text-gray-400 mt-2">Sedang memuat {apiPackages.length > 0 ? apiPackages.length + "..." : "data..."}</p>
              </div>
            )}
            
            {error && !loading && (
              <div className="text-center py-16 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400 font-bold text-lg">
                  {t("status.fetchError", { defaultMessage: "Error Loading Packages" })}
                </p>
                <p className="text-red-500 dark:text-red-300 text-sm mt-2">{error}</p>
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
                          <div className={`h-full flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border ${cardBgClass}`}>
                            <div className="relative h-56 w-full overflow-hidden bg-gray-200">
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
                              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white py-1 px-3 rounded-full text-xs font-bold flex items-center gap-1">
                                <span>{pkg.duration} {t("days")}</span>
                              </div>
                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                              {pkg.category && (
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                                  {pkg.category}
                                </p>
                              )}
                              <h2 className={`text-lg font-bold mb-2 ${textClass} line-clamp-2 leading-tight group-hover:text-primary transition-colors`}>
                                {pkg.name?.split(": ")[1] || pkg.name || "Unnamed Package"}
                              </h2>
                              {pkg.location && (
                                <p className={`text-xs ${textMutedClass} mb-4 flex items-center gap-1.5`}>
                                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                   {pkg.location}
                                </p>
                              )}
                              <div className={`flex justify-between items-end mt-auto pt-4 border-t ${borderClass}`}>
                                <div>
                                  <span className={`text-xs ${textMutedClass} block mb-0.5 font-medium`}>{t("from")}</span>
                                  <p className="text-lg font-extrabold text-primary">
                                    {formatCurrency(startingPrice)}
                                  </p>
                                </div>
                                <span className={`w-9 h-9 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
                                  <ChevronRight size={18} strokeWidth={2.5} />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="lg:col-span-3 flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                      <h3 className={`text-xl font-bold ${textClass} mb-2`}>{t("noResults")}</h3>
                      <p className={textMutedClass}>We couldn&apos;t find any packages matching your filters.</p>
                      <button 
                        onClick={() => {
                            setSearchQuery("");
                            setMaxPrice(priceSliderMax);
                            setSelectedCategories([]);
                        }}
                        className="mt-4 text-primary font-semibold hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2.5 rounded-lg border transition-all ${inactivePageClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                          currentPage === page ? activePageClass : inactivePageClass
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2.5 rounded-lg border transition-all ${inactivePageClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ChevronRight size={18} />
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