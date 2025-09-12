// app/services/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// --- Komponen yang Dapat Digunakan Kembali ---

// Ikon centang untuk daftar fitur
const CheckIcon = () => (
  <svg className="w-5 h-5 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

// Kartu layanan untuk tata letak 3 kolom
const ServiceCard = ({ icon, title, description, href }: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col text-center items-center h-full border-t-4 border-primary hover:shadow-xl transition-shadow duration-300">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <Image src={icon} alt={`${title} icon`} width={48} height={48} />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 flex-grow">{description}</p>
    <Link href={href} className="mt-auto inline-block px-6 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition-colors">
      Lihat Detail
    </Link>
  </div>
);


// --- Komponen Utama Halaman Layanan ---
export default function ServicesPage() {
  return (
    <main className="bg-gray-50">
      {/* Header */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Layanan Kami</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Dari konsultasi perjalanan pribadi hingga paket siap pakai, kami menyediakan semua yang Anda butuhkan untuk petualangan tak terlupakan di Yogyakarta.
        </p>
      </section>

      {/* Layanan Utama: Trip Planner (1 Kolom) */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              {/* Konten */}
              <div className="md:w-1/2 p-8 lg:p-12">
                <h2 className="text-3xl font-bold mb-4">Konsultasi Trip Planner</h2>
                <p className="text-gray-600 mb-6">
                  Tidak ingin paket yang biasa saja? Biarkan ahli lokal kami merancang itinerary yang sepenuhnya dipersonalisasi berdasarkan anggaran, minat, dan gaya perjalanan Anda. Sempurna untuk pengalaman yang unik dan tak terlupakan.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-start"><CheckIcon /><span>Itinerary yang dipersonalisasi</span></li>
                  <li className="flex items-start"><CheckIcon /><span>Rekomendasi akomodasi & aktivitas</span></li>
                  <li className="flex items-start"><CheckIcon /><span>Optimalisasi anggaran perjalanan</span></li>
                </ul>
                <Link href="/planner" className="inline-block px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all transform hover:scale-105">
                  Mulai Konsultasi Gratis
                </Link>
              </div>
              {/* Gambar */}
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <Image src="/hero-2.jpg" alt="Trip Planner" layout="fill" objectFit="cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Lainnya (3 Kolom) */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon="/package-icon.svg"
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
    </main>
  );
}