"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTranslations } from "next-intl";

import "@/styles/calendar.css";

// Define a type for the car data from your API
interface ApiCar {
  id: number;
  car_model: string;
  brand: string;
  description: string | null;
  price_per_day: string;
}

export default function CarDetailPage() {
  const t = useTranslations("carDetail");
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  // State for the car, loading, and error
  const [car, setCar] = useState<ApiCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch the specific car's data from the API
  useEffect(() => {
    if (!id) return; // Don't fetch if there's no ID

    const fetchCar = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/car-rentals/${id}`);
        if (!response.ok) {
          throw new Error("Car not found.");
        }
        const data = await response.json();
        setCar(data);
      } catch (err) { // ✅ FIXED: Handle the error type safely
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]); // Refetch if the ID ever changes

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !selectedDate) return;

    alert(
      t("alert", {
        car: `${car.brand} ${car.car_model}`,
        date: selectedDate.toLocaleDateString(),
      })
    );
  };

  // --- Render logic for different states ---

  if (loading) {
    return <div className="p-10 text-center text-foreground">Loading car details...</div>;
  }

  if (error || !car) {
    return <div className="p-10 text-center text-red-500">{t("notFound")}</div>;
  }

  const carName = `${car.brand} ${car.car_model}`;
  const price = parseFloat(car.price_per_day);
  // The API doesn't provide booked dates yet, so this will be empty
  const bookedDays: Date[] = [];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Car info */}
          <div>
            <div className="relative w-full h-72 rounded-lg overflow-hidden shadow-lg">
              {/* Using a placeholder since the API doesn't provide an image */}
              <Image src="/cars/avanza.jpg" alt={carName} fill className="object-cover" />
            </div>

            <h2 className="text-3xl font-bold mt-6 text-foreground">
              {carName}
            </h2>
            <p className="mt-2 text-foreground/70">{car.description || "No description provided."}</p>

            <div className="mt-6 p-4 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2 text-foreground">
                {t("service.title")}
              </h3>
              <ul className="list-disc pl-5 text-foreground/70 space-y-1">
                <li>{t("service.area")}</li>
                <li>{t("service.driver")}</li>
                <li>{t("service.fuel")}</li>
              </ul>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="bg-card shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-foreground">
              {t("form.title")}
            </h3>

            <div className="flex items-center mb-4 p-4 bg-background border border-border rounded-lg">
              <div>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(price)}
                </span>
                <span className="text-foreground/60">/day</span>
              </div>
            </div>

            <div className="calendar-container">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={bookedDays}
                defaultMonth={new Date()}
                className="custom-daypicker"
              />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder={t("form.name")}
                className="w-full border rounded-lg px-4 py-2 bg-background border-border text-foreground focus:ring-primary focus:ring-2 focus:outline-none transition"
                required
              />
              <input
                type="email"
                placeholder={t("form.email")}
                className="w-full border rounded-lg px-4 py-2 bg-background border-border text-foreground focus:ring-primary focus:ring-2 focus:outline-none transition"
                required
              />
              <input
                type="tel"
                placeholder={t("form.phone")}
                className="w-full border rounded-lg px-4 py-2 bg-background border-border text-foreground focus:ring-primary focus:ring-2 focus:outline-none transition"
                required
              />
              <input
                type="text"
                placeholder={t("form.pickup")}
                className="w-full border rounded-lg px-4 py-2 bg-background border-border text-foreground focus:ring-primary focus:ring-2 focus:outline-none transition"
                required
              />
              <button
                type="submit"
                disabled={!selectedDate}
                className="w-full bg-primary text-foreground font-bold py-3 rounded-lg hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t("form.button")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}