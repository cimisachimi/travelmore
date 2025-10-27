"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation"; // Corrected import
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- MobileImageSlider Component ---
interface MobileImageSliderProps {
  images: string[];
  title: string;
}
const MobileImageSlider: React.FC<MobileImageSliderProps> = ({ images, title }) => (
  <Swiper
    modules={[Navigation, Pagination]}
    spaceBetween={0}
    slidesPerView={1}
    navigation
    pagination={{ clickable: true }}
    className="h-72 w-full"
  >
    {images.map((src, index) => (
      <SwiperSlide key={index}>
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={`${title} - image ${index + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
);
// --- End MobileImageSlider ---

import PackageBookingModal from "./PackageBookingModal"; // Assuming this is correctly placed
import { CheckIcon } from "lucide-react";

// --- Tipe Data (Interfaces) ---
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

// [UPDATED] Interface for new price tiers
export interface PackagePriceTier {
  min_pax: number;
  max_pax: number;
  price: number;
}

export interface HolidayPackage {
  id: number;
  name: string;
  duration: number;
  category: string;
  description: string;
  location: string;
  rating: number | null;
  images_url: string[];
  itinerary: { day: number; title: string; description: string }[];
  cost: { included: string[]; excluded: string[] };
  faqs: { question: string; answer: string }[];
  tripInfo: { label: string; value: string; icon: string }[];
  mapUrl: string;

  // [NEW] Updated pricing fields
  price_tiers: PackagePriceTier[];
  starting_from_price: number | null;
}

export type TFunction = (key: string, defaultMessage?: string) => string;

// --- Komponen Utama ---
export default function PackageDetailPage() {
  const { theme } = useTheme();
  const t = useTranslations("packages");
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;

  const [pkg, setPkg] = useState<HolidayPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const errorNotFound = t("status.notFound");

  useEffect(() => {
    if (!id) return;

    const fetchPackage = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/public/packages/${id}`);
        setPkg(response.data as HolidayPackage);
      } catch (err: unknown) {
        console.error("Failed to fetch package:", err);
        if (typeof err === "object" && err !== null && "response" in err) {
          const response = (err as { response?: { status?: number } }).response;
          if (response?.status === 404) {
            setError(errorNotFound);
          } else {
            setError(t("status.fetchError", { defaultMessage: "Failed to load package data." }));
          }
        } else {
          setError(t("status.fetchError", { defaultMessage: "Failed to load package data." }));
        }
      }
      finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, errorNotFound, t]); // Add t to dependency array

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t("status.loading")}
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 p-4 text-center">
        {error || t("status.notFound")}
      </div>
    );
  }

  // Ensure pkg.cost is an object with included/excluded arrays
  const costData = (typeof pkg.cost === 'object' && pkg.cost !== null)
    ? { included: Array.isArray(pkg.cost.included) ? pkg.cost.included : [], excluded: Array.isArray(pkg.cost.excluded) ? pkg.cost.excluded : [] }
    : { included: [], excluded: [] };

  // [REMOVED] Old price logic

  // [NEW] Use new fields directly
  const startingPrice = pkg.starting_from_price ?? 0;
  const priceTiers = Array.isArray(pkg.price_tiers) ? pkg.price_tiers : [];
  const mapUrl = pkg.mapUrl ?? '';

  const images = pkg.images_url || [];
  // Ensure itinerary is an array
  const itineraryData = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const tripInfo = Array.isArray(pkg.tripInfo) ? pkg.tripInfo : [];
  const faqsData = Array.isArray(pkg.faqs) ? pkg.faqs : [];
  const title = pkg.name.split(": ")[1] || pkg.name;

  // [UPDATED] Added "Pricing" tab
  const tabs = ["Overview", "Itinerary", "Pricing", "Cost", "FAQs", "Map"];

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass =
    theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass =
    theme === "regular" ? "border-gray-200" : "border-gray-700";

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // [NEW] Helper to format pax range
  const formatPaxRange = (min: number, max: number): string => {
    if (min === max) return `${min} pax`;
    if (!max || max === 0) return `${min}+ pax`;
    return `${min}–${max} pax`;
  };


  const renderGallery = (): ReactNode => {
    const count = images.length;
    if (count === 0)
      return (
        <div
          className={`w-full h-72 md:h-[400px] ${theme === "regular" ? "bg-gray-200" : "bg-gray-900"
            } rounded-lg flex items-center justify-center text-gray-500`}
        >
          {t("gallery.noImage")}
        </div>
      );

    return (
      <>
        <div className="md:hidden">
          <MobileImageSlider images={images} title={title} />
        </div>
        {/* Desktop Gallery Grid */}
        <div className="hidden md:block">
          {count === 1 && (
            <div className="relative h-96 md:h-[600px]">
              <Image
                src={images[0]}
                alt={title}
                fill
                className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" // Adjust rounding
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
          )}
          {count === 2 && (
            <div className="grid grid-cols-2 gap-2 h-72 md:h-[500px]">
              {images.map((src, i) => (
                <div key={i} className={`relative w-full h-full ${i === 0 ? 'rounded-tl-2xl' : 'rounded-tr-2xl'}`}>
                  <Image
                    src={src}
                    alt={`${title}-${i}`}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              ))}
            </div>
          )}
          {count > 2 && (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 md:h-[600px]">
              <div className="relative col-span-2 row-span-2 rounded-tl-2xl overflow-hidden">
                <Image
                  src={images[0]}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 767px) 100vw, 50vw"
                />
              </div>
              {images.slice(1, 3).map((src, i) => ( // Show images 2 and 3
                <div key={i} className={`relative ${i === 0 ? 'rounded-tr-2xl' : ''} overflow-hidden`}>
                  <Image
                    src={src}
                    alt={`${title}-${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
              {/* Optional: Add overlay for more images button */}
              {images.length > 3 && (
                <div className="relative overflow-hidden">
                  <Image
                    src={images[3]} // Show 4th image
                    alt={`${title}-3`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                  {/* Add an overlay button if needed */}
                  {/* <button className="absolute inset-0 bg-black/50 text-white flex items-center justify-center font-bold">+{images.length - 3} More</button> */}
                </div>
              )}
              {/* Fill remaining grid cell if less than 4 images */}
              {images.length <= 3 && <div className="bg-muted"></div>}
            </div>
          )}
        </div>
      </>
    );
  };


  return (
    <div className={mainBgClass}>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div
          className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}
        >
          {renderGallery()}

          <div className={`p-6 md:p-10 border-b ${borderClass}`}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div
                className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-blue-900 text-blue-200"
                  }`}
              >
                {pkg.duration} {t("trip.days")}
              </div>
              {pkg.category && ( // Only show if category exists
                <div
                  className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-700 text-gray-200"
                    }`}
                >
                  {pkg.category}
                </div>
              )}
              {pkg.location && ( // Only show if location exists
                <div
                  className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-emerald-900 text-emerald-200"
                    }`}
                >
                  {pkg.location}
                </div>
              )}
            </div>
            <h1
              className={`text-3xl md:text-5xl font-extrabold ${textClass}`}
            >
              {title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
            <div className="lg:col-span-2">
              <div className="w-full">
                <div
                  className={`w-full border-b ${borderClass} overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
                >
                  <nav
                    className="-mb-px flex space-x-6"
                    aria-label="Tabs"
                  >
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${activeTab === tab
                          ? "border-blue-500 text-blue-600"
                          : `border-transparent ${textMutedClass} hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-200`
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        {t(`tabs.${tab.toLowerCase()}`)}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="py-8 min-h-[300px]"> {/* Added min-height */}
                  {activeTab === "Overview" && (
                    <div>
                      <h3
                        className={`text-2xl font-bold mb-4 ${textClass}`}
                      >
                        {t("trip.about")}
                      </h3>
                      <p
                        className={`text-lg leading-relaxed ${textMutedClass}`}
                      >
                        {pkg.description || "No description available."}
                      </p>
                    </div>
                  )}
                  {activeTab === "Itinerary" && (
                    <div className="space-y-8">
                      {itineraryData.length > 0 ? (
                        itineraryData.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold">
                                {item.day}
                              </div>
                              {/* Don't draw line after last item */}
                              {index < itineraryData.length - 1 && (
                                <div className={`w-px flex-grow ${borderClass} mt-2`}></div>
                              )}
                            </div>
                            <div className="pt-1"> {/* Align text slightly lower */}
                              <h4
                                className={`text-lg font-bold ${textClass}`}
                              >
                                {item.title}
                              </h4>
                              <p className={`${textMutedClass}`}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={textMutedClass}>{t("status.noItinerary", { defaultMessage: "No itinerary details available." })}</p>
                      )}
                    </div>
                  )}
                  {/* [NEW] Pricing Tab */}
                  {activeTab === "Pricing" && (
                    <div>
                      <h3 className={`text-2xl font-bold mb-4 ${textClass}`}>
                        {t("tabs.pricing")}
                      </h3>
                      {priceTiers.length > 0 ? (
                        <div className={`border ${borderClass} rounded-lg overflow-hidden`}>
                          <table className="w-full divide-y ${borderClass}">
                            <thead className={theme === "regular" ? "bg-gray-50" : "bg-gray-700"}>
                              <tr>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textMutedClass} uppercase tracking-wider`}>
                                  {t("pricing.pax", { defaultMessage: "Participants" })}
                                </th>
                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textMutedClass} uppercase tracking-wider`}>
                                  {t("pricing.pricePerPax", { defaultMessage: "Price per Pax" })}
                                </th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${borderClass} ${cardBgClass}`}>
                              {priceTiers.map((tier) => (
                                <tr key={tier.min_pax}>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textClass}`}>
                                    {formatPaxRange(tier.min_pax, tier.max_pax)}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMutedClass}`}>
                                    {formatPrice(tier.price)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={textMutedClass}>{t("status.noPricing", { defaultMessage: "No pricing details available." })}</p>
                      )}
                    </div>
                  )}
                  {activeTab === "Cost" && (
                    <div>
                      <h3 className={`text-2xl font-bold mb-6 ${textClass}`}>
                        {t("cost.facilitiesIncluded")}
                      </h3>
                      {costData.included && costData.included.length > 0 ? (
                        <ul className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3"> {/* Grid layout */}
                          {costData.included.map((item, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className={textMutedClass}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={textMutedClass}>{t("cost.noIncludedItems")}</p>
                      )}

                      {/* [NEW] Excluded Items */}
                      <h3 className={`text-2xl font-bold mt-10 mb-6 ${textClass}`}>
                        {t("cost.facilitiesExcluded")}
                      </h3>
                      {costData.excluded && costData.excluded.length > 0 ? (
                        <ul className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          {costData.excluded.map((item, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <XIcon className="w-5 h-5 text-red-500 flex-shrink-0" /> {/* Assuming you add XIcon import */}
                              <span className={textMutedClass}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={textMutedClass}>{t("cost.noExcludedItems")}</p>
                      )}
                    </div>
                  )}
                  {activeTab === "FAQs" && (
                    <div className="space-y-6">
                      {faqsData.length > 0 ? (
                        faqsData.map((faq, index) => (
                          <div key={faq.question + index}>
                            <h4
                              className={`font-bold text-lg ${textClass}`}
                            >
                              {faq.question}
                            </h4>
                            <p className={textMutedClass}>{faq.answer}</p>
                          </div>
                        ))
                      ) : (
                        <p className={textMutedClass}>{t("status.noFaqs", { defaultMessage: "No frequently asked questions available." })}</p>
                      )}
                    </div>
                  )}
                  {activeTab === "Map" && (
                    mapUrl ? (
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-lg"
                      ></iframe>
                    ) : (
                      <p className={textMutedClass}>{t("status.noMap", { defaultMessage: "Map location not available." })}</p>
                    )
                  )}
                </div>
              </div>
              {/* Trip Info Section */}
              {tripInfo.length > 0 && (
                <div className={`mt-10 pt-10 border-t ${borderClass}`}>
                  <h2
                    className={`text-2xl font-bold mb-6 ${textClass}`}
                  >
                    {t("trip.info")}
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                    {tripInfo.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start space-x-4"
                      >
                        <div className="text-2xl mt-1 flex-shrink-0 w-6 text-center">{item.icon || 'i'}</div> {/* Default icon */}
                        <div>
                          <p className={`text-sm ${textMutedClass}`}>
                            {item.label}
                          </p>
                          <p className={`font-bold ${textClass}`}>
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* --- Sidebar Booking --- */}
            <div className="lg:col-span-1">
              <div
                className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-8`}
              >
                {/* [UPDATED] Price Display */}
                <div className="mb-5">
                  <p className={`text-sm ${textMutedClass}`}>
                    {t("trip.from")}
                  </p>
                  <p className={`text-3xl font-bold ${textClass}`}>
                    {formatPrice(startingPrice)}
                  </p>
                  <p className={`text-sm ${textMutedClass}`}>
                    / {t("trip.person")}
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!user} // Disable if user not logged in
                >
                  {user ? t("booking.checkAvailability") : t("booking.loginToBook", { defaultMessage: "Login to Book" })}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  {t("booking.needHelp")}{" "}
                  <a
                    href="#" // Replace with actual contact link/modal trigger
                    className="text-cyan-600 font-semibold hover:underline"
                  >
                    {t("booking.sendMessage")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            href="/packages"
            className={`inline-block py-3 px-8 rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 ${theme === "regular"
              ? "bg-white text-blue-600 hover:bg-gray-50"
              : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
          >
            {t("buttons.back")}
          </Link>
        </div>
      </div>

      {/* Ensure pkg is not null before rendering modal */}
      {pkg && (
        <PackageBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pkg={pkg}
          user={user as AuthUser | null}
          t={t as TFunction} // Pass the translation function
        />
      )}
    </div>
  );
}

// [NEW] Helper icon (add to lucide imports if you prefer)
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);