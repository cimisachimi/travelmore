"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const Feature = ({
  iconSrc,
  title,
  description,
}: {
  iconSrc: string;
  title: string;
  description: string;
}) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 bg-primary/50 p-3 rounded-full">
      <Image src={iconSrc} alt={`${title} icon`} width={24} height={24} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-foreground/80 mt-1">{description}</p>
    </div>
  </div>
);

const WhyChooseUs: React.FC = () => {
  const t = useTranslations("WhyChooseUs");

  return (
    <section className="bg-card py-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Image */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/hero-3.jpg"
            alt={t("heroAlt")}
            fill
            style={{ objectFit: "cover" }}
            className="transform hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right Side: Features */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            {t("title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Feature
              iconSrc="/guide-icon.svg"
              title={t("guideTitle")}
              description={t("guideDesc")}
            />
            <Feature
              iconSrc="/flexible-icon.svg"
              title={t("flexibleTitle")}
              description={t("flexibleDesc")}
            />
            <Feature
              iconSrc="/price-icon.svg"
              title={t("priceTitle")}
              description={t("priceDesc")}
            />
            <Feature
              iconSrc="/support-icon.svg"
              title={t("supportTitle")}
              description={t("supportDesc")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
