// app/[locale]/activities/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { 
  MapPin, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Tag,
  CheckCircle // ✅ (1) Icon baru untuk tombol mobile
} from "lucide-react";

// --- Types ---
export interface Addon {
  name: string;
  price: number;
}

interface Activity {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  location: string | null;
  price: number;
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

// --- Skeleton Component ---
const ActivitySkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="h-56 bg-gray-200 dark:bg-gray-700" />
    <div className="p-5 space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="flex justify-between pt-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export default function ActivitiesPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("activities");
  const tNav = useTranslations("Navbar");

  // --- State ---
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(2000000); 
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Fetch Data ---
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ApiResponse>("/activities");
        const data = Array.isArray(response.data) ? response.data : response.data.data;
        setAllActivities(data || []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError(t("empty.fetchError", { defaultMessage: "Could not load activities." }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [t]);

  // --- Derived Data ---
  const allCategories = useMemo(() => 
    [...new Set(allActivities.map(act => act.category).filter(Boolean) as string[])].sort(),
    [allActivities]
  );

  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      const priceMatch = act.price <= maxPrice;
      const categoryMatch = selectedCategories.length === 0 || (act.category && selectedCategories.includes(act.category));
      const searchMatch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (act.location && act.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return priceMatch && categoryMatch && searchMatch;
    });
  }, [allActivities, maxPrice, selectedCategories, searchQuery]);

  // Reset Pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, maxPrice, selectedCategories]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // window.scrollTo({ top: 0, behavior: 'smooth' }); // Opsional
  };

  // --- Handlers ---
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- Styles ---
  const isExclusive = theme === "exclusive";
  const mainBgClass = isExclusive ? "bg-black" : "bg-gray-50";
  const textClass = isExclusive ? "text-white" : "text-gray-900";
  const textMutedClass = isExclusive ? "text-gray-400" : "text-gray-500";
  const cardBgClass = isExclusive ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const accentColor = isExclusive ? "text-yellow-500" : "text-blue-600";
  
  return (
    <div className={`min-h-screen ${mainBgClass} transition-colors duration-300`}>
      {/* --- Hero Header --- */}
      <div className={`relative py-16 lg:py-24 overflow-hidden ${isExclusive ? "bg-gray-900" : "bg-white border-b border-gray-200"}`}>
        
        {/* ✅ (2) FIX: Menggunakan CSS Pattern agar tidak error "Image not found" */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className={`inline-block py-1 px-3 rounded-full text-xs font-bold tracking-wider uppercase mb-4 ${isExclusive ? "bg-yellow-900/30 text-yellow-500" : "bg-blue-100 text-primary"}`}>
            {t("subtitle", { defaultMessage: "Explore The World" })}
          </span>
          <h1 className={`text-4xl md:text-6xl font-black tracking-tight mb-6 ${textClass}`}>
            {t("title", { defaultMessage: "Unforgettable Activities" })}
          </h1>
          
          {/* Theme Toggle */}
          <div className="flex justify-center mt-8">
            <div className={`flex items-center p-1.5 rounded-full ${isExclusive ? "bg-gray-800" : "bg-gray-100"}`}>
              <button onClick={() => setTheme("regular")} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!isExclusive ? "bg-white text-primary shadow-md" : "text-gray-400 hover:text-white"}`}>
                {tNav("regular", { defaultMessage: "Regular" })}
              </button>
              <button onClick={() => setTheme("exclusive")} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${isExclusive ? "bg-yellow-500 text-black shadow-md" : "text-gray-500 hover:text-black"}`}>
                {tNav("exclusive", { defaultMessage: "Exclusive" })}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* --- Mobile Filter Trigger Button --- */}
          <button 
            onClick={() => setShowMobileFilters(true)}
            className={`lg:hidden w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold mb-4 transition-all active:scale-95 ${isExclusive ? "bg-gray-800 text-white" : "bg-white text-gray-900 shadow-sm border border-gray-200"}`}
          >
            <SlidersHorizontal size={18} />
            {t("filters.title", { defaultMessage: "Filters" })}
          </button>

          {/* --- Sidebar (Filters) --- */}
          <aside className={`
            fixed inset-0 z-50 transform transition-transform duration-300 lg:relative lg:transform-none lg:w-80 lg:block lg:inset-auto lg:z-auto
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${isExclusive ? "bg-black lg:bg-transparent" : "bg-white lg:bg-transparent"}
          `}>
            {/* ✅ (3) Layout Flex agar tombol bisa Sticky di bawah */}
            <div className={`flex flex-col h-full lg:h-auto lg:block ${isExclusive ? "lg:bg-gray-900/50" : "lg:bg-white"} lg:rounded-2xl lg:shadow-sm lg:border ${isExclusive ? "lg:border-gray-800" : "lg:border-gray-200"} lg:sticky lg:top-24`}>
              
              {/* Header Mobile (Title + Close) */}
              <div className="flex justify-between items-center p-6 lg:hidden border-b border-gray-100 dark:border-gray-800">
                <h3 className={`text-xl font-bold ${textClass}`}>{t("filters.title")}</h3>
                <button onClick={() => setShowMobileFilters(false)} className={`p-2 rounded-full ${isExclusive ? "hover:bg-gray-800" : "hover:bg-gray-100"} ${textClass}`}>
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-6 space-y-8">
                {/* Search */}
                <div>
                  <h4 className={`font-bold mb-3 flex items-center gap-2 ${textClass}`}>
                    <Search size={16} className={accentColor} />
                    Search
                  </h4>
                  <input 
                    type="text" 
                    placeholder="Search activities..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${isExclusive ? "bg-gray-800 border-gray-700 text-white focus:ring-yellow-500" : "bg-gray-50 border-gray-200 focus:ring-primary "}`}
                  />
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className={`font-bold mb-4 flex items-center gap-2 ${textClass}`}>
                    <Tag size={16} className={accentColor} />
                    {t("filters.price", { defaultMessage: "Price Range" })}
                  </h4>
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="50000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isExclusive ? "bg-gray-700 accent-yellow-500" : "bg-gray-200 accent-primary"}`}
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span className={textMutedClass}>0</span>
                    <span className={`font-bold ${textClass}`}>{formatCurrency(maxPrice)}</span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className={`font-bold mb-3 flex items-center gap-2 ${textClass}`}>
                    <SlidersHorizontal size={16} className={accentColor} />
                    {t("filters.categories", { defaultMessage: "Categories" })}
                  </h4>
                  <div className="space-y-2.5">
                    {allCategories.map((category) => (
                      <label key={category} className="flex items-center group cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${selectedCategories.includes(category) ? (isExclusive ? "bg-yellow-500 border-yellow-500" : "bg-primary border-primary") : "border-gray-400 bg-transparent"}`}>
                           {selectedCategories.includes(category) && <X size={12} className="text-white rotate-45" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                        />
                        <span className={`text-sm transition-colors ${selectedCategories.includes(category) ? `font-medium ${textClass}` : textMutedClass} group-hover:${textClass}`}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Button (Hanya muncul jika ada filter aktif) */}
                {(selectedCategories.length > 0 || maxPrice < 2000000 || searchQuery) && (
                  <button 
                    onClick={() => { setSelectedCategories([]); setMaxPrice(5000000); setSearchQuery(""); }}
                    className={`w-full py-2 text-sm font-semibold rounded-lg transition-colors ${isExclusive ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* ✅ (4) Tombol STICKY "Show Results" (Hanya di Mobile) */}
              <div className={`p-4 border-t lg:hidden mt-auto ${isExclusive ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
                    isExclusive 
                      ? "bg-yellow-500 text-black hover:bg-yellow-400" 
                      : "bg-teal-500 text-white hover:bg-teal-600" 
                  }`}
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
                    <Link key={act.id} href={`/activities/${act.id}`} className="group h-full">
                      <article className={`h-full flex flex-col rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${cardBgClass}`}>
                        {/* Image */}
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            src={act.thumbnail_url || "/placeholder.jpg"}
                            alt={act.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {act.category && (
                            <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-sm ${isExclusive ? "bg-black/60 text-white" : "bg-white/90 text-gray-900"}`}>
                              {act.category}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-grow">
                          <h2 className={`text-lg font-bold mb-2 line-clamp-2 leading-tight ${textClass} group-hover:${accentColor} transition-colors`}>
                            {act.name}
                          </h2>

                          {/* Metadata Row */}
                          <div className="flex items-center gap-4 text-xs mb-4">
                            {act.duration && (
                              <div className={`flex items-center gap-1.5 ${textMutedClass}`}>
                                <Clock size={14} className={accentColor} />
                                <span>{act.duration}</span>
                              </div>
                            )}
                            {act.location && (
                              <div className={`flex items-center gap-1.5 ${textMutedClass}`}>
                                <MapPin size={14} className={accentColor} />
                                <span className="truncate max-w-[100px]">{act.location}</span>
                              </div>
                            )}
                          </div>

                          <p className={`text-sm line-clamp-2 mb-6 ${textMutedClass} flex-grow`}>
                            {act.description || "Experience an unforgettable journey..."}
                          </p>

                          {/* Footer */}
                          <div className={`pt-4 mt-auto border-t flex items-end justify-between ${isExclusive ? "border-gray-800" : "border-gray-100"}`}>
                            <div>
                              <p className={`text-xs ${textMutedClass} mb-0.5`}>{t("filters.startingFrom", { defaultMessage: "Starting from" })}</p>
                              <p className={`text-lg font-bold ${isExclusive ? "text-yellow-500" : "text-primary"}`}>
                                {formatCurrency(act.price)}
                              </p>
                            </div>
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isExclusive ? "bg-gray-800 text-white group-hover:bg-yellow-500 group-hover:text-black" : "bg-gray-100 text-primary group-hover:bg-primary group-hover:text-white"}`}>
                              <ChevronRight size={20} />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-auto pb-8">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
                        ${currentPage === 1 
                          ? "opacity-30 cursor-not-allowed border-transparent" 
                          : isExclusive 
                            ? "border-gray-700 hover:bg-gray-800 text-white" 
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
                                ? isExclusive 
                                ? "bg-yellow-500 text-black shadow-md scale-105" 
                                : "bg-teal-400 text-white shadow-md scale-105" 
                                : isExclusive
                                ? "text-gray-400 hover:text-white hover:bg-gray-800"
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
                          : isExclusive 
                            ? "border-gray-700 hover:bg-gray-800 text-white" 
                            : "border-gray-200 hover:bg-gray-100 text-gray-600"
                        }`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center py-20 rounded-2xl border border-dashed ${isExclusive ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
                <Search size={48} className={`mx-auto mb-4 opacity-20 ${textClass}`} />
                <h3 className={`text-xl font-bold mb-2 ${textClass}`}>No activities found</h3>
                <p className={textMutedClass}>Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { setSelectedCategories([]); setMaxPrice(5000000); setSearchQuery(""); }}
                  className={`mt-6 px-6 py-2 rounded-lg font-medium text-sm transition-colors ${isExclusive ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
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