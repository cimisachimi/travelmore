// app/[locale]/itinerary/page.tsx
import { useTranslations } from 'next-intl';
import SampleItineraries from '@/components/SampleItineraries'; // Import komponen Anda tadi


export const metadata = {
  title: 'Itinerary & Tour Packages - Travelmore',
  description: 'Explore our best curated travel packages in Yogyakarta.',
};

export default function ItineraryIndexPage() {
  const t = useTranslations('Itinerary');

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50"> 
      <div className="container mx-auto px-4">
        
        {/* Header Halaman */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{t('overview')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('schedule')}
          </p>
        </div>

       
        <SampleItineraries />

      </div>
    </div>
  );
}