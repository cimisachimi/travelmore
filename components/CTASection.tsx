// components/CTASection.tsx
import React from 'react';
import { Button } from './ui/Button';

const CTASection: React.FC = () => (
  <section className="bg-secondary">
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <h2 className="text-3xl font-bold text-black font-serif">Siap untuk Petualangan Berikutnya?</h2>
      <p className="text-gray-800 mt-2 mb-6">Biarkan ahli kami membantu Anda menyusun itinerary Yogyakarta yang sempurna.</p>

      <Button href="/contact" className="text-lg px-10 py-4">
        Rencanakan Perjalanan Anda Bersama Kami
      </Button>

      <p className="text-sm text-gray-700 mt-4">
        Atau hubungi kami langsung melalui <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-black">WhatsApp</a>.
      </p>
    </div>
  </section>
);

export default CTASection;