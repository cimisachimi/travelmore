"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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

import PackageBookingModal from "./PackageBookingModal";
import { CheckIcon, UsersIcon, TagIcon, CalendarIcon } from "lucide-react";

// --- Tipe Data (Interfaces) ---
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

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
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, errorNotFound, t]);

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

  // Data processing
  const costData = (typeof pkg.cost === 'object' && pkg.cost !== null)
    ? { included: Array.isArray(pkg.cost.included) ? pkg.cost.included : [], excluded: Array.isArray(pkg.cost.excluded) ? pkg.cost.excluded : [] }
    : { included: [], excluded: [] };

  const priceTiers = Array.isArray(pkg.price_tiers) ? pkg.price_tiers : [];


  // Determine the starting price (realistic, not misleading)
  let startingPrice = 0;

  if (pkg.starting_from_price && pkg.starting_from_price > 0) {
    startingPrice = pkg.starting_from_price;
  } else if (priceTiers.length > 0) {
    const sortedTiers = [...priceTiers].sort((a, b) => a.min_pax - b.min_pax);

    // Prefer small-group tier (2–4 pax)
    const smallGroupTier = sortedTiers.find(
      (tier) => tier.min_pax <= 4 && (tier.max_pax || 4) >= 2
    );

    if (smallGroupTier) {
      startingPrice = smallGroupTier.price;
    } else {
      // Fallback: use median tier for balance
      const medianIndex = Math.floor(sortedTiers.length / 2);
      startingPrice = sortedTiers[medianIndex].price;
    }
  }

  const hasMultipleTiers = priceTiers.length > 1;

  const mapUrl = pkg.mapUrl ?? '';
  const images = pkg.images_url || [];
  const itineraryData = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  const tripInfo = Array.isArray(pkg.tripInfo) ? pkg.tripInfo : [];
  const faqsData = Array.isArray(pkg.faqs) ? pkg.faqs : [];
  const title = pkg.name.split(": ")[1] || pkg.name;

  const tabs = ["Overview", "Itinerary", "Pricing", "Cost", "FAQs", "Map"];

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass = theme === "regular" ? "border-gray-200" : "border-gray-700";

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPaxRange = (min: number, max: number): string => {
    if (min === max) return `${min} pax`;
    if (!max || max === 0) return `${min}+ pax`;
    return `${min}–${max} pax`;
  };

  // Find the best price (lowest price per person)
  const bestPriceTier = priceTiers.reduce((lowest, current) => {
    return current.price < lowest.price ? current : lowest;
  }, priceTiers[0] || { price: startingPrice, min_pax: 1, max_pax: 0 });

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
        <div className="hidden md:block">
          {count === 1 && (
            <div className="relative h-96 md:h-[600px]">
              <Image
                src={images[0]}
                alt={title}
                fill
                className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
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
              {images.slice(1, 3).map((src, i) => (
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
              {images.length > 3 && (
                <div className="relative overflow-hidden">
                  <Image
                    src={images[3]}
                    alt={`${title}-3`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              )}
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
        <div className={`${cardBgClass} rounded-2xl shadow-2xl overflow-hidden`}>
          {renderGallery()}

          <div className={`p-6 md:p-10 border-b ${borderClass}`}>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                ? "bg-blue-100 text-blue-800"
                : "bg-blue-900 text-blue-200"
                }`}>
                {pkg.duration} {t("trip.days")}
              </div>
              {pkg.category && (
                <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-gray-700 text-gray-200"
                  }`}>
                  {pkg.category}
                </div>
              )}
              {pkg.location && (
                <div className={`text-sm font-bold py-1 px-3 rounded-full ${theme === "regular"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-emerald-900 text-emerald-200"
                  }`}>
                  {pkg.location}
                </div>
              )}
            </div>
            <h1 className={`text-3xl md:text-5xl font-extrabold ${textClass}`}>
              {title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
            <div className="lg:col-span-2">
              <div className="w-full">
                <div className={`w-full border-b ${borderClass} overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
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

                <div className="py-8 min-h-[300px]">
                  {activeTab === "Overview" && (
                    <div>
                      <h3 className={`text-2xl font-bold mb-4 ${textClass}`}>
                        {t("trip.about")}
                      </h3>
                      <p className={`text-lg leading-relaxed ${textMutedClass}`}>
                        {pkg.description || "No description available."}
                      </p>
                    </div>
                  )}
                  {activeTab === "Itinerary" && (
                    <div className="space-y-8">
                      {itineraryData.length > 0 ? (
                        itineraryData.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold">
                                {item.day}
                              </div>
                              {index < itineraryData.length - 1 && (
                                <div className={`w-px grow ${borderClass} mt-2`}></div>
                              )}
                            </div>
                            <div className="pt-1">
                              <h4 className={`text-lg font-bold ${textClass}`}>
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
                  {activeTab === "Pricing" && (
                    <div className="space-y-6">
                      <h3 className={`text-2xl font-bold mb-4 ${textClass}`}>
                        {t("tabs.pricing")}
                      </h3>

                      {/* Best Price Highlight */}
                      {hasMultipleTiers && (
                        <div className={`p-4 rounded-lg border-2 border-green-500 ${theme === "regular" ? "bg-green-50" : "bg-green-900/20"}`}>
                          <div className="flex items-center gap-3">
                            <TagIcon className="w-5 h-5 text-green-600" />
                            <div>
                              <p className={`text-sm font-semibold ${theme === "regular" ? "text-green-800" : "text-green-300"}`}>
                                Best Value
                              </p>
                              <p className={`text-lg font-bold ${theme === "regular" ? "text-green-900" : "text-green-200"}`}>
                                {formatPrice(bestPriceTier.price)} per person
                              </p>
                              <p className={`text-sm ${theme === "regular" ? "text-green-700" : "text-green-300"}`}>
                                For {formatPaxRange(bestPriceTier.min_pax, bestPriceTier.max_pax)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pricing Table */}
                      {priceTiers.length > 0 ? (
                        <div className={`border ${borderClass} rounded-lg overflow-hidden`}>
                          <table className="w-full">
                            <thead className={theme === "regular" ? "bg-gray-50" : "bg-gray-700"}>
                              <tr>
                                <th scope="col" className={`px-6 py-4 text-left text-sm font-semibold ${textClass} uppercase tracking-wider`}>
                                  Group Size
                                </th>
                                <th scope="col" className={`px-6 py-4 text-left text-sm font-semibold ${textClass} uppercase tracking-wider`}>
                                  Price per Person
                                </th>
                                <th scope="col" className={`px-6 py-4 text-left text-sm font-semibold ${textClass} uppercase tracking-wider`}>
                                  Total for Group
                                </th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${borderClass} ${cardBgClass}`}>
                              {priceTiers.map((tier, index) => (
                                <tr
                                  key={tier.min_pax}
                                  className={`${tier.min_pax === bestPriceTier.min_pax && tier.max_pax === bestPriceTier.max_pax
                                    ? theme === "regular" ? "bg-green-50" : "bg-green-900/10"
                                    : 'hover:' + (theme === "regular" ? "bg-gray-50" : "bg-gray-750")
                                    } transition-colors`}
                                >
                                  <td className={`px-6 py-4 whitespace-nowrap`}>
                                    <div className="flex items-center gap-2">
                                      <UsersIcon className="w-4 h-4 text-blue-500" />
                                      <span className={`text-sm font-medium ${textClass}`}>
                                        {formatPaxRange(tier.min_pax, tier.max_pax)}
                                      </span>
                                      {tier.min_pax === bestPriceTier.min_pax && tier.max_pax === bestPriceTier.max_pax && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Best Value
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${textClass}`}>
                                    {formatPrice(tier.price)}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMutedClass}`}>
                                    {formatPrice(tier.price * (tier.max_pax || tier.min_pax))}
                                    <span className="text-xs ml-1">for {tier.max_pax || tier.min_pax} people</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className={`p-6 text-center rounded-lg border ${borderClass}`}>
                          <TagIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className={textMutedClass}>{t("status.noPricing", { defaultMessage: "No pricing details available." })}</p>
                        </div>
                      )}

                      {/* Additional Pricing Info */}
                      <div className={`p-4 rounded-lg ${theme === "regular" ? "bg-blue-50" : "bg-blue-900/20"}`}>
                        <p className={`text-sm ${theme === "regular" ? "text-blue-800" : "text-blue-300"}`}>
                          💡 <strong>Pro Tip:</strong> Larger groups enjoy better rates per person.
                          Consider traveling with friends or family to maximize savings!
                        </p>
                      </div>
                    </div>
                  )}
                  {activeTab === "Cost" && (
                    <div>
                      <h3 className={`text-2xl font-bold mb-6 ${textClass}`}>
                        {t("cost.facilitiesIncluded")}
                      </h3>
                      {costData.included && costData.included.length > 0 ? (
                        <ul className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          {costData.included.map((item, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <CheckIcon className="w-5 h-5 text-green-500 shrink-0" />
                              <span className={textMutedClass}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={textMutedClass}>{t("cost.noIncludedItems")}</p>
                      )}

                      <h3 className={`text-2xl font-bold mt-10 mb-6 ${textClass}`}>
                        {t("cost.facilitiesExcluded")}
                      </h3>
                      {costData.excluded && costData.excluded.length > 0 ? (
                        <ul className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          {costData.excluded.map((item, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <XIcon className="w-5 h-5 text-red-500 shrink-0" />
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
                          <div key={faq.question + index} className={`p-4 rounded-lg ${borderClass} border`}>
                            <h4 className={`font-bold text-lg ${textClass} mb-2`}>
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

              {tripInfo.length > 0 && (
                <div className={`mt-10 pt-10 border-t ${borderClass}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>
                    {t("trip.info")}
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                    {tripInfo.map((item) => (
                      <div key={item.label} className="flex items-start space-x-4">
                        <div className="text-2xl mt-1 shrink-0 w-6 text-center">{item.icon || 'i'}</div>
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

            {/* --- Enhanced Sidebar Booking --- */}
            <div className="lg:col-span-1">
              <div className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-8`}>
                {/* Enhanced Price Display */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="w-5 h-5 text-blue-500" />
                    <p className={`text-sm font-semibold ${textMutedClass}`}>
                      Starting from
                    </p>
                  </div>
                  <p className={`text-3xl font-bold ${textClass} mb-1`}>
                    {formatPrice(startingPrice)}
                  </p>
                  <p className={`text-sm ${textMutedClass}`}>
                    per person (for small groups of 2 person)
                  </p>
                  <p className={`text-xs italic ${textMutedClass} mb-3`}>
                    *Price varies depending on group size and travel date
                  </p>

                  {/* Group Savings Notice */}
                  {hasMultipleTiers && (
                    <div className={`p-3 rounded-lg ${theme === "regular" ? "bg-green-50" : "bg-green-900/20"} mb-4`}>
                      <div className="flex items-start gap-2">
                        <UsersIcon className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className={`text-xs font-semibold ${theme === "regular" ? "text-green-800" : "text-green-300"}`}>
                            Group Discounts Available
                          </p>
                          <p className={`text-xs ${theme === "regular" ? "text-green-700" : "text-green-400"}`}>
                            Save up to {formatPrice(startingPrice - bestPriceTier.price)} per person
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Pricing Preview */}
                  {priceTiers.length > 0 && (
                    <div className={`border-t ${borderClass} pt-4 mt-4`}>
                      <p className={`text-sm font-semibold ${textClass} mb-2`}>
                        Quick Price Guide:
                      </p>
                      <div className="space-y-2">
                        {priceTiers.slice(0, 3).map((tier) => (
                          <div key={tier.min_pax} className="flex justify-between items-center text-sm">
                            <span className={textMutedClass}>
                              {formatPaxRange(tier.min_pax, tier.max_pax)}
                            </span>
                            <span className={`font-semibold ${textClass}`}>
                              {formatPrice(tier.price)}
                            </span>
                          </div>
                        ))}
                        {priceTiers.length > 3 && (
                          <p className={`text-xs text-center ${textMutedClass} mt-2`}>
                            +{priceTiers.length - 3} more group sizes available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  disabled={!user}
                >
                  {user ? (
                    <div className="flex items-center justify-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      {t("booking.checkAvailability")}
                    </div>
                  ) : (
                    t("booking.loginToBook", { defaultMessage: "Login to Book" })
                  )}
                </button>

                <div className={`mt-4 p-3 rounded-lg ${theme === "regular" ? "bg-gray-50" : "bg-gray-700/50"}`}>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className={textMutedClass}>Best price guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className={textMutedClass}>Free cancellation</span>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  {t("booking.needHelp")}{" "}
                  <a
                    href="#"
                    className="text-cyan-600 font-semibold hover:underline"
                  >
                    {t("booking.sendMessage")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

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

      {pkg && (
        <PackageBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pkg={pkg}
          user={user as AuthUser | null}
          t={t as TFunction}
        />
      )}
    </div>
  );
}

// XIcon component remains the same
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