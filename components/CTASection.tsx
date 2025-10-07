
import React from 'react';
import { Button } from './ui/Button';
import { useTranslations } from 'next-intl';

const CTASection: React.FC = () => {
  const t = useTranslations('cta');

  return (
    <section className="bg-secondary">
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-3xl font-bold text-black font-serif">{t('title')}</h2>
        <p className="text-gray-800 mt-2 mb-6">{t('subtitle')}</p>

        <Button href="/contact" className="text-lg px-10 py-4">
          {t('button')}
        </Button>

        <p className="text-sm text-gray-700 mt-4">
          {t('contactText')}{' '}
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:text-black"
          >
            WhatsApp
          </a>.
        </p>
      </div>
    </section>
  );
};

export default CTASection;

