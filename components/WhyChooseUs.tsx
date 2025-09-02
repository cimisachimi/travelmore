// components/WhyChooseUs.tsx
import React from 'react';
import Image from 'next/image';

const Feature = ({ iconSrc, title, description }: { iconSrc: string; title: string; description: string; }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 bg-primary/20 p-3 rounded-full">
      <Image src={iconSrc} alt={`${title} icon`} width={24} height={24} />
    </div>
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

const WhyChooseUs: React.FC = () => (
  <section className="bg-gray-50 py-16">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {/* Left Side: Image */}
      <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/hero-3.jpg"
          alt="Happy travelers"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Right Side: Features */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Feature
            iconSrc="/guide-icon.svg"
            title="Local Expert Guides"
            description="Our guides are passionate locals who bring you authentic experiences."
          />
          <Feature
            iconSrc="/flexible-icon.svg"
            title="Flexible Packages"
            description="Tailor your trip to your interests and budget with our customizable plans."
          />
          <Feature
            iconSrc="/price-icon.svg"
            title="Affordable Prices"
            description="We offer competitive pricing without compromising on quality or service."
          />
          <Feature
            iconSrc="/support-icon.svg"
            title="24/7 Support"
            description="Our team is always here to assist you, ensuring a smooth and worry-free trip."
          />
        </div>
      </div>
    </div>
  </section>
);

export default WhyChooseUs;