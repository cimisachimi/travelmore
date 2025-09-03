"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type Destination = {
  id: number;
  name: string;
  imageUrl: string;
};

export default function GalleryGrid() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi fetch API
    fetch("https://your-api-url.com/destinations")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((data) => {
        setDestinations(data.slice(0, 27)); // Ambil 27 data pertama
      })
      .catch(() => {
        console.error("Failed to fetch data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // If loading, show placeholder cards
  if (loading || destinations.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {Array.from({ length: 27 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
          >
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">
                <span className="block w-32 h-6 bg-gray-200 animate-pulse"></span>
              </h3>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If data is loaded, show the actual destination cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {destinations.map((dest) => (
        <div
          key={dest.id}
          className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
        >
          <Image
            src={dest.imageUrl}
            alt={dest.name}
            width={400}
            height={250}
            className="object-cover w-full h-48"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold">{dest.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}