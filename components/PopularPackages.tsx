// components/PopularPackages.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PackageCard = ({ imgSrc, title, description }: { imgSrc: string; title: string; description: string; }) => (
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
      <Link href="#" className="inline-block mt-4 text-primary font-semibold hover:underline">
        Learn More →
      </Link>
    </div>
  </div>
);

const PopularPackages: React.FC = () => (
  <section className="bg-white py-16">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Explore Our Popular Packages</h2>
        <p className="text-gray-600 mt-2">Curated itineraries for the best experience in Yogyakarta.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <PackageCard
          imgSrc="/hero-1.jpg"
          title="2 Days: Borobudur & Prambanan"
          description="Witness the majestic sunrise at Borobudur and explore the grand Prambanan temple complex."
        />
        <PackageCard
          imgSrc="/hero-2.jpg"
          title="3 Days: Yogyakarta Adventure"
          description="Experience the thrill of Jomblang Cave, Timang Beach, and the slopes of Merapi Volcano."
        />
        <PackageCard
          imgSrc="/hero-3.jpg"
          title="4 Days: Cultural Immersion"
          description="Dive deep into Jogja's culture with visits to the Sultan's Palace, Taman Sari, and a batik workshop."
        />
      </div>
    </div>
  </section>
);

export default PopularPackages;