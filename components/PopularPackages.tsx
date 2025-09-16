// components/PopularPackages.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PackageCard = ({ id, imgSrc, title, description }: { id: string; imgSrc: string; title: string; description: string; }) => (
  <div className="relative rounded-lg overflow-hidden shadow-lg group">
    <Image
      src={imgSrc}
      alt={title}
      width={400}
      height={500}
      className="object-cover w-full h-96 transform group-hover:scale-110 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-6 text-white">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-gray-300 mt-2">{description}</p>
      <Link href={`/packages/${id}`} className="inline-block mt-4 text-primary font-semibold hover:underline">
        Lihat Detail →
      </Link>
    </div>
  </div>
);

const PopularPackages: React.FC = () => (
  <section className="bg-background py-16">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground">Jelajahi Paket Populer Kami</h2>
        <p className="text-foreground/80 mt-2">Itinerary pilihan untuk pengalaman terbaik di Yogyakarta.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <PackageCard
          id="borobudur-prambanan"
          imgSrc="/hero-1.jpg"
          title="2 Hari: Borobudur & Prambanan"
          description="Saksikan matahari terbit yang megah di Borobudur dan jelajahi kompleks Candi Prambanan yang agung."
        />
        <PackageCard
          id="yogyakarta-adventure"
          imgSrc="/hero-2.jpg"
          title="3 Hari: Petualangan Yogyakarta"
          description="Rasakan sensasi Goa Jomblang, Pantai Timang, dan lereng Gunung Merapi."
        />
        <PackageCard
          id="cultural-immersion"
          imgSrc="/hero-3.jpg"
          title="4 Hari: Pendalaman Budaya"
          description="Selami budaya Jogja dengan kunjungan ke Keraton, Taman Sari, dan lokakarya batik."
        />
      </div>
    </div>
  </section>
);

export default PopularPackages;