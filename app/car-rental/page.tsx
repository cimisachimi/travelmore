"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cars } from "@/data/cars";
import type { Car } from "@/data/cars";

function CarCard({ car }: { car: Car }) {
  return (
    <Link href={`/car-rental/${car.id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer">
        <div className="relative h-56 w-full">
          <Image
            src={car.image}
            alt={car.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold">{car.name}</h3>
          <p className="text-gray-600 mt-2 line-clamp-2">{car.description}</p>
          <span className="mt-4 inline-block text-primary font-semibold">
            Klik untuk lihat detail →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CarRentalPage() {
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">Car Rental</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
