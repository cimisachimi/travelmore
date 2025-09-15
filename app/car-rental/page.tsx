"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider"; // Import the useTheme hook
import type { Car } from "@/data/cars";

function CarCard({ car }: { car: Car }) {
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Determine which price to display based on the current theme
  const price = theme === 'regular' ? car.regularPriceWithoutDriver : car.exclusivePriceWithoutDriver;

  return (
    <Link href={`/car-rental/${car.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
        <div className="relative h-56 w-full">
          <Image
            src={car.image}
            alt={car.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-black dark:text-white">{car.name}</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{car.description}</p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-lg font-bold text-primary">{formatCurrency(price)}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/day</span></p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CarRentalPage() {
  const { prices } = useTheme();

  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-black dark:text-white">Car Rental</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {prices.cars.map((car: Car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}