"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Define a type that matches the structure of your API response
interface ApiCar {
  id: number;
  car_model: string;
  brand: string;
  description: string | null;
  price_per_day: string;
  availability: number;
  status: string;
  // Note: The API does not provide an image, so we'll use a placeholder.
}

function CarCard({ car }: { car: ApiCar }) {
  const t = useTranslations("carRental");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Combine brand and model for the car name
  const carName = `${car.brand} ${car.car_model}`;

  // Convert price string to a number for formatting
  const price = parseFloat(car.price_per_day);

  return (
    <Link href={`/car-rental/${car.id}`}>
      <div className="bg-card text-foreground rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
        <div className="relative h-56 w-full">
          {/* Using a placeholder image since the API doesn't provide one */}
          <Image
            src="/cars/avanza.jpg" // Placeholder image
            alt={carName}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-foreground">{carName}</h3>
          <p className="text-foreground/70 mt-2 line-clamp-2 h-12">
            {car.description || "No description available."}
          </p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(price)}
              <span className="text-sm font-normal text-foreground/50">
                {" "}{t("pricePerDay")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- Main Page Component ---

export default function CarRentalPage() {
  const t = useTranslations("carRental");

  // State to hold the car data, loading status, and any errors
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch("https://api.travelmore.travel/api/car-rentals");
        if (!response.ok) {
          throw new Error("Failed to fetch data from the server.");
        }
        const data = await response.json();
        setCars(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []); // The empty array ensures this effect runs only once

  // --- Render logic based on state ---

  // 1. Show a loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-foreground/80">Loading cars...</p>
      </div>
    );
  }

  // 2. Show an error message if fetching failed
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  // 3. Show the car data once it's successfully loaded
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-foreground">
          {t("title")}
        </h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car: ApiCar) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}