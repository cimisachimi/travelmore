
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';
import { useTranslations } from 'next-intl';

const ServiceCard = ({ icon, title, description, href, buttonLabel }: {
  icon: string;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
}) => {
  const { theme } = useTheme();

  const buttonClasses = theme === 'regular'
    ? "bg-primary text-black hover:bg-opacity-80"
    : "bg-gray-700 text-white hover:bg-gray-600";

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col text-center items-center h-full border-t-4 border-primary hover:shadow-xl transition-shadow duration-300">
      <div className="bg-primary/20 p-4 rounded-full mb-4">
        <Image
          src={icon}
          alt={`${title} icon`}
          width={48}
          height={48}
          className="text-primary"
        />
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-foreground/70 mb-6 flex-grow">{description}</p>
      <Link
        href={href}
        className={`mt-auto inline-block px-6 py-2 rounded-lg font-semibold transition-colors ${buttonClasses}`}
      >
        {buttonLabel}
      </Link>
    </div>
  );
};

const OtherServices = () => {
  const t = useTranslations('otherServices');

  return (
    <section className="bg-background text-foreground py-16 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-foreground/70 mt-2">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard
            icon="/other-service/packages-icon.svg"
            title={t('packages.title')}
            description={t('packages.description')}
            href="/packages"
            buttonLabel={t('packages.button')}
          />
          <ServiceCard
            icon="/car-icon.svg"
            title={t('carRental.title')}
            description={t('carRental.description')}
            href="/car-rental"
            buttonLabel={t('carRental.button')}
          />
          <ServiceCard
            icon="/tour-icon.svg"
            title={t('activities.title')}
            description={t('activities.description')}
            href="/activities"
            buttonLabel={t('activities.button')}
          />
        </div>
      </div>
    </section>
  );
};

export default OtherServices;

