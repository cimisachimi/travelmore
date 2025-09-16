// components/ComparisonSection.tsx
"use client"; // Diperlukan untuk menggunakan hook seperti useTheme
import React from 'react';

// --- Helper Icons ---
const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`w-6 h-6 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const DashIcon = () => (
  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

// --- Component Data ---
// Menggunakan 'text-primary' karena warnanya akan berubah sesuai tema
const comparisonData = [
  { feature: "Itinerary yang Dipersonalisasi", regular: <CheckIcon className="text-primary" />, exclusive: <CheckIcon className="text-primary" /> },
  { feature: "Revisi Itinerary", regular: "1 Sesi", exclusive: "Tanpa Batas" },
  { feature: "Pemesanan Akomodasi", regular: <DashIcon />, exclusive: <CheckIcon className="text-primary" /> },
  { feature: "Pemesanan Tiket & Transportasi", regular: <DashIcon />, exclusive: <CheckIcon className="text-primary" /> },
  { feature: "Travel Designer Khusus", regular: <DashIcon />, exclusive: <CheckIcon className="text-primary" /> },
  { feature: "Dukungan 24/7 Selama Perjalanan", regular: <DashIcon />, exclusive: <CheckIcon className="text-primary" /> },
];

// --- Main Component ---
const ComparisonSection = () => (
  <section className="bg-background py-16">
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-card rounded-lg shadow-xl p-6 border border-border">
        <h3 className="text-2xl font-bold text-center mb-6 text-foreground">Perbandingan Layanan</h3>
        <div className="grid grid-cols-3 gap-2 text-center font-semibold text-foreground">
          <div className="p-2 text-left">Fitur</div>
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-t-md">Regular</div>
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-t-md">Exclusive</div>
        </div>
        {comparisonData.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 text-center items-center border-t border-border">
            <div className="p-3 text-left text-sm text-foreground/80">{item.feature}</div>
            <div className="p-3 flex justify-center items-center font-bold text-foreground">{item.regular}</div>
            <div className="p-3 flex justify-center items-center font-bold text-foreground">{item.exclusive}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ComparisonSection;