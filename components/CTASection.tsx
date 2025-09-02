// components/CTASection.tsx
import React from 'react';
import Link from 'next/link';

const CTASection: React.FC = () => (
  <section className="bg-secondary">
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <h2 className="text-3xl font-bold text-black">Ready for Your Next Adventure?</h2>
      <p className="text-gray-800 mt-2 mb-6">Let our experts help you craft the perfect Yogyakarta itinerary.</p>
      <Link
        href="/contact"
        className="inline-block px-10 py-4 rounded-lg bg-primary text-black font-bold text-lg hover:brightness-90 transition-all transform hover:scale-105"
      >
        Plan Your Trip with Us
      </Link>
      <p className="text-sm text-gray-700 mt-4">
        Or contact us directly via <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-black">WhatsApp</a>.
      </p>
    </div>
  </section>
);

export default CTASection;