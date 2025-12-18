"use client";
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('footer.contact');
  return (
    <div className="min-h-screen pt-28 pb-16 container mx-auto px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">{t('title')}</h1>
      <p className="text-gray-600">Halaman Kontak (Sedang dibuat).</p>
    </div>
  );
}