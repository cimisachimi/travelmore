"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';

const ServiceCard = ({ icon, title, description, href }: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) => {
  const { theme } = useTheme();

  // Menentukan warna tombol berdasarkan tema
  const buttonClasses = theme === 'regular'
    ? "bg-primary text-black hover:bg-opacity-80"
    : "bg-gray-700 text-white hover:bg-gray-600";
  
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col text-center items-center h-full border-t-4 border-primary hover:shadow-xl transition-shadow duration-300">
      {/* Container ikon dengan latar belakang primary */}
      <div className="bg-primary/20 p-4 rounded-full mb-4">
        {/* Menggunakan filter CSS untuk mengubah warna SVG menjadi primary */}
        <Image 
          src={icon} 
          alt={`${title} icon`} 
          width={48} 
          height={48} 
          className="text-primary" // Tambahkan kelas ini
        />
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-foreground/70 mb-6 flex-grow">{description}</p>
      <Link 
        href={href} 
        className={`mt-auto inline-block px-6 py-2 rounded-lg font-semibold transition-colors ${buttonClasses}`}
      >
        Lihat Detail
      </Link>
    </div>
  );
};

const OtherServices = () => {
  return (
    <section className="bg-background text-foreground py-16 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Jelajahi Layanan Kami Lainnya</h2>
          <p className="text-foreground/70 mt-2">Semua yang Anda butuhkan untuk perjalanan yang lengkap dan fleksibel.</p>
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