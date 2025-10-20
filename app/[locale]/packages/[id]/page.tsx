"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";
import { packages } from "@/data/packages";


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


const MobileImageSlider = ({
  images,
  title,
}: {
  images: string[];
  title: string;
}) => (
  <Swiper
    modules={[Navigation, Pagination]}
    navigation 
    pagination={{ clickable: true }} 
    className="w-full h-96" 
  >
    {images.map((src, i) => (
      <SwiperSlide key={i}>
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={`${title}-${i}`}
            fill
            className="object-cover"
            priority={i === 0} 
          />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
);

// Helper Icons
const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
const XIcon = () => (
  <svg
    className="w-5 h-5 text-red-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function PackageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { theme } = useTheme();
  const t = useTranslations("packages");
  const [activeTab, setActiveTab] = useState("Overview");

  const { id } = use(params);
  const pkg = packages.find((p) => p.id === id);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t("status.notFound")}
      </div>
    );
  }

  const childPrice = pkg.childPrice || pkg.exclusivePrice * 0.5;
  const images = pkg.images || [];
  const tripInfo = pkg.tripInfo || [];
  const tabs = ["Overview", "Itinerary", "Cost", "FAQs", "Map"];

  const mainBgClass = theme === "regular" ? "bg-gray-50" : "bg-black";
  const cardBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass =
    theme === "regular" ? "text-gray-600" : "text-gray-300";
  const borderClass =
    theme === "regular" ? "border-gray-200" : "border-gray-700";

 
  const renderGallery = () => {
    const count = images.length;
    if (count === 0)
      return (
        <div
          className={`w-full h-[400px] ${
            theme === "regular" ? "bg-gray-200" : "bg-gray-900"
          } rounded-lg flex items-center justify-center text-gray-500`}
        >
          {t("gallery.noImage")}
        </div>
      );

    return (
      <>
        
        <div className="md:hidden">
          <MobileImageSlider images={images} title={pkg.title} />
        </div>

       
        {count === 1 && (
          <div className="relative h-96 md:h-[600px] hidden md:block">
            <Image
              src={images[0]}
              alt={pkg.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        
        {count === 2 && (
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-2 h-72 md:h-[500px]">
            {images.map((src, i) => (
              <div key={i} className="relative w-full h-full">
                <Image
                  src={src}
                  alt={`${pkg.title}-${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

       
        {count > 2 && (
          <div className="hidden md:grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-96 md:h-[600px]">
            <div className="relative md:col-span-2 md:row-span-2">
              <Image
                src={images[0]}
                alt={pkg.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {images.slice(1, 4).map((src, i) => (
              <div key={i} className="relative">
                <Image
                  src={src}
                  alt={`${pkg.title}-${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
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
                className={`text-sm font-bold py-1 px-3 rounded-full ${
                  theme === "regular"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-blue-900 text-blue-200"
                }`}
              >
                {pkg.duration} {t("trip.days")}
              </div>
              <div
                className={`text-sm font-bold py-1 px-3 rounded-full ${
                  theme === "regular"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {pkg.category}
              </div>
            </div>
            <h1
              className={`text-3xl md:text-5xl font-extrabold ${textClass}`}
            >
              {pkg.title.split(": ")[1] || pkg.title}
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
                        className={`${
                          activeTab === tab
                            ? "border-blue-500 text-blue-600"
                            : `border-transparent ${textMutedClass} hover:border-gray-300 hover:text-gray-700`
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                        {t(`tabs.${tab.toLowerCase()}`)}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="py-8">
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
                        {pkg.description}
                      </p>
                    </div>
                  )}
                  {activeTab === "Itinerary" && (
                    <div className="space-y-8">
                      {pkg.itinerary?.map((item) => (
                        <div key={item.day} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold">
                              {item.day}
                            </div>
                            <div
                              className={`w-px h-full ${borderClass} mt-2`}
                            ></div>
                          </div>
                          <div>
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
                      ))}
                    </div>
                  )}
                  {activeTab === "Cost" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4
                          className={`text-lg font-bold mb-4 ${textClass}`}
                        >
                          {t("cost.included")}
                        </h4>
                        <ul className="space-y-2">
                          {pkg.cost?.included.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3"
                            >
                              <CheckIcon />{" "}
                              <span className={textMutedClass}>
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4
                          className={`text-lg font-bold mb-4 ${textClass}`}
                        >
                          {t("cost.excluded")}
                        </h4>
                        <ul className="space-y-2">
                          {pkg.cost?.excluded.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3"
                            >
                              <XIcon />{" "}
                              <span className={textMutedClass}>
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {activeTab === "FAQs" && (
                    <div className="space-y-6">
                      {pkg.faqs?.map((faq) => (
                        <div key={faq.question}>
                          <h4
                            className={`font-bold text-lg ${textClass}`}
                          >
                            {faq.question}
                          </h4>
                          <p className={textMutedClass}>{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "Map" && (
                    <iframe
                      src={pkg.mapUrl}
                      width="100%"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    ></iframe>
                  )}
                </div>
              </div>

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
                      <div className="text-2xl mt-1">{item.icon}</div>
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
            </div>

            <div className="lg:col-span-1">
              <div
                className={`border ${borderClass} rounded-xl shadow-lg p-6 sticky top-8`}
              >
                <div
                  className={`flex justify-between divide-x ${borderClass} text-center mb-5`}
                >
                  <div className="pr-4 flex-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2-5 py-0.5 rounded-full mb-2">
                      SALE
                    </span>
                    <p className={`${textMutedClass} text-sm`}>
                      {t("trip.from")}{" "}
                      <span className="line-through">
                        Rp{pkg.regularPrice.toLocaleString("id-ID")}
                      </span>
                    </p>
                    <p className={`text-2xl font-bold ${textClass}`}>
                      Rp{pkg.exclusivePrice.toLocaleString("id-ID")}
                    </p>
                    <p className={`text-sm ${textMutedClass}`}>
                      / {t("trip.adult")}
                    </p>
                  </div>
                  <div className="pl-4 flex-1">
                    <p
                      className={`${textMutedClass} text-sm mt-[26px]`}
                    >
                      {t("trip.from")}
                    </p>
                    <p className={`text-2xl font-bold ${textClass}`}>
                      Rp{childPrice.toLocaleString("id-ID")}
                    </p>
                    <p className={`text-sm ${textMutedClass}`}>
                      / {t("trip.child")}
                    </p>
                  </div>
                </div>
                <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                  {t("booking.checkAvailability")}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
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
            className={`inline-block py-3 px-8 rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 ${
              theme === "regular"
                ? "bg-white text-blue-600"
                : "bg-gray-800 text-white"
            }`}
          >
            {t("buttons.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
