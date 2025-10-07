"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-4xl font-bold text-primary">{value}</p>
    <p className="text-sm text-foreground/80 mt-1">{label}</p>
  </div>
);

const SkillBar = ({ skill, percentage }: { skill: string; percentage: string }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-base font-medium text-foreground">{skill}</span>
      <span className="text-sm font-medium text-foreground/80">{percentage}</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div className="bg-primary h-2.5 rounded-full" style={{ width: percentage }}></div>
    </div>
  </div>
);

export default function AboutPage() {
  const { theme } = useTheme();
  const t = useTranslations("about");
  const isExclusive = theme === "exclusive";

  const textClass = theme === "regular" ? "text-gray-900" : "text-white";
  const textMutedClass = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const headerBgClass = theme === "regular" ? "bg-white" : "bg-gray-900";

  return (
    <main className="bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header
        className={`py-12 ${headerBgClass} border-b ${
          theme === "regular" ? "border-gray-200" : "border-gray-800"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className={`text-4xl md:text-5xl font-extrabold ${textClass}`}>
            {t("title")}
          </h1>
          <p className={`mt-4 text-lg max-w-2xl mx-auto ${textMutedClass}`}>
            {t("subtitle")}
          </p>
        </div>
      </header>

      {/* About Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative h-80 lg:h-[450px] w-full rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/hero-3.jpg"
                alt="Travelmore Team"
                fill
                className="object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div>
              <p className="font-semibold text-primary mb-2">{t("section.about.label")}</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {isExclusive ? t("section.about.exclusiveTitle") : t("section.about.regularTitle")}
              </h2>
              <p className="text-foreground/80 mb-6">{t("section.about.description")}</p>
              <Link
                href="/contact"
                className="inline-block px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105 shadow-lg"
              >
                {t("section.about.contactButton")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Stats */}
      <section className="bg-card py-16 lg:py-24 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="font-semibold text-primary mb-2">{t("section.skills.label")}</p>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("section.skills.title")}
              </h2>
              <p className="text-foreground/80 mb-8">
                {t("section.skills.description")}
              </p>
              <div className="space-y-6">
                <SkillBar skill={t("section.skills.itinerary")} percentage="95%" />
                <SkillBar skill={t("section.skills.localKnowledge")} percentage="98%" />
                <SkillBar skill={t("section.skills.customerService")} percentage="92%" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <StatItem value="5+" label={t("stats.experience")} />
              <StatItem value="1,000+" label={t("stats.trips")} />
              <StatItem value="300+" label={t("stats.clients")} />
              <StatItem value="24/7" label={t("stats.support")} />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 text-center text-white mb-16">
        <Image
          src="/hero-2.jpg"
          alt="Tugu Yogyakarta"
          fill
          className="absolute inset-0 z-0 object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("about_cta.title")}</h2>
          <p className="mb-8 max-w-2xl mx-auto">{t("about_cta.subtitle")}</p>
          <Link
            href="/planner"
            className="inline-block px-10 py-4 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105 shadow-lg"
          >
            {t("about_cta.button")}
          </Link>
        </div>
      </section>
    </main>
  );
}
