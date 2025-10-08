// app/[locale]/car-rental/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import type { Car } from "@/data/cars";
import { cars } from "@/data/cars";
import { useTranslations } from "next-intl";

function CarCard({ car }: { car: Car }) {
  const { theme } = useTheme();
  const t = useTranslations("carRental");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const price =
    theme === "regular"
      ? car.regularPriceWithoutDriver
      : car.exclusivePriceWithoutDriver;

  return (
    <Link href={`/car-rental/${car.id}`}>
      <div className="bg-card text-foreground rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
        <div className="relative h-56 w-full">
          <Image src={car.image} alt={car.name} fill className="object-cover" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-foreground">{car.name}</h3>
          <p className="text-foreground/70 mt-2 line-clamp-2">{car.description}</p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(price)}
              <span className="text-sm font-normal text-foreground/50">
                {t("pricePerDay")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CarRentalPage() {
  const t = useTranslations("carRental");

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-foreground">
          {t("title")}
        </h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car: Car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
