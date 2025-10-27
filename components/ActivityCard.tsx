// components/ActivityCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import type { Activity } from "@/data/activities";

// --- Helper ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Ikon ini didefinisikan di sini
const LocationMarkerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Komponen Utama Kartu ---
export default function ActivityCard({ activity }: { activity: Activity }) {
  const { theme } = useTheme();
  
  // PERBAIKAN: Menggunakan key yang TEPAT sesuai en.json Anda
  const tDetail = useTranslations("activityDetail"); 
  const tActivities = useTranslations("activities"); 
  
  const params = useParams();
  const locale = params.locale as string;

  const price =
    theme === "regular" ? activity.regularPrice : activity.exclusivePrice;

  return (
    <div
      className={`flex flex-col h-full rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl ${
        theme === "regular" ? "bg-white" : "bg-gray-800"
      }`}
    >
      {/* Gambar */}
      <div className="relative w-full h-52">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div
          className={`absolute top-3 left-3 text-xs font-bold py-1 px-3 rounded-full ${
            theme === "regular"
              ? "bg-teal-100 text-teal-800"
              : "bg-teal-900 text-teal-200"
          }`}
        >
          {activity.category}
        </div>
      </div>

      {/* Konten */}
      <div className="p-5 flex flex-col flex-grow">
        <h3
          className={`text-xl font-bold mb-2 ${
            theme === "regular" ? "text-gray-900" : "text-white"
          }`}
        >
          {activity.title}
        </h3>
        <div
          className={`flex items-center text-sm mb-3 ${
            theme === "regular" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          <LocationMarkerIcon />
          <span className="ml-1.5">{activity.location}</span>
        </div>
        <p
          className={`text-sm flex-grow mb-4 line-clamp-3 ${
            theme === "regular" ? "text-gray-700" : "text-gray-300"
          }`}
        >
          {activity.description}
        </p>

        {/* Harga dan Tombol */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col">
            <span
              className={`text-xs ${
                theme === "regular" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {/* PERBAIKAN: Menggunakan "tDetail" */}
              {tDetail("startingFrom")}
            </span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(price)}
            </span>
          </div>
          <Link
            href={`/${locale}/activities/${activity.id}`}
            className="bg-primary text-black font-bold py-2 px-5 rounded-lg text-sm transition transform hover:scale-105 hover:brightness-90"
          >
            {/* PERBAIKAN: Menggunakan "tActivities.buttons" */}
            {tActivities("buttons.details")}
          </Link>
        </div>
      </div>
    </div>
  );
}
