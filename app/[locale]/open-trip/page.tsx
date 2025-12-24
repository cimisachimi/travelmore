"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api"; 
import { CalendarClock, Filter, X } from "lucide-react";

interface OpenTrip {
  id: number;
  slug: string; // ✅ Added slug field
  name: string;
  category?: string;
  location?: string;
  duration?: number;
  rating?: number;
  starting_from_price?: number | string; 
  thumbnail_url?: string;       
  is_active?: boolean;
}

interface ApiResponse {
  data: OpenTrip[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path || path === 'null') return "/placeholder.jpg";
  if (path.startsWith("http")) return path; 
  if (path.startsWith("/")) return path;
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${baseUrl}/storage/${cleanPath}`;
};

const parsePrice = (value: string | number | null | undefined): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const directParse = Number(value);
    if (!isNaN(directParse)) return directParse;
    const cleanString = value.toString().replace(/\D/g, ''); 
    const result = Number(cleanString);
    return isNaN(result) ? 0 : result;
};

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
  
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [priceSliderMax, setPriceSliderMax] = useState<number>(5000000); 
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 
  const [isFilterOpen, setIsFilterOpen] = useState(false); 

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

  useEffect(() => {
    let isMounted = true;
    const fetchOpenTrips = async () => {
      setLoading(true);
      let allData: OpenTrip[] = [];
      let page = 1;
      let hasMore = true;
      const MAX_PAGES_SAFETY = 50; 
      const PER_PAGE = 50;

      try {
        while (hasMore && page <= MAX_PAGES_SAFETY) {
            const response = await api.get<ApiResponse>('/open-trips', {
                params: { per_page: PER_PAGE, page: page }
            });
            if (!isMounted) return;
            const responseData = Array.isArray(response.data) ? response.data : response.data.data;
            const newData = responseData || [];
            if (newData.length === 0) {
                hasMore = false;
            } else {
                allData = [...allData, ...newData];
                const meta = !Array.isArray(response.data) ? response.data.meta : null;
                if (meta && meta.current_page >= meta.last_page) {
                    hasMore = false;
                } else if (!meta && newData.length < PER_PAGE) {
                    hasMore = false;
                }
                page++;
            }
        }
        const activeTrips = allData.filter(trip => trip.is_active !== false);
        const uniqueTrips = Array.from(new Map(activeTrips.map(item => [item.id, item])).values());
        setApiPackages(uniqueTrips);
        if (uniqueTrips.length > 0) {
          const prices = uniqueTrips.map((p) => parsePrice(p.starting_from_price));
          const highestPrice = Math.max(...prices);
          if (highestPrice > 0) {
            const niceMax = Math.ceil(highestPrice / 500000) * 500000;
            setPriceSliderMax(niceMax);
            setMaxPrice(niceMax);
          }
        }
      } catch (error) {
        console.error("Failed to fetch open trips:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOpenTrips();
    return () => { isMounted = false; };
  }, []);

  const allCategories = useMemo(() => {
    const categories = apiPackages.map(p => p.category).filter((c): c is string => !!c);
    return [...new Set(categories)]; 
  }, [apiPackages]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = parsePrice(amount);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const filteredPackages = useMemo(() => {
    return apiPackages.filter((pkg) => {
      const price = parsePrice(pkg.starting_from_price);
      const matchPrice = price <= maxPrice;
      const matchCategory = selectedCategories.length === 0 || (pkg.category && selectedCategories.includes(pkg.category));
      return matchPrice && matchCategory;
    });
  }, [apiPackages, maxPrice, selectedCategories]);

  return (
    <div className={mainBgClass}>
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
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className={`${textMutedClass} animate-pulse text-lg`}>{t("status.loading")}</p>
           </div>
        ) : apiPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 max-w-3xl mx-auto">
             <div className={`p-6 rounded-full ${theme === "regular" ? "bg-blue-50" : "bg-blue-900/20"} mb-6`}>
                <CalendarClock className="w-20 h-20 text-primary" />
             </div>
             <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${textClass}`}>{t("comingSoon.title")}</h2>
             <p className={`text-lg md:text-xl leading-relaxed ${textMutedClass}`}>{t("comingSoon.description")}</p>
             <div className="mt-8">
               <Link href="/contact" className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
                 {t("comingSoon.cta")}
               </Link>
             </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className={`w-full lg:w-1/4`}>
              <button 
                className={`lg:hidden w-full flex items-center justify-center gap-2 p-3 rounded-lg mb-4 font-bold shadow-md ${cardBgClass} ${textClass}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FilterIcon /> {isFilterOpen ? t("closeFilters") : t("showFilters")}
              </button>
              <div className={`${cardBgClass} p-6 rounded-lg shadow-md lg:sticky lg:top-24 border ${borderClass} ${isFilterOpen ? "block" : "hidden lg:block"}`}>
                <div className="flex justify-between items-center mb-6 lg:mb-4">
                      <h3 className={`text-xl font-bold ${textClass}`}>{t("filters")}</h3>
                      <button onClick={() => setIsFilterOpen(false)} className="lg:hidden">
                         <X className={textClass} />
                      </button>
                </div>
                <div className="mb-8">
                  <label className={`block font-semibold mb-3 ${textClass}`}>{t("priceRange")}</label>
                  <input type="range" min={0} max={priceSliderMax} step={priceSliderMax / 100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"/>
                  <div className={`mt-2 text-sm ${textMutedClass}`}>{t("upTo")}: <strong>{formatCurrency(maxPrice)}</strong></div>
                </div>
                <hr className={`my-6 ${borderClass}`} />
                <div>
                  <label className={`block font-semibold mb-3 ${textClass}`}>{t("categories")}</label>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {allCategories.map((cat) => (
                      <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryChange(cat)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white checked:border-primary checked:bg-primary transition-all"/>
                          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className={`${textMutedClass} group-hover:${textClass} transition-colors capitalize`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setMaxPrice(priceSliderMax); setSelectedCategories([]); }} className="w-full mt-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Reset Filters</button>
              </div>
            </aside>
            <main className="w-full lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPackages.map((pkg) => (
                      /* ✅ Updated: Using pkg.slug from backend */
                      <Link key={pkg.id} href={`/open-trip/${pkg.slug}`} className="block group h-full">
                          <div className={`${cardBgClass} rounded-2xl shadow-lg border ${borderClass} overflow-hidden flex flex-col h-full hover:shadow-2xl transition duration-300 transform hover:-translate-y-1`}>
                              <div className="relative h-56 w-full overflow-hidden">
                                  <Image 
                                      src={getImageUrl(pkg.thumbnail_url)} 
                                      alt={pkg.name} 
                                      fill 
                                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                      unoptimized={getImageUrl(pkg.thumbnail_url).startsWith('http')}
                                  />
                                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white py-1 px-3 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"><span>⏳ {pkg.duration} {t("days")}</span></div>
                                  {pkg.category && <div className="absolute bottom-3 left-3 bg-primary text-white py-1 px-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md">{pkg.category}</div>}
                              </div>
                              <div className="p-5 flex flex-col flex-grow">
                                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide"><span className="text-primary">OPEN TRIP</span> • <span>📍 {pkg.location || "Indonesia"}</span></div>
                                  <h2 className={`text-xl font-bold mb-3 ${textClass} line-clamp-2 group-hover:text-primary transition-colors`}>{pkg.name}</h2>
                                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                                      <div><span className={`text-xs ${textMutedClass} block mb-1`}>{t("from")}</span><p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">{formatCurrency(pkg.starting_from_price)}</p></div>
                                      <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold group-hover:bg-primary group-hover:text-white transition-all">{t("viewDetails")}</button>
                                  </div>
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}