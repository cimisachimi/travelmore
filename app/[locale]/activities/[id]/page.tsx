"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { activities } from "@/data/activities";
import type { Activity } from "@/data/activities";
import { useTranslations } from "next-intl";

// --- Komponen-Komponen Kecil (Sub-components) ---

const Breadcrumbs = ({ activityTitle, locale }: { activityTitle: string; locale: string | string[] | undefined }) => (
  <div className="container mx-auto px-4 pt-6">
    <nav className="text-sm text-foreground/60" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">
          <Link href={`/${locale}`} className="hover:underline">Home</Link>
        </li>
        <li className="flex items-center">
          <span className="mx-2">/</span>
          <Link href={`/${locale}/activities`} className="hover:underline capitalize">Activities</Link>
        </li>
        <li className="flex items-center">
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{activityTitle}</span>
        </li>
      </ol>
    </nav>
  </div>
);

const ActivityHeader = ({ title, category, imageSrc }: { title: string; category: string; imageSrc: string }) => (
  <>
    <div className="relative w-full h-80 lg:h-[450px] rounded-lg overflow-hidden shadow-lg mb-6">
      <Image src={imageSrc} alt={title} fill className="object-cover" />
    </div>
    <span className="inline-block bg-teal-600 text-white text-sm font-semibold px-3 py-1 rounded-md mb-3">
      {category}
    </span>
    <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{title}</h1>
  </>
);

const KeyFeatures = ({ location, duration }: { location: string; duration: string }) => {
  const t = useTranslations("activityDetail");
  return (
    <div className="flex flex-wrap gap-8 my-6 border-y border-border py-4">
      <div className="flex items-center space-x-3">
        <LocationIcon />
        <div>
          <p className="text-sm font-semibold text-foreground/80">{t("location")}</p>
          <p className="font-bold text-foreground">{location}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <ClockIcon />
        <div>
          <p className="text-sm font-semibold text-foreground/80">{t("duration")}</p>
          <p className="font-bold text-foreground">{duration}</p>
        </div>
      </div>
    </div>
  );
};

const BookingCard = ({ price, activityTitle, locale }: { price: number; activityTitle: string; locale: string | string[] | undefined }) => {
  const t = useTranslations("activityDetail");
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  return (
   
    <div className="bg-slate-800 shadow-xl rounded-lg p-6 sticky top-28 border border-slate-700">
      
    
      <h3 className="text-xl font-bold mb-4 text-white/90">{t("bookingTitle")}</h3>
      
      <div className="mb-6">
      
        <p className="text-sm text-slate-300">{t("startingFrom")}</p>
        <p className="text-3xl font-bold text-primary">{formatCurrency(price)}</p>
      </div>
      
      <Link
        href={`/${locale}/booking?activity=${encodeURIComponent(activityTitle)}`}
        className="w-full block text-center bg-primary text-black font-bold py-3 rounded-lg hover:brightness-90 transition transform hover:scale-105"
      >
        {t("bookNow")}
      </Link>

     
      <p className="text-xs text-center text-slate-400 mt-4">{t("bookingNote")}</p>
    </div>
  );
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="py-8">
    <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b-2 border-primary inline-block">{title}</h2>
    <div className="mt-4">{children}</div>
  </div>
);

const OverviewSection = ({ activity }: { activity: Activity }) => {
    const t = useTranslations("activityDetail");
    return (
        <DetailSection title={t("overview")}>
            <p className="text-foreground/80 leading-relaxed mb-6">{activity.description}</p>
            <h3 className="text-lg font-bold text-foreground mb-3">{t("highlights")}</h3>
            <ul className="space-y-2 mb-6">
                {activity.highlights.map(item => (
                    <li key={item} className="flex items-center">
                        <CheckCircleIcon /> <span className="ml-2 text-foreground/80">{item}</span>
                    </li>
                ))}
            </ul>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{t("includes")}</h3>
                    <ul className="space-y-2">
                        {activity.includes.map(item => (
                            <li key={item} className="flex items-center">
                                <CheckCircleIcon /> <span className="ml-2 text-foreground/80">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{t("excludes")}</h3>
                    <ul className="space-y-2">
                        {activity.excludes.map(item => (
                            <li key={item} className="flex items-center">
                                <XCircleIcon /> <span className="ml-2 text-foreground/80">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </DetailSection>
    );
};

const FaqSection = ({ faqs }: { faqs: { q: string, a: string }[] }) => {
  const t = useTranslations("activityDetail");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <DetailSection title={t("faqTitle")}>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-border">
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex justify-between items-center text-left py-4">
              <span className="font-semibold text-foreground">{faq.q}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-primary transition-transform ${openIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="pb-4 text-foreground/80">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </DetailSection>
  );
};


// --- Komponen Utama Halaman ---

export default function ActivityDetailPage() {
  const { theme } = useTheme();
  const params = useParams();
  const t = useTranslations("activityDetail");

  const activity = activities.find(a => a.id.toString() === params.id);

  if (!activity) {
    return <div className="p-10 text-center">{t("notFound")}</div>;
  }

  const price = theme === 'regular' ? activity.regularPrice : activity.exclusivePrice;

  return (
    <div className="bg-background">
      <Breadcrumbs activityTitle={activity.title} locale={params.locale} />

      <main className="container mx-auto px-4 pt-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Kolom Kiri: Detail Aktivitas */}
          <div className="lg:col-span-2">
            <ActivityHeader title={activity.title} category={activity.category} imageSrc={activity.image} />
            <KeyFeatures location={activity.location} duration={activity.duration} />
            <OverviewSection activity={activity} />
            <FaqSection faqs={activity.faqs} />
            <DetailSection title={t("locationMap")}>
              <iframe
                src={activity.mapLink}
                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
              ></iframe>
            </DetailSection>
          </div>

          {/* Kolom Kanan: Kartu Booking */}
          <div className="lg:col-span-1">
            <BookingCard price={price} activityTitle={activity.title} locale={params.locale} />
          </div>

        </div>
      </main>
    </div>
  );
}


// --- Definisi Ikon (diletakkan di bawah agar tidak mengganggu) ---

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);