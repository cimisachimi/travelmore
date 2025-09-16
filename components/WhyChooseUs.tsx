// components/WhyChooseUs.tsx
import React from 'react';
import Image from 'next/image';

const Feature = ({ iconSrc, title, description }: { iconSrc: string; title: string; description: string; }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 bg-primary/20 p-3 rounded-full">
      <Image src={iconSrc} alt={`${title} icon`} width={24} height={24} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-foreground/80 mt-1">{description}</p>
    </div>
  </div>
);

const WhyChooseUs: React.FC = () => (
  <section className="bg-card py-16">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {/* Left Side: Image */}
      <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/hero-3.jpg"
          alt="Wisatawan bahagia"
          fill
          style={{ objectFit: 'cover' }}
          className="transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Right Side: Features */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-foreground">Mengapa Memilih Kami?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Feature
            iconSrc="/guide-icon.svg"
            title="Pemandu Lokal Ahli"
            description="Pemandu kami adalah penduduk lokal yang akan memberi Anda pengalaman otentik."
          />
          <Feature
            iconSrc="/flexible-icon.svg"
            title="Paket Fleksibel"
            description="Sesuaikan perjalanan Anda dengan minat dan anggaran melalui rencana kami yang dapat disesuaikan."
          />
          <Feature
            iconSrc="/price-icon.svg"
            title="Harga Terjangkau"
            description="Kami menawarkan harga yang kompetitif tanpa mengorbankan kualitas layanan."
          />
          <Feature
            iconSrc="/support-icon.svg"
            title="Dukungan 24/7"
            description="Tim kami selalu siap membantu Anda, memastikan perjalanan yang lancar dan bebas khawatir."
          />
        </div>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;