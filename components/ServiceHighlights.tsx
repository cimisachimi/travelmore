"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Reusable card component for a consistent design
const ServiceCard = ({
  iconSrc,
  title,
  features,
  description,
}: {
  iconSrc: string;
  title: string;
  features: string;
  description: string;
}) => (
  <div
    className="
    bg-white rounded-lg shadow-lg p-6
    border border-transparent hover:border-primary
    transform hover:-translate-y-2 transition-all duration-300
    flex flex-col
  "
  >
    <div className="flex-shrink-0">
      <Image
        src={iconSrc}
        alt={`${title} icon`}
        width={48}
        height={48}
        className="mb-4 text-primary"
      />
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-sm font-semibold text-gray-500 mb-3">{features}</p>
    </div>
    <div className="flex-grow">
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

// Main section component
const ServiceHighlights: React.FC = () => {
  const t = useTranslations("ServiceHighlights");

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-2 text-foreground">{t("title")}</h2>
        <p className="text-gray-600 mb-12">{t("subtitle")}</p>

        {/* Grid for the service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard
            iconSrc="/package-icon.svg"
            title={t("packageTitle")}
            features={t("packageFeatures")}
            description={t("packageDesc")}
          />
          <ServiceCard
            iconSrc="/tour-icon.svg"
            title={t("tourTitle")}
            features={t("tourFeatures")}
            description={t("tourDesc")}
          />
          <ServiceCard
            iconSrc="/car-icon.svg"
            title={t("cityTitle")}
            features={t("cityFeatures")}
            description={t("cityDesc")}
          />
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;
