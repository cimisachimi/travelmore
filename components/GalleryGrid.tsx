// components/GalleryGrid.tsx
"use client";

import React from "react";
import Image from "next/image";
import { destinations } from "@/data/gallery"; // Import local data
import type { Destination } from "@/data/gallery"; // Import the type

export default function GalleryGrid() {
  // We are now using local data, so we don't need loading or error states.
  if (!destinations || destinations.length === 0) {
    return <p className="text-center text-gray-500">No destinations to display.</p>;
  }

  // If data is loaded, show the actual destination cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {destinations.map((dest: Destination) => (
        <div
          key={dest.id}
          className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group"
        >
          <div className="overflow-hidden">
            <Image
              src={dest.imageUrl}
              alt={dest.name}
              width={400}
              height={250}
              className="object-cover w-full h-48 transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold">{dest.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}