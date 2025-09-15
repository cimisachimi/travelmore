// components/ComparisonSection.tsx
import React from 'react';

// --- Helper Icons ---
const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`w-6 h-6 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const DashIcon = () => (
  <svg className="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

// --- Component Data ---
const comparisonData = [
  { feature: "Personalized Itinerary", regular: <CheckIcon className="text-primary" />, exclusive: <CheckIcon className="text-premium-secondary" /> },
  { feature: "Itinerary Revisions", regular: "1 Session", exclusive: "Unlimited" },
  { feature: "Accommodation Booking", regular: <DashIcon />, exclusive: <CheckIcon className="text-premium-secondary" /> },
  { feature: "Flight & Transport Booking", regular: <DashIcon />, exclusive: <CheckIcon className="text-premium-secondary" /> },
  { feature: "Dedicated Travel Designer", regular: <DashIcon />, exclusive: <CheckIcon className="text-premium-secondary" /> },
  { feature: "24/7 On-Trip Support", regular: <DashIcon />, exclusive: <CheckIcon className="text-premium-secondary" /> },
];

// --- Main Component ---
const ComparisonSection = () => (
  <section className="bg-gray-50 py-16">
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-2xl font-bold text-center mb-6 text-black">Service Comparison</h3>
        <div className="grid grid-cols-3 gap-2 text-center font-semibold text-black">
          <div className="p-2 text-left">Feature</div>
          <div className="p-2 bg-gray-100 rounded-t-md">Regular</div>
          <div className="p-2 bg-gray-100 rounded-t-md">Exclusive</div>
        </div>
        {comparisonData.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 text-center items-center border-t border-gray-200">
            <div className="p-3 text-left text-sm text-gray-700">{item.feature}</div>
            <div className="p-3 flex justify-center items-center font-bold text-gray-800">{item.regular}</div>
            <div className="p-3 flex justify-center items-center font-bold text-gray-800">{item.exclusive}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ComparisonSection;