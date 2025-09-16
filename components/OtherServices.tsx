// components/OtherServices.tsx
"use client"; // Make it a client component to use hooks

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './ThemeProvider'; // Import useTheme hook

const ServiceCard = ({ icon, title, description, href }: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col text-center items-center h-full border-t-4 border-primary hover:shadow-xl transition-shadow duration-300">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <Image src={icon} alt={`${title} icon`} width={48} height={48} />
    </div>
    <h3 className="text-xl font-bold mb-2 text-black dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{description}</p>
    <Link href={href} className="mt-auto inline-block px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
      Lihat Detail
    </Link>
  </div>
);

const OtherServices = () => {
  const { theme } = useTheme(); // Get the current theme

  // Conditionally set classes for background and text colors
  const sectionClasses = theme === 'regular'
    ? "bg-white text-black"
    : "bg-black text-white"; // Changed to bg-black for exclusive

  const subtextClasses = theme === 'regular'
    ? "text-gray-600"
    : "text-gray-300";

  return (
    <section className={`${sectionClasses} py-16 transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Jelajahi Layanan Kami Lainnya</h2>
          <p className={`${subtextClasses} mt-2`}>Semua yang Anda butuhkan untuk perjalanan yang lengkap dan fleksibel.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard
            icon="/other-service/packages-icon.svg"
            title="Paket Wisata"
            description="Pilih dari paket wisata pilihan kami untuk liburan tanpa repot. Kami telah menggabungkan destinasi dan aktivitas terbaik."
            href="/packages"
          />
          <ServiceCard
            icon="/car-icon.svg"
            title="Sewa Kendaraan"
            description="Jelajahi Yogyakarta dengan bebas menggunakan armada kami yang terawat, tersedia dengan atau tanpa sopir."
            href="/car-rental"
          />
          <ServiceCard
            icon="/tour-icon.svg"
            title="Aktivitas Harian"
            description="Sudah punya rencana? Pesan aktivitas atau tur harian secara terpisah, mulai dari kelas memasak hingga jeep volcano."
            href="/activities"
          />
        </div>
      </div>
    </section>
  );
};

export default OtherServices;