// app/car-rental/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cars } from "@/data/cars";
import type { Car } from "@/data/cars";

// A reusable component for each car card
function CarCard({ car }: { car: Car }) {
  const [withDriver, setWithDriver] = useState(false);

  const price = withDriver ? car.priceWithDriver : car.priceWithoutDriver;

  const bookedDays = car.bookedDates.map((dateStr) => new Date(dateStr));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col lg:flex-row">
      {/* Left Side: Image and Details */}
      <div className="lg:w-1/2">
        <div className="relative h-64 w-full">
          <Image
            src={car.image}
            alt={car.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-bold">{car.name}</h3>
          <p className="text-gray-600 mt-2">{car.description}</p>

          {/* Driver Toggle */}
          <div className="mt-4">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={withDriver} onChange={() => setWithDriver(!withDriver)} className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">
                With Driver
              </span>
            </label>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span>
            <span className="text-gray-600">/day</span>
          </div>
        </div>
      </div>

      {/* Right Side: Calendar */}
      <div className="lg:w-1/2 p-6 bg-gray-50 flex flex-col justify-center items-center">
        <h4 className="text-lg font-semibold mb-2">Availability</h4>
        <DayPicker
          mode="multiple"
          disabled={bookedDays}
          defaultMonth={new Date(2025, 8)} // Starts calendar in September 2025
          styles={{
            day: {
              borderRadius: '0',
            },
            day_disabled: {
              color: '#d1d5db',
              backgroundColor: '#fca5a5',
              fontWeight: 'bold'
            },
          }}
        />
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center"><div className="w-4 h-4 bg-white border mr-2"></div> Available</div>
          <div className="flex items-center"><div className="w-4 h-4 bg-red-400 mr-2"></div> Rented</div>
        </div>
      </div>
    </div>
  );
}


// Main Page Component
export default function CarRentalPage() {
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">Car Rental</h1>
        <div className="space-y-8">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}