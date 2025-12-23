"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { 
  MapPin, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Tag,
  CheckCircle 
} from "lucide-react";

// --- Types ---
export interface Addon {
  name: string;
  price: number;
}

interface Activity {
  id: number;
  slug: string; // ✅ ADDED: Slug field for dynamic routing
  name: string;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number | string;
  duration: string | null; 
  addons?: Addon[];
  thumbnail_url: string | null;
}

interface ApiResponse {
  data: Activity[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

// --- Helper Functions ---
const parsePrice = (value: string | number | null | undefined): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const directParse = Number(value);
    if (!isNaN(directParse)) return directParse;
    const cleanString = value.toString().replace(/\D/g, ''); 
    const result = Number(cleanString);
    return isNaN(result) ? 0 : result;
};

// --- Skeleton Component (Mode Regular) ---
const ActivitySkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-56 bg-gray-200" />
    <div className="p-5 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="flex justify-between pt-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export default function ActivitiesPage() {
  const t = useTranslations("activities");

  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [priceSliderMax, setPriceSliderMax] = useState<number>(5000000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Fetch Data Logic ---
  useEffect(() => {
    let isMounted = true; 

    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      let allData: Activity[] = [];
      let page = 1;
      let hasMore = true;
      const MAX_PAGES_SAFETY = 50;

      try {
        while (hasMore && page <= MAX_PAGES_SAFETY) {
            const response = await api.get<ApiResponse>("/activities", {
                params: { per_page: 50, page: page }
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
                } else if (!meta && newData.length < 10) {
                    hasMore = false;
                }
                page++;
            }
        }

        const uniqueActivities = Array.from(new Map(allData.map(item => [item.id, item])).values());
        setAllActivities(uniqueActivities);

        if (uniqueActivities.length > 0) {
            const prices = uniqueActivities.map(act => parsePrice(act.price));
            const highestPrice = Math.max(...prices);
            if (highestPrice > 0) {
                const niceMax = Math.ceil(highestPrice / 500000) * 500000;
                setPriceSliderMax(niceMax);
                setMaxPrice(niceMax);
            }
        }

      } catch (err: unknown) {
        if (isMounted) {
             const axiosError = err as AxiosError;
             setError(axiosError.message || t("empty.fetchError", { defaultMessage: "Could not load activities." }));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivities();
    return () => { isMounted = false; };
  }, [t]);

  // --- Derived Data ---
  const allCategories = useMemo(() => 
    [...new Set(allActivities.map(act => act.category).filter(Boolean) as string[])].sort(),
    [allActivities]
  );

  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      const actPrice = parsePrice(act.price);
      const priceMatch = actPrice <= maxPrice;
      const categoryMatch = selectedCategories.length === 0 || (act.category && selectedCategories.includes(act.category));
      const searchMatch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (act.location && act.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return priceMatch && categoryMatch && searchMatch;
    });
  }, [allActivities, maxPrice, selectedCategories, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, maxPrice, selectedCategories]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const formatCurrency = (amount: number | string) => {
    const num = parsePrice(amount);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

   
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      
      {/* --- Hero Header --- */}
      <div className="relative py-16 lg:py-24 overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full text-xs font-bold tracking-wider uppercase mb-4 bg-blue-100 text-primary">
            {t("subtitle", { defaultMessage: "Explore The World" })}
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-gray-900">
            {t("title", { defaultMessage: "Unforgettable Activities" })}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
           
          {/* --- Mobile Filter Trigger Button --- */}
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold mb-4 transition-all active:scale-95 bg-white text-gray-900 shadow-sm border border-gray-200"
          >
            <SlidersHorizontal size={18} />
            {t("filters.title", { defaultMessage: "Filters" })}
          </button>

          {/* --- Sidebar (Filters) --- */}
          <aside className={`
            fixed inset-0 z-50 transform transition-transform duration-300 lg:relative lg:transform-none lg:w-80 lg:block lg:inset-auto lg:z-auto
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            bg-white lg:bg-transparent
          `}>
            <div className="flex flex-col h-full lg:h-auto lg:block lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-200 lg:sticky lg:top-24">
              
              <div className="flex justify-between items-center p-6 lg:hidden border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">{t("filters.title")}</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-900">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-6 space-y-8">
                <div>
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                    <Search size={16} className="text-primary" />
                    Search
                  </h4>
                  <input 
                    type="text" 
                    placeholder="Search activities..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all bg-gray-50 border-gray-200 focus:ring-primary"
                  />
                </div>

                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <Tag size={16} className="text-primary" />
                    {t("filters.price", { defaultMessage: "Price Range" })}
                  </h4>
                  <input
                    type="range"
                    min="0"
                    max={priceSliderMax}
                    step={priceSliderMax / 100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-500">0</span>
                    <span className="font-bold text-gray-900">{formatCurrency(maxPrice)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                    <SlidersHorizontal size={16} className="text-primary" />
                    {t("filters.categories", { defaultMessage: "Categories" })}
                  </h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                    {allCategories.map((category) => (
                      <label key={category} className="flex items-center group cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${selectedCategories.includes(category) ? "bg-primary border-primary" : "border-gray-400 bg-transparent"}`}>
                           {selectedCategories.includes(category) && <X size={12} className="text-white rotate-45" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                        />
                        <span className={`text-sm transition-colors ${selectedCategories.includes(category) ? "font-medium text-gray-900" : "text-gray-500"} group-hover:text-gray-900`}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {(selectedCategories.length > 0 || maxPrice < priceSliderMax || searchQuery) && (
                  <button 
                    onClick={() => { setSelectedCategories([]); setMaxPrice(priceSliderMax); setSearchQuery(""); }}
                    className="w-full py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="p-4 border-t lg:hidden mt-auto bg-white border-gray-100">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 bg-teal-500 text-white hover:bg-teal-600"
                >
                  <CheckCircle size={20} />
                  Show {filteredActivities.length} Results
                </button>
              </div>

            </div>
          </aside>

          {/* --- Main Content --- */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <ActivitySkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-red-500 font-medium mb-2">{error}</p>
                <button onClick={() => window.location.reload()} className="text-sm underline text-gray-500">Try Again</button>
              </div>
            ) : filteredActivities.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {currentActivities.map((act) => (
                    /* ✅ CHANGED: Now using act.slug instead of act.id for SEO/Dynamic routing */
                    <Link key={act.id} href={`/activities/${act.slug}`} className="group h-full">
                      <article className="h-full flex flex-col rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-white border-gray-100">
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            src={act.thumbnail_url || "/placeholder.jpg"}
                            alt={act.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {act.category && (
                            <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-sm bg-white/90 text-gray-900">
                              {act.category}
                            </span>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                          <h2 className="text-lg font-bold mb-2 line-clamp-2 leading-tight text-gray-900 group-hover:text-primary transition-colors">
                            {act.name}
                          </h2>

                          <div className="flex items-center gap-4 text-xs mb-4">
                            {act.duration && (
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Clock size={14} className="text-primary" />
                                <span>{act.duration}</span>
                              </div>
                            )}
                            {act.location && (
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <MapPin size={14} className="text-primary" />
                                <span className="truncate max-w-[100px]">{act.location}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-sm line-clamp-2 mb-6 text-gray-500 flex-grow">
                            {act.description || "Experience an unforgettable journey..."}
                          </p>

                          <div className="pt-4 mt-auto border-t flex items-end justify-between border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">{t("filters.startingFrom", { defaultMessage: "Starting from" })}</p>
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency(act.price)}
                              </p>
                            </div>
                            <span className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-gray-100 text-primary group-hover:bg-primary group-hover:text-white">
                              <ChevronRight size={20} />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-auto pb-8">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
                        ${currentPage === 1 
                          ? "opacity-30 cursor-not-allowed border-transparent" 
                          : "border-gray-200 hover:bg-gray-100 text-gray-600"
                        }`}
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                            ${currentPage === number
                                ? "bg-teal-400 text-white shadow-md scale-105" 
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                        >
                            {number}
                        </button>
                        ))}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
                        ${currentPage === totalPages 
                          ? "opacity-30 cursor-not-allowed border-transparent" 
                          : "border-gray-200 hover:bg-gray-100 text-gray-600"
                        }`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                <Search size={48} className="mx-auto mb-4 opacity-20 text-gray-900" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">No activities found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { setSelectedCategories([]); setMaxPrice(priceSliderMax); setSearchQuery(""); }}
                  className="mt-6 px-6 py-2 rounded-lg font-medium text-sm transition-colors bg-black text-white hover:bg-gray-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}