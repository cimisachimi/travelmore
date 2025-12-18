"use client";
import { useTranslations } from 'next-intl';

export default function DestinationsPage() {
  const t = useTranslations('footer.quickLinks');
  return (
    <div className="min-h-screen pt-28 pb-16 container mx-auto px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">{t('destinations')}</h1>
      <p className="text-gray-600">Halaman Destinasi (Sedang dibuat).</p>
    </div>
  );
}