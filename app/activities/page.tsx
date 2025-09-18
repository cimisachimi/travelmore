// app/activities/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { activities } from "@/data/activities"; // ✨ Use the new activities data

export default function ActivitiesPage() {
  const { theme } = useTheme();

  // State for filters
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Get all unique categories from the activities data
  const allCategories = useMemo(
    () => [...new Set(activities.map((act) => act.category))],
    []
  );

  // Handle category checkbox changes
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

  // Filter activities based on the current state and theme
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const currentPrice = theme === 'regular' ? act.regularPrice : act.exclusivePrice;
      const priceMatch = currentPrice <= maxPrice;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(act.category);
      return priceMatch && categoryMatch;
    });
  }, [maxPrice, selectedCategories, theme]);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Dynamic classes for theming
  const mainBgClass = theme === 'regular' ? 'bg-white' : 'bg-gray-900';
  const cardBgClass = theme === 'regular' ? 'bg-white' : 'bg-gray-800';
  const textClass = theme === 'regular' ? 'text-black' : 'text-white';
  const textMutedClass = theme === 'regular' ? 'text-gray-600' : 'text-gray-300';

  return (
    <div className={`${mainBgClass}`}>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full md:w-1/4">
            <div className={`${cardBgClass} p-6 rounded-lg shadow-md sticky top-24`}>
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>Filters</h3>

              {/* Price Filter */}
              <div className="mb-6">
                <label htmlFor="priceRange" className={`block font-semibold mb-2 ${textClass}`}>
                  Price Range
                </label>
                <input
                  id="priceRange"
                  type="range"
                  min="150000"
                  max="1000000"
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer custom-range"
                />
                <div className={`mt-2 ${textMutedClass}`}>
                  Up to: <strong>{formatCurrency(maxPrice)}</strong>
                </div>
              </div>

              <hr className="my-6 border-gray-200 dark:border-gray-700" />

              {/* Category Filter */}
              <div>
                <h4 className={`font-semibold mb-2 ${textClass}`}>Categories</h4>
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
                      <span className={`ml-3 ${textMutedClass}`}>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Activities Grid */}
          <main className="w-full md:w-3/4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => (
                  <Link
                    key={act.id}
                    href={`/activities/${act.id}`}
                  >
                    <div
                      className={`${cardBgClass} rounded-lg shadow-lg overflow-hidden flex flex-col group transition hover:shadow-xl`}
                    >
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          src={act.image}
                          alt={act.title}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h2 className={`text-xl font-bold mb-2 ${textClass}`}>{act.title}</h2>
                        <p className={`mb-4 flex-grow ${textMutedClass}`}>
                          {act.description}
                        </p>
                        <p className={`text-xl font-bold text-primary dark:text-primary mt-auto`}>
                          {formatCurrency(theme === 'regular' ? act.regularPrice : act.exclusivePrice)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="lg:col-span-2 text-center py-16">
                  <p className="text-gray-500 text-xl">
                    No activities match your filters.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}