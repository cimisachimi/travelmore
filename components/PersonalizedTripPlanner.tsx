// components/PersonalizedTripPlanner.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CustomizationFactor = ({ iconSrc, text }: { iconSrc: string; text: string; }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0 bg-primary/20 p-2 rounded-full">
      <Image src={iconSrc} alt={`${text} icon`} width={20} height={20} />
    </div>
    <span className="text-gray-700">{text}</span>
  </div>
);

const PersonalizedTripPlanner: React.FC = () => (
  <section className="bg-white py-16">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

      {/* Kolom Kiri: Deskripsi Layanan */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Rencanakan Perjalanan Impian Anda di Jogja</h2>
        <p className="text-gray-600 mb-6">
          Lupakan paket wisata yang kaku. Kami merancang setiap detail perjalanan khusus untuk Anda.
          Dengan memahami profil unik Anda, kami akan menciptakan pengalaman di Yogyakarta yang tak terlupakan,
          sesuai dengan gaya dan anggaran Anda.
        </p>

        <h3 className="text-lg font-semibold mb-4">Kami menyesuaikan berdasarkan:</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <CustomizationFactor iconSrc="/interests-icon.svg" text="Keinginan & Hobi" />
          <CustomizationFactor iconSrc="/budget-icon.svg" text="Budget Perjalanan" />
          <CustomizationFactor iconSrc="/group-size-icon.svg" text="Jumlah Wisatawan" />
          <CustomizationFactor iconSrc="/trip-icon.svg" text="Genre & Gaya Trip" />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Layanan Tambahan:</h3>
          <p className="text-gray-700">Kami juga menyediakan **Jasa Sewa Kendaraan** (dengan atau tanpa sopir) untuk fleksibilitas maksimal selama Anda di Jogja.</p>
        </div>

        <Link
          href="/contact"
          className="inline-block mt-8 px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105"
        >
          Mulai Konsultasi Gratis
        </Link>
      </div>

      {/* Kolom Kanan: Gambar */}
      <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/hero-1.jpg"
          alt="Perencanaan Perjalanan di Yogyakarta"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  </section>
);

export default PersonalizedTripPlanner;