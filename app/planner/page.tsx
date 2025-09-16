// app/planner/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import ComparisonSection from "@/components/ComparisonSection";

// --- Helper Icons ---
const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={`w-6 h-6 flex-shrink-0 ${className}`}
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
  const { theme } = useTheme();

  const isExclusive = theme === "exclusive";

  const content = {
    regular: {
      title: "Konsultasi Trip Planner",
      description:
        "Biarkan tim kami membantu menyusun rencana perjalanan sesuai budget, minat, dan gaya liburan Anda. Solusi tepat untuk perjalanan yang efisien dan berkesan.",
      features: [
        "Itinerary yang dipersonalisasi",
        "Rekomendasi akomodasi & aktivitas",
        "Optimisasi budget perjalanan",
      ],
      price: "Rp 250.000 / paket",
      terms: [
        "1x revisi itinerary",
        "Durasi layanan konsultasi: 7 hari",
        "Tidak termasuk biaya tiket, hotel, atau aktivitas",
      ],
      ctaText: "Pesan Konsultasi",
      image: "/hero-1.jpg",
    },
    exclusive: {
      title: "Exclusive Trip Planner Consultation",
      description:
        "Nikmati pengalaman perjalanan premium dengan itinerary yang dibuat khusus oleh senior travel designer kami. Dapatkan akses eksklusif dan layanan prioritas sepanjang perjalanan.",
      features: [
        "Revisi itinerary tanpa batas",
        "End-to-end booking (penerbangan, akomodasi premium, transportasi)",
        "Dedicated senior travel designer",
        "Layanan concierge 24/7 selama perjalanan",
        "Akses eksklusif & pengalaman lokal unik",
      ],
      price: "Rp 500.000 / paket",
      terms: [
        "Durasi layanan konsultasi: 30 hari",
        "Layanan premium & prioritas",
        "Tidak termasuk biaya tiket, hotel, atau aktivitas (dibayar terpisah)",
      ],
      ctaText: "Pesan Konsultasi Exclusive",
      image: "/hero-3.jpg",
    },
  };

  const currentContent = isExclusive ? content.exclusive : content.regular;

  const workflow = [
    {
      title: "Isi Formulir",
      description: "Ceritakan kebutuhan perjalanan Anda melalui formulir singkat kami.",
    },
    {
      title: "Diskusi Awal",
      description: "Tim planner kami akan menghubungi Anda untuk diskusi lebih lanjut.",
    },
    {
      title: "Penyusunan Itinerary",
      description: "Kami akan menyusun draf itinerary berdasarkan hasil diskusi.",
    },
    {
      title: "Revisi & Finalisasi",
      description: "Anda dapat memberikan masukan untuk penyempurnaan itinerary.",
    },
    {
      title: "Selamat Berlibur!",
      description: "Itinerary final di tangan Anda, selamat menikmati perjalanan!",
    },
  ];

  return (
    <main className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <section className="container mx-auto px-4 py-16 space-y-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              {currentContent.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              {currentContent.description}
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
              <ul className="space-y-4">
                {currentContent.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="text-primary mr-3" />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-2xl font-bold text-primary">
                {currentContent.price}
              </p>
            </div>

            {/* Terms */}
            <div className="mb-8">
              <h2 className="font-semibold text-black dark:text-white mb-3">
                Ketentuan:
              </h2>
              <ul className="space-y-2">
                {currentContent.terms.map((term, index) => (
                  <li
                    key={index}
                    className="text-gray-600 dark:text-gray-400 text-sm list-disc list-inside"
                  >
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/contact"
              className="inline-block px-10 py-4 rounded-lg bg-primary text-black text-lg font-bold hover:brightness-90 transition-all transform hover:scale-105 shadow-lg"
            >
              {currentContent.ctaText}
            </Link>
          </div>
          {/* Right Column: Image */}
          <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={currentContent.image}
              alt={currentContent.title}
              fill
              className="object-cover transition-all duration-500 transform hover:scale-105"
            />
          </div>
        </div>

        {/* Workflow Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-black dark:text-white text-center mb-10">
            Cara Kerja Layanan Konsultasi
          </h2>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>

            <div className="space-y-16">
              {workflow.map((step, index) => (
                <div key={index} className="relative grid grid-cols-2 gap-12 items-center">
                  {/* Step number (centered on line) */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-primary text-black w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md z-10">
                    {index + 1}
                  </div>

                  {/* Left side (even steps) */}
                  {index % 2 === 0 ? (
                    <>
                      <div className="pr-12 text-right">
                        <h3 className="text-xl font-semibold text-primary mb-2">
                          Langkah {index + 1}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>
                      <div></div> {/* empty placeholder for grid balance */}
                    </>
                  ) : (
                    <>
                      <div></div> {/* empty placeholder for grid balance */}
                      <div className="pl-12 text-left">
                        <h3 className="text-xl font-semibold text-primary mb-2">
                          Langkah {index + 1}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {step.description}
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
    </main>
  );
}