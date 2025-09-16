"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { packages } from "@/data/packages"; // Menggunakan data 'packages' yang baru

export default function PackagesPage() {
  const { theme } = useTheme();

  // State for filters
  const [maxPrice, setMaxPrice] = useState<number>(6000000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Memoize category list from the new data structure
  const allCategories = useMemo(
    () => [...new Set(packages.map((pkg) => pkg.category))],
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

  // Filter packages based on current state and theme
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const currentPrice = theme === 'regular' ? pkg.regularPrice : pkg.exclusivePrice;
      const priceMatch = currentPrice <= maxPrice;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(pkg.category);
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

  // Menentukan warna latar belakang berdasarkan tema yang aktif
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
                  min="1000000"
                  max="6000000"
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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

          {/* Packages Grid */}
          <main className="w-full md:w-3/4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={`/packages/${pkg.id}`}
                  >
                    <div
                      className={`${cardBgClass} rounded-lg shadow-lg overflow-hidden flex flex-col group transition hover:shadow-xl`}
                    >
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          src={pkg.image}
                          alt={pkg.title}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h2 className={`text-xl font-bold mb-2 ${textClass}`}>{pkg.title}</h2>
                        <p className={`mb-4 flex-grow ${textMutedClass}`}>
                          {pkg.description}
                        </p>
                        <p className={`text-xl font-bold text-blue-600 mt-auto`}>
                          {formatCurrency(theme === 'regular' ? pkg.regularPrice : pkg.exclusivePrice)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="lg:col-span-2 text-center py-16">
                  <p className="text-gray-500 text-xl">
                    No packages match your filters.
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