"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "@/styles/calendar.css"; // Import the new calendar styles
import { useTheme } from "@/components/ThemeProvider";
import type { Car } from "@/data/cars";

export default function CarDetailPage() {
  const { theme, prices } = useTheme();
  const { id } = useParams();
  const car = prices.cars.find((c: Car) => c.id.toString() === id);

  const [withDriver, setWithDriver] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  if (!car) {
    return <div className="p-10 text-center">Car not found.</div>;
  }

  const price = withDriver
    ? theme === 'regular' ? car.regularPriceWithDriver : car.exclusivePriceWithDriver
    : theme === 'regular' ? car.regularPriceWithoutDriver : car.exclusivePriceWithoutDriver;

  const bookedDays = car.bookedDates.map((d) => new Date(d));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Booking submitted for ${car.name} on ${selectedDate?.toLocaleDateString()}`);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Car info */}
          <div>
            <div className="relative w-full h-72 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={car.image}
                alt={car.name}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold mt-6 text-black dark:text-white">{car.name}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{car.description}</p>

            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2 text-black dark:text-white">Service Coverage:</h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Service Area: Yogyakarta & Central Java</li>
                <li>Driver Included</li>
                <li>Fuel Included</li>
              </ul>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Book This Car</h3>

            {/* Price & Driver Toggle */}
            <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span>
                <span className="text-gray-600 dark:text-gray-400">/day</span>
              </div>
              {/* Driver Toggle */}
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={withDriver} onChange={() => setWithDriver(!withDriver)} className="sr-only peer" />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">With Driver</span>
              </label>
            </div>

            {/* Calendar */}
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={bookedDays}
              defaultMonth={new Date(2025, 8)}
              className="custom-daypicker"
            />

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input type="text" placeholder="Name" className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input type="tel" placeholder="Phone Number" className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input type="text" placeholder="Pickup Location" className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <button type="submit" disabled={!selectedDate} className="w-full bg-primary text-black dark:text-white font-bold py-3 rounded-lg hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed">
                Book Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}