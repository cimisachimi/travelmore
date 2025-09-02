// components/CustomExperience.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

// --- Reusable Components for this Section ---

const CheckboxOption = ({ id, name, label, checked, onChange }: { id: string; name: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
  <label htmlFor={id} className="flex items-center space-x-4 cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="relative flex items-center">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="appearance-none h-6 w-6 border-2 border-gray-300 rounded-md checked:bg-primary checked:border-primary transition-all duration-200"
      />
      {checked && (
        <svg className="absolute left-0.5 top-0.5 h-5 w-5 text-black pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </div>
    <span className="font-medium text-gray-800">{label}</span>
  </label>
);

const GenreCard = ({ iconSrc, label, isSelected, onSelect }: { iconSrc: string; label: string; isSelected: boolean; onSelect: () => void; }) => (
  <button
    onClick={onSelect}
    className={`
      p-4 rounded-lg text-left transition-all duration-300
      flex flex-col items-center justify-center space-y-2 border-2
      ${isSelected ? 'bg-primary/20 border-primary shadow-lg scale-105' : 'bg-white border-gray-200 hover:border-gray-300'}
    `}
  >
    <Image src={iconSrc} alt={`${label} icon`} width={32} height={32} />
    <span className="font-semibold text-gray-900">{label}</span>
  </button>
);

// --- Main Component ---

const CustomExperience: React.FC = () => {
  const [options, setOptions] = useState({
    hotel: true,
    activities: true,
    carRental: false,
  });

  const [travelGenre, setTravelGenre] = useState('Cultural');
  const [customRequests, setCustomRequests] = useState('');

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-2">Build Your Own Journey</h2>
          <p className="text-gray-600">Customize your experience by selecting the services and style you want.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side: Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
            {/* Step 1 */}
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">Step 1: Choose Your Services</h3>
              <div className="flex flex-col space-y-2">
                <CheckboxOption id="hotel" name="hotel" label="Include Hotel / Homestay" checked={options.hotel} onChange={handleCheckboxChange} />
                <CheckboxOption id="activities" name="activities" label="Include Activities & Tours" checked={options.activities} onChange={handleCheckboxChange} />
                <CheckboxOption id="carRental" name="carRental" label="Include Car Rental" checked={options.carRental} onChange={handleCheckboxChange} />
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">Step 2: Select Your Travel Style</h3>
              <div className="grid grid-cols-3 gap-4">
                <GenreCard iconSrc="/culture-icon.svg" label="Cultural" isSelected={travelGenre === 'Cultural'} onSelect={() => setTravelGenre('Cultural')} />
                <GenreCard iconSrc="/adventure-icon.svg" label="Adventure" isSelected={travelGenre === 'Adventure'} onSelect={() => setTravelGenre('Adventure')} />
                <GenreCard iconSrc="/culinary-icon.svg" label="Culinary" isSelected={travelGenre === 'Culinary'} onSelect={() => setTravelGenre('Culinary')} />
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">Step 3: Any Specific Places?</h3>
              <textarea
                value={customRequests}
                onChange={(e) => setCustomRequests(e.target.value)}
                placeholder="e.g., Borobudur Temple at sunrise..."
                className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition"
                rows={3}
              />
            </div>
          </div>

          {/* Right Side: Image and CTA */}
          <div className="flex flex-col items-center text-center">
            <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg mb-8">
              <Image
                src="/hero-3.jpg"
                alt="Custom travel experience"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <p className="text-lg text-gray-700 mb-4">Once you've made your selections, our team will craft a personalized itinerary and quote just for you.</p>
            <button className="w-full px-8 py-4 rounded-lg bg-primary text-black font-bold text-lg hover:brightness-90 transition-all transform hover:scale-105">
              Get My Custom Plan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomExperience;