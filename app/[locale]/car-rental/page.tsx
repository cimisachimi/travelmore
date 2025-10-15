"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users, Gauge, Luggage } from "lucide-react";
import api from "@/lib/api"; // ✅ Your centralized API instance

// --- API Interface ---
// This interface is simplified because the backend now sends pre-translated data.
interface ApiCar {
  id: number;
  car_model: string;
  brand: string;
  description: string | null;
  price_per_day: string;
  car_type: string;
  transmission: string;
  capacity: number;
  trunk_size: number;
  features: string[];
  images: { url: string; type: 'thumbnail' | 'gallery' }[];
}

// --- Reusable Icon Component ---
function InfoIcon({ icon: Icon, text }: { icon: React.ElementType; text: string | number }) {
  return (
    <div className="flex items-center gap-2 text-foreground/80">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

// --- CarCard Component ---
function CarCard({ car }: { car: ApiCar }) {
  const t = useTranslations("carRental");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const carName = `${car.brand} ${car.car_model}`;
  const price = parseFloat(car.price_per_day);
  const thumbnail = car.images.find(img => img.type === 'thumbnail');

  // This will now correctly resolve to the full URL like "http://localhost:8000/storage/..."
  const imageUrl = thumbnail
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${thumbnail.url}`
    : "/cars/placeholder.jpg";

  return (
    <Link href={`/car-rental/${car.id}`} className="block h-full">
      <div className="bg-card text-foreground rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col group">
        <div className="relative h-56 w-full">
          <Image
            src={imageUrl}
            alt={carName}
            fill
            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-sm font-semibold text-primary">{car.car_type.toUpperCase()}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{carName}</h3>

          <div className="flex items-center gap-4 mt-4 text-sm text-foreground/70">
            <InfoIcon icon={Users} text={`${car.capacity} Seats`} />
            <InfoIcon icon={Gauge} text={car.transmission} />
            <InfoIcon icon={Luggage} text={`${car.trunk_size} Bags`} />
          </div>

          <p className="text-foreground/70 mt-4 line-clamp-2 flex-grow h-12">
            {car.description || "No description available."}
          </p>

          <div className="mt-5 pt-4 border-t border-border/50">
            <p className="text-xl font-extrabold text-foreground">
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
  const locale = useLocale();

  const [cars, setCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        // ✅ FIXED: Use the 'api' instance which has the correct '/api' prefix.
        const response = await api.get("/public/car-rentals", {
          params: { locale }
        });
        if (response.status !== 200) throw new Error("Failed to fetch car rental data.");
        setCars(response.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [locale]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-foreground/80">Loading cars...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-foreground/60 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}