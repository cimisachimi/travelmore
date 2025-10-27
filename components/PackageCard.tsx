// components/PackageCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";

// Interface ini disalin dari packages/page.tsx Anda
interface PackageListItem {
  id: number;
  name: string;
  location?: string | null;
  duration: number;
  regularPrice?: number;
  exclusivePrice: number;
  rating?: number | null;
  category?: string | null;
  thumbnail_url: string | null;
}

// Helper format currency (juga dari packages/page.tsx)
const formatCurrency = (amount: number | null | undefined): string => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

export default function PackageCard({
  packageItem,
}: {
  packageItem: PackageListItem;
}) {
  const { theme } = useTheme();
  const params = useParams();
  const locale = params.locale as string;

  const tPackages = useTranslations("PackagesPage");
  const tDetail = useTranslations("activityDetail"); // Untuk "Starting from"

  // CSS Classes
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass =
    theme === "regular" ? "text-gray-600" : "text-gray-400";
  const borderClass =
    theme === "regular" ? "border-gray-200" : "border-gray-700";

  // Ambil judul tanpa prefix (jika ada)
  const title = packageItem.name?.split(": ")[1] || packageItem.name;

  return (
    <Link
      href={`/${locale}/packages/${packageItem.id}`}
      className="block group h-full"
    >
      <div
        className={`${cardBgClass} rounded-2xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1`}
      >
        {/* Gambar */}
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={packageItem.thumbnail_url || "/placeholder.jpg"}
            alt={title || "Holiday Package"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.target as HTMLImageElement).srcset = "/placeholder.jpg";
              (e.target as HTMLImageElement).src = "/placeholder.jpg";
            }}
          />
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white py-1 px-3 rounded-full text-sm font-bold backdrop-blur-sm">
            {packageItem.duration} {tPackages("days")}
          </div>
        </div>

        {/* Konten */}
        <div className="p-6 flex flex-col flex-grow">
          {packageItem.category && (
            <p
              className={`text-xs font-semibold text-primary uppercase tracking-wider mb-1`}
            >
              {packageItem.category}
            </p>
          )}
          <h3
            className={`text-xl font-bold mb-2 ${textClass} line-clamp-2`}
            title={title}
          >
            {title}
          </h3>
          {packageItem.location && (
            <p className={`text-sm ${textMutedClass} mb-3`}>
              {packageItem.location}
            </p>
          )}

          {/* Harga dan Tombol */}
          <div
            className={`flex justify-between items-center mt-auto pt-4 border-t ${borderClass}`}
          >
            <div className="flex flex-col">
              <span className={`text-xs ${textMutedClass}`}>
                {tDetail("startingFrom")}
              </span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(packageItem.exclusivePrice)}
              </span>
            </div>
            <span
              className={`text-sm font-semibold ${textClass} group-hover:text-primary transition-colors duration-300`}
            >
              {tPackages("viewDetails")} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
