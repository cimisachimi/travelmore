// app/[locale]/car-rental/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import type { Car } from "@/data/cars";
import { cars } from "@/data/cars";


import "@/styles/calendar.css"; 

export default function CarDetailPage() {
  const { theme } = useTheme();
  const t = useTranslations("carDetail");
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";


  const car = cars.find((c: Car) => String(c.id) === id);

 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  if (!car) {
    return <div className="p-10 text-center text-foreground">{t("notFound")}</div>;
  }

  const price =
    theme === "regular"
      ? car.regularPriceWithDriver
      : car.exclusivePriceWithDriver;

  const bookedDays = car.bookedDates
    .map((d: string) => new Date(d))
    .filter((d) => !isNaN(d.getTime()));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      t("alert", {
        car: car.name,
        date: selectedDate.toLocaleDateString(),
      })
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Car info */}
          <div>
            <div className="relative w-full h-72 rounded-lg overflow-hidden shadow-lg">
              <Image src={car.image} alt={car.name} fill className="object-cover" />
            </div>

            <h2 className="text-3xl font-bold mt-6 text-foreground">
              {car.name}
            </h2>
            <p className="mt-2 text-foreground/70">{car.description}</p>

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
                onSelect={(date) => date && setSelectedDate(date)}
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

