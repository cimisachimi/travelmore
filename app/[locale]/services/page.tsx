// app/[locale]/services/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslations } from 'next-intl'; // 1. Impor useTranslations

// --- Komponen Ikon Centang (Tidak berubah) ---
const CheckIcon = () => (
  <svg className="w-5 h-5 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

// --- Komponen Kartu Layanan (Diperbarui) ---
const ServiceCard = ({ icon, title, description, href, ctaText }: {
  icon: string;
  title: string;
  description: string;
  href: string;
  ctaText: string; // Tambahkan prop untuk teks tombol
}) => (
  <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col text-center items-center h-full border-t-4 border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <Image src={icon} alt={`${title} icon`} width={48} height={48} />
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-foreground/80 mb-6 flex-grow">{description}</p>
    <Link href={href} className="mt-auto inline-block px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-foreground font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
      {ctaText}
    </Link>
  </div>
);

// --- Komponen Utama Halaman Layanan ---
export default function ServicesPage() {
  const t = useTranslations('ServicesPage'); // 2. Inisialisasi hook
  const { theme } = useTheme();
  const isExclusive = theme === "exclusive";

  // 3. Tentukan kunci tema untuk akses dinamis
  const themeKey = isExclusive ? "exclusive" : "regular";

  return (
    <main className="bg-background transition-colors duration-500">
      {/* Header */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">{t('header_title')}</h1>
        <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
          {t('header_subtitle')}
        </p>
      </section>

      {/* Layanan Utama: Trip Planner */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="bg-card rounded-lg shadow-xl overflow-hidden border border-border">
            <div className="flex flex-col md:flex-row items-center">
              {/* Konten */}
              <div className="md:w-1/2 p-8 lg:p-12">
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  {t(`planner.${themeKey}_title`)}
                </h2>
                <p className="text-foreground/80 mb-6">
                  {t(`planner.${themeKey}_desc`)}
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-start"><CheckIcon /><span>{t(`planner.${themeKey}_f1`)}</span></li>
                  <li className="flex items-start"><CheckIcon /><span>{t(`planner.${themeKey}_f2`)}</span></li>
                  <li className="flex items-start"><CheckIcon /><span>{t(`planner.${themeKey}_f3`)}</span></li>
                </ul>
                <Link href="/planner" className="inline-block px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105">
                  {t(`planner.${themeKey}_cta`)}
                </Link>
              </div>
              {/* Gambar */}
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <Image src={isExclusive ? "/hero-3.jpg" : "/hero-2.jpg"} alt="Trip Planner" layout="fill" objectFit="cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Lainnya */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon="/package-icon.svg"
              title={t('otherServices.packages_title')}
              description={t('otherServices.packages_desc')}
              href="/packages"
              ctaText={t('card_cta')}
            />
            <ServiceCard
              icon="/car-icon.svg"
              title={t('otherServices.rental_title')}
              description={t('otherServices.rental_desc')}
              href="/car-rental"
              ctaText={t('card_cta')}
            />
            <ServiceCard
              icon="/tour-icon.svg"
              title={t('otherServices.activities_title')}
              description={t('otherServices.activities_desc')}
              href="/activities"
              ctaText={t('card_cta')}
            />
          </div>
        </div>
      </section>
    </main>
  );
}