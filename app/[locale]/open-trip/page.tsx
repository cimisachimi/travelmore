"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api"; 
import { CalendarClock } from "lucide-react";

// ✅ DEFINED LOCALLY: Matches your Laravel API Response
interface OpenTrip {
  id: number;
  name: string;
  category?: string;
  location?: string;
  duration?: number;
  rating?: number;
  starting_from_price?: number; // Matches $appends in OpenTrip.php
  thumbnail_url?: string;       // Matches $appends in OpenTrip.php
  is_active?: boolean;
}

// Icon Filter (Optional for mobile)
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.59L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
  </svg>
);

export default function OpenTripPage() {
  const { theme } = useTheme();
  const t = useTranslations("OpenTripPage"); 

  const [apiPackages, setApiPackages] = useState<OpenTrip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priceSliderMax, setPriceSliderMax] = useState<number>(10000000); 
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 
  const [isFilterOpen, setIsFilterOpen] = useState(false); 

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

  useEffect(() => {
    const fetchOpenTrips = async () => {
      setLoading(true);
      try {
        const response = await api.get('/open-trips'); 
        
        // Handle both simple array and Laravel Paginated response (data.data)
        const data: OpenTrip[] = Array.isArray(response.data) 
            ? response.data 
            : (response.data.data || []);

        // Filter only active trips if the backend sends everything
        const activeTrips = data.filter(trip => trip.is_active !== false); 

        setApiPackages(activeTrips);

        // Initialize Price Slider based on highest price found
        if (activeTrips.length > 0) {
          const allPrices = activeTrips
            .map((p) => p.starting_from_price)
            .filter((p): p is number => typeof p === 'number');
            
          if (allPrices.length > 0) {
            const max = Math.max(...allPrices);
            setPriceSliderMax(max);
            setMaxPrice(max);
          }
        }
      } catch (error) {
        console.error("Failed to fetch open trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenTrips();
  }, []);

  const allCategories = useMemo(() => {
    const categories = apiPackages.map(p => p.category).filter((c): c is string => !!c);
    return [...new Set(categories)]; 
  }, [apiPackages]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(amount) || 0);
  };

  const filteredPackages = useMemo(() => {
    return apiPackages.filter((pkg) => {
      const matchPrice = (pkg.starting_from_price || 0) <= maxPrice;
      const matchCategory = selectedCategories.length === 0 || (pkg.category && selectedCategories.includes(pkg.category));
      return matchPrice && matchCategory;
    });
  }, [apiPackages, maxPrice, selectedCategories]);

  return (
    <div className={mainBgClass}>
      {/* Header */}
      <header className={`py-12 ${theme === "regular" ? "bg-white" : "bg-gray-900"} border-b ${borderClass}`}>
        <div className="container mx-auto px-4 text-center">
          <h1 className={`text-4xl md:text-5xl font-extrabold ${textClass}`}>
            {t("title")}
          </h1>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${textMutedClass}`}>
            {t("subtitle")}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-12 min-h-[60vh]">
        
        {/* --- STATE 1: LOADING --- */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className={`${textMutedClass} animate-pulse text-lg`}>{t("status.loading")}</p>
           </div>
        ) : apiPackages.length === 0 ? (
          
          /* --- STATE 2: EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center text-center py-20 max-w-3xl mx-auto">
             <div className={`p-6 rounded-full ${theme === "regular" ? "bg-blue-50" : "bg-blue-900/20"} mb-6`}>
                <CalendarClock className="w-20 h-20 text-primary" />
             </div>
             
             <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${textClass}`}>
               {t("comingSoon.title")} 
             </h2>
             
             <p className={`text-lg md:text-xl leading-relaxed ${textMutedClass}`}>
               {t("comingSoon.description")}
             </p>

             <div className="mt-8">
               <Link 
                 href="/contact" 
                 className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
               >
                 {t("comingSoon.cta")}
               </Link>
             </div>
          </div>

        ) : (

          /* --- STATE 3: DATA LISTING --- */
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className={`w-full lg:w-1/4`}>
              <button 
                className={`lg:hidden w-full flex items-center justify-center gap-2 p-3 rounded-lg mb-4 font-bold shadow-md ${cardBgClass} ${textClass}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FilterIcon /> {isFilterOpen ? t("closeFilters") : t("showFilters")}
              </button>

              <div className={`
                ${cardBgClass} p-6 rounded-lg shadow-md lg:sticky lg:top-24 border ${borderClass}
                ${isFilterOpen ? "block" : "hidden lg:block"} 
              `}>
                <h3 className={`text-xl font-bold mb-6 ${textClass}`}>{t("filters")}</h3>

                {/* Price Filter */}
                <div className="mb-8">
                  <label className={`block font-semibold mb-3 ${textClass}`}>{t("priceRange")}</label>
                  <input
                      type="range"
                      min={0}
                      max={priceSliderMax}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className={`mt-2 text-sm ${textMutedClass}`}>
                      {t("upTo")}: <strong>{formatCurrency(maxPrice)}</strong>
                  </div>
                </div>

                <hr className={`my-6 ${borderClass}`} />

                {/* Category Filter */}
                <div>
                  <label className={`block font-semibold mb-3 ${textClass}`}>{t("categories")}</label>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {allCategories.map((cat) => (
                      <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => handleCategoryChange(cat)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white checked:border-primary checked:bg-primary transition-all"
                          />
                          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span className={`${textMutedClass} group-hover:${textClass} transition-colors capitalize`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                    {allCategories.length === 0 && <p className={`text-sm ${textMutedClass}`}>No categories found.</p>}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Grid */}
            <main className="w-full lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPackages.map((pkg) => (
                      <Link key={pkg.id} href={`/open-trip/${pkg.id}`} className="block group h-full">
                          <div className={`${cardBgClass} rounded-2xl shadow-lg border ${borderClass} overflow-hidden flex flex-col h-full hover:shadow-2xl transition duration-300 transform hover:-translate-y-1`}>
                              <div className="relative h-56 w-full overflow-hidden">
                                  <Image
                                      src={pkg.thumbnail_url?.startsWith('http') ? pkg.thumbnail_url : (pkg.thumbnail_url ? `/storage/${pkg.thumbnail_url}` : "/placeholder.jpg")}
                                      alt={pkg.name}
                                      fill
                                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                                      unoptimized={pkg.thumbnail_url?.startsWith('http')}
                                  />
                                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white py-1 px-3 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                      <span>⏳ {pkg.duration} {t("days")}</span>
                                  </div>
                                  {pkg.category && (
                                      <div className="absolute bottom-3 left-3 bg-primary text-white py-1 px-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md">
                                          {pkg.category}
                                      </div>
                                  )}
                              </div>

                              <div className="p-5 flex flex-col flex-grow">
                                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
                                    <span className="text-primary">OPEN TRIP</span> • <span>📍 {pkg.location || "Indonesia"}</span>
                                  </div>

                                  <h2 className={`text-xl font-bold mb-3 ${textClass} line-clamp-2 group-hover:text-primary transition-colors`}>
                                    {pkg.name}
                                  </h2>
                                  
                                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                                      <div>
                                          <span className={`text-xs ${textMutedClass} block mb-1`}>{t("from")}</span>
                                          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                                              {formatCurrency(pkg.starting_from_price)}
                                          </p>
                                      </div>
                                      <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                          {t("viewDetails")}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
              
              {filteredPackages.length === 0 && (
                    <div className={`text-center py-20 border-2 border-dashed ${borderClass} rounded-xl`}>
                        <p className={`text-lg ${textMutedClass}`}>{t("noResults")}</p>
                        <button 
                          onClick={() => {
                            setMaxPrice(priceSliderMax);
                            setSelectedCategories([]);
                          }}
                          className="mt-4 text-primary font-bold hover:underline"
                        >
                          Reset Filters
                        </button>
                    </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}