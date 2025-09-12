// app/packages/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { packages } from "@/data/packages";
// The line below is removed because the 'Package' type is not explicitly used in this component's code
// import type { Package } from "@/data/packages";
export default function PackagesPage() {
  // State for filters
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Memoize category list to avoid recalculation
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

  // Filter packages based on current state
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const priceMatch = pkg.price <= maxPrice;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(pkg.category);
      return priceMatch && categoryMatch;
    });
  }, [maxPrice, selectedCategories]);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h3 className="text-xl font-bold mb-4">Filters</h3>

            {/* Price Filter */}
            <div className="mb-6">
              <label htmlFor="priceRange" className="block font-semibold mb-2">
                Price Range
              </label>
              <input
                id="priceRange"
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-gray-600 mt-2">
                Up to: <strong>{formatCurrency(maxPrice)}</strong>
              </div>
            </div>

            <hr className="my-6" />

            {/* Category Filter */}
            <div>
              <h4 className="font-semibold mb-2">Categories</h4>
              <div className="space-y-2">
                {allCategories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      name={category}
                      checked={selectedCategories.includes(category)}
                      onChange={handleCategoryChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-3 text-gray-700">{category}</span>
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
                <div
                  key={pkg.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition hover:shadow-xl"
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
                    <h2 className="text-xl font-bold mb-2">{pkg.title}</h2>
                    <p className="text-gray-600 mb-4 flex-grow">
                      {pkg.description}
                    </p>
                    <p className="text-xl font-bold text-primary mt-auto">
                      {formatCurrency(pkg.price)}
                    </p>
                  </div>
                </div>
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
  );
}