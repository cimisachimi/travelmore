// app/[locale]/planner/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { useTheme } from "@/components/ThemeProvider";
import ComparisonSection from "@/components/ComparisonSection";
import PlannerForm from "./PlannerForm"; // Pastikan path ini benar

// --- Helper Icons (Tetap sama) ---
const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-6 h-6 flex-shrink-0 text-primary ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);

// --- Main Planner Page Component ---
export default function PlannerPage() {
  const t = useTranslations("PlannerPage");
  const { theme } = useTheme();
  const [showForm, setShowForm] = useState(false);

  const themeKey = theme === "exclusive" ? "exclusive" : "regular";

  const currentContent = {
    title: t(`${themeKey}.title`),
    description: t(`${themeKey}.description`),
    price: t(`${themeKey}.price`),
    ctaText: t(`${themeKey}.ctaText`),
    image: themeKey === "exclusive" ? "/hero-3.jpg" : "/hero-1.jpg",
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featureKeys = Object.keys(t.raw(`${themeKey}.features` as any));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const termKeys = Object.keys(t.raw(`${themeKey}.terms` as any));
  const workflowKeys = Object.keys(t.raw('workflow'));

  const handleCtaClick = () => {
    setShowForm(true);
    window.scrollTo(0, 0); // Scroll ke atas saat form muncul
  };

  const handleBackToInfo = () => {
    setShowForm(false);
    window.scrollTo(0, 0); // Scroll ke atas saat kembali
  };

  return (
    <main className="bg-background text-foreground transition-colors duration-300">
      {/* ===== LOGIKA UTAMA DIPINDAH KE SINI ===== */}
      {showForm ? (
        // --- TAMPILAN FORM (SEKARANG FULL-WIDTH) ---
        <>
          {/* PlannerForm dirender langsung tanpa pembungkus pembatas lebar */}
          <PlannerForm />
          
          {/* Tombol kembali diletakkan di luar, bisa diberi wrapper untuk styling */}
          <div className="w-full text-center pb-16">
            <button
              onClick={handleBackToInfo}
              className="mt-8 text-sm text-gray-500 hover:underline"
            >
              {t("backButton")}
            </button>
          </div>
        </>
      ) : (
        // --- TAMPILAN INFORMASI AWAL (TETAP DI TENGAH DENGAN CONTAINER) ---
        <section className="container mx-auto px-4 py-16 space-y-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {currentContent.title}
              </h1>
              <p className="text-foreground/80 mb-6 text-lg">
                {currentContent.description}
              </p>
              <div className="bg-card p-6 rounded-lg shadow-md mb-8 border border-border">
                <ul className="space-y-4">
                  {featureKeys.map((key) => (
                    <li key={key} className="flex items-center">
                      <CheckIcon className="mr-3" />
                      <span className="font-medium">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`${themeKey}.features.${key}` as any)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary">
                  {currentContent.price}
                </p>
              </div>
              <div className="mb-8">
                <h2 className="font-semibold mb-3">{t("termsTitle")}</h2>
                <ul className="space-y-2">
                  {termKeys.map((key) => (
                    <li
                      key={key}
                      className="text-foreground/70 text-sm list-disc list-inside"
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(`${themeKey}.terms.${key}` as any)}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleCtaClick}
                className="inline-block px-10 py-4 rounded-lg bg-primary text-black text-lg font-bold hover:brightness-90 transition-all transform hover:scale-105 shadow-lg"
              >
                {currentContent.ctaText}
              </button>
            </div>
            <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={currentContent.image}
                alt={currentContent.title}
                fill
                className="object-cover transition-all duration-500 transform hover:scale-105"
              />
            </div>
          </div>

          <section className="bg-background rounded-lg shadow-xl p-8 md:p-12 border border-border transition-colors duration-300">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">
              {t("workflowTitle")}
            </h2>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-foreground/20 transform -translate-x-1/2"></div>
              <div className="space-y-8">
                {workflowKeys.map((key, index) => (
                  <div
                    key={key}
                    className="relative grid grid-cols-2 gap-12 items-center"
                  >
                    <div className="absolute left-1/2 transform -translate-x-1/2 bg-primary text-black w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md z-10">
                      {index + 1}
                    </div>
                    {index % 2 === 0 ? (
                      <>
                        <div className="pr-12 text-right">
                          <h3 className="text-xl font-semibold text-primary mb-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {t(`workflow.${key}.title` as any)}
                          </h3>
                          <p className="text-foreground/70">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {t(`workflow.${key}.description` as any)}
                          </p>
                        </div>
                        <div></div>
                      </>
                    ) : (
                      <>
                        <div></div>
                        <div className="pl-12 text-left">
                          <h3 className="text-xl font-semibold text-primary mb-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {t(`workflow.${key}.title` as any)}
                          </h3>
                          <p className="text-foreground/70">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {t(`workflow.${key}.description` as any)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <ComparisonSection />
        </section>
      )}
    </main>
  );
}