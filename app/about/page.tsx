// app/about/page.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

// --- Reusable Components for this Page ---

// Statistic Item Component
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-4xl font-bold text-primary">{value}</p>
    <p className="text-sm text-foreground/80 mt-1">{label}</p>
  </div>
);

// Skill Bar Component
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


// --- Main About Us Page Component ---
export default function AboutPage() {
  const { theme } = useTheme();
  const isExclusive = theme === "exclusive";

  return (
    <main className="bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-60 md:h-80 flex items-center justify-center text-center text-white">
        <Image 
          src="/hero-1.jpg" // Using an existing relevant image
          alt="Prambanan Temple" 
          layout="fill" 
          objectFit="cover" 
          className="absolute inset-0 z-0" 
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-5xl font-bold">Tentang Kami</h1>
          <p className="text-lg mt-2">Beranda / Tentang Kami</p>
        </div>
      </section>
      
      {/* Main Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Image */}
            <div className="relative h-80 lg:h-[450px] w-full rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/hero-3.jpg" // Using an existing relevant image from your project
                alt="Tim Travelmore"
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Right Column: Text Content */}
            <div>
              <p className="font-semibold text-primary mb-2">TENTANG KAMI</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {isExclusive ? "Menciptakan Perjalanan Premium Tak Terlupakan" : "Kami Selalu Memberikan yang Terbaik"}
              </h2>
              <p className="text-foreground/80 mb-6">
                Travelmore.travel lahir dari kecintaan mendalam terhadap pesona Yogyakarta. Kami bukan sekadar agen perjalanan, melainkan rekan Anda dalam merancang setiap detail liburan impian. Dengan pengetahuan lokal yang kaya dan semangat untuk memberikan pelayanan terbaik, kami berkomitmen untuk membuat perjalanan Anda di Yogyakarta terasa personal dan tak terlupakan.
              </p>
              <Link 
                href="/contact" 
                className="inline-block px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105 shadow-lg"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Stats Section */}
      <section className="bg-card py-16 lg:py-24 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Column: Our Skills */}
            <div>
              <p className="font-semibold text-primary mb-2">KEAHLIAN KAMI</p>
              <h2 className="text-3xl font-bold text-foreground mb-4">Fokus Pada Kepuasan Anda</h2>
              <p className="text-foreground/80 mb-8">
                Dengan pengalaman bertahun-tahun, kami mengasah keahlian kami untuk memastikan setiap aspek perjalanan Anda tertangani dengan sempurna.
              </p>
              <div className="space-y-6">
                <SkillBar skill="Perencanaan Itinerary" percentage="95%" />
                <SkillBar skill="Pengetahuan Lokal" percentage="98%" />
                <SkillBar skill="Layanan Pelanggan" percentage="92%" />
              </div>
            </div>

            {/* Right Column: Statistics */}
            <div className="grid grid-cols-2 gap-8">
              <StatItem value="5+" label="Tahun Pengalaman" />
              <StatItem value="1,000+" label="Perjalanan Terlaksana" />
              <StatItem value="300+" label="Klien Puas" />
              <StatItem value="24/7" label="Dukungan Pelanggan" />
            </div>

          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="relative py-20 text-center text-white">
        <Image 
          src="/hero-2.jpg" // Using an existing relevant image
          alt="Tugu Yogyakarta" 
          layout="fill" 
          objectFit="cover" 
          className="absolute inset-0 z-0" 
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Kami Siap Membawa Anda ke Destinasi Impian</h2>
          <p className="mb-8 max-w-2xl mx-auto">Biarkan kami yang mengurus detailnya, Anda tinggal menikmati setiap momennya.</p>
          <Link 
            href="/planner" 
            className="inline-block px-10 py-4 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105 shadow-lg"
          >
            Mulai Rencanakan
          </Link>
        </div>
      </section>

    </main>
  );
}