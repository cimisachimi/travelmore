// components/ServiceHighlights.tsx
import React from "react";
import Image from "next/image";

// Reusable card component for a consistent design
const ServiceCard = ({ iconSrc, title, features, description }: { iconSrc: string; title: string; features: string; description: string; }) => (
  <div className="
    bg-white rounded-lg shadow-lg p-6
    border border-transparent hover:border-primary
    transform hover:-translate-y-2 transition-all duration-300
    flex flex-col
  ">
    <div className="flex-shrink-0">
      <Image
        src={iconSrc}
        alt={`${title} icon`}
        width={48}
        height={48}
        className="mb-4 text-primary" // Use text-primary to color the SVG via currentColor
      />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm font-semibold text-gray-500 mb-3">{features}</p>
    </div>
    <div className="flex-grow">
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

// Main section component
const ServiceHighlights: React.FC = () => (
  <section className="bg-gray-50 py-16">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-2">Our Service Highlights</h2>
      <p className="text-gray-600 mb-12">
        We offer a range of services to make your trip unforgettable.
      </p>

      {/* Grid for the service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard
          iconSrc="/package-icon.svg"
          title="Complete Package"
          features="Travel + Hotel/Homestay + Activities"
          description="Perfect for those who want a stress-free vacation with everything arranged from start to finish."
        />
        <ServiceCard
          iconSrc="/tour-icon.svg"
          title="Travel Only"
          features="Guided Tours, Cultural Experiences, Day Trips"
          description="Already have your stay covered? Join our expertly guided local tours and immerse yourself in the culture."
        />
        <ServiceCard
          iconSrc="/car-icon.svg"
          title="Car Rental"
          features="With or Without Driver"
          description="Enjoy the flexibility to explore Yogyakarta at your own pace with our reliable and well-maintained vehicles."
        />
      </div>
    </div>
  </section>
);

export default ServiceHighlights;