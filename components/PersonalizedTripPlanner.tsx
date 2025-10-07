// components/PersonalizedTripPlanner.tsx
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { useTranslations } from "next-intl";

const CustomizationFactor = ({
  iconSrc,
  text,
}: {
  iconSrc: string;
  text: string;
}) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0 bg-primary/20 p-2 rounded-full">
      <Image src={iconSrc} alt={`${text} icon`} width={20} height={20} />
    </div>
    <span className="text-foreground/90">{text}</span>
  </div>
);

const PersonalizedTripPlanner: React.FC = () => {
  const { theme } = useTheme();
  const isExclusive = theme === "exclusive";
  const t = useTranslations("PersonalizedTripPlanner");

  return (
    <section className="bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Kolom Kiri: Deskripsi Layanan */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            {isExclusive ? t("exclusiveTitle") : t("regularTitle")}
          </h2>

          <p className="text-foreground/80 mb-6">
            {isExclusive ? t("exclusiveDesc") : t("regularDesc")}
          </p>

          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {t("customizeBasedOn")}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <CustomizationFactor
              iconSrc="/interests-icon.svg"
              text={t("interests")}
            />
            <CustomizationFactor
              iconSrc="/budget-icon.svg"
              text={t("budget")}
            />
            <CustomizationFactor
              iconSrc="/group-size-icon.svg"
              text={t("groupSize")}
            />
            <CustomizationFactor
              iconSrc="/trip-icon.svg"
              text={t("tripStyle")}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {t("extraServicesTitle")}
            </h3>
            <p className="text-foreground/80">
              {t.rich("extraServicesDesc", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
          </div>

          <Link
            href="/planner"
            className="inline-block mt-8 px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105 shadow-lg"
          >
            {isExclusive ? t("exclusiveButton") : t("regularButton")}
          </Link>
        </div>

        {/* Kolom Kanan: Gambar */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-2xl">
          <Image
            src={isExclusive ? "/hero-3.jpg" : "/hero-1.jpg"}
            alt={t("heroAlt")}
            fill
            className="object-cover transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
};

export default PersonalizedTripPlanner;
