// components/CTASection.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button'; // 1. Import the new component

const CTASection: React.FC = () => (
  <section className="bg-secondary">
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <h2 className="text-3xl font-bold text-black font-serif">Ready for Your Next Adventure?</h2>
      <p className="text-gray-800 mt-2 mb-6">Let our experts help you craft the perfect Yogyakarta itinerary.</p>

      {/* 2. Replace the old Link with the new Button component */}
      <Button href="/contact" className="text-lg px-10 py-4">
        Plan Your Trip with Us
      </Button>

      <p className="text-sm text-gray-700 mt-4">
        Or contact us directly via <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-black">WhatsApp</a>.
      </p>
    </div>
  </section>
);

export default CTASection;