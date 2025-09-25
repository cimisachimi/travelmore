// app/activities/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { activities } from "@/data/activities";
import type { Activity } from "@/data/activities";

// --- Helper Icon Components (no changes) ---
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

// --- Reusable UI Components (no changes) ---
const KeyFeature = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-foreground/80">{label}</p>
      <p className="font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4">
        <span className="font-semibold text-foreground">{q}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-foreground/80">
          <p>{a}</p>
        </div>
      )}
    </div>
  );
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="py-8">
    <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b-2 border-primary inline-block">{title}</h2>
    <div className="mt-4">{children}</div>
  </div>
);


export default function ActivityDetailPage() {
  const { theme } = useTheme();
  const { id } = useParams();
  const activity = activities.find((a: Activity) => a.id.toString() === id);

  if (!activity) {
    return <div className="p-10 text-center">Activity not found.</div>;
  }

  const price = theme === 'regular' ? activity.regularPrice : activity.exclusivePrice;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Left & Center Column: Activity Details */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-80 lg:h-[450px] rounded-lg overflow-hidden shadow-lg mb-6">
              <Image src={activity.image} alt={activity.title} fill className="object-cover" />
            </div>
            <span className="inline-block bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full mb-3">{activity.category}</span>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{activity.title}</h1>
            
            <div className="flex flex-wrap gap-8 my-6 border-y border-border py-4">
              <KeyFeature icon={<LocationIcon />} label="Location" value={activity.location} />
              <KeyFeature icon={<ClockIcon />} label="Duration" value={activity.duration} />
            </div>

            <DetailSection title="Overview">
              <p className="text-foreground/80 leading-relaxed mb-6">{activity.description}</p>
              <h3 className="text-lg font-bold text-foreground mb-3">Highlights</h3>
              <ul className="space-y-2 mb-6">
                {activity.highlights.map(item => <li key={item} className="flex items-center"><CheckCircleIcon /> <span className="ml-2 text-foreground/80">{item}</span></li>)}
              </ul>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">Termasuk</h3>
                  <ul className="space-y-2">
                    {activity.includes.map(item => <li key={item} className="flex items-center"><CheckCircleIcon /> <span className="ml-2 text-foreground/80">{item}</span></li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">Tidak Termasuk</h3>
                  <ul className="space-y-2">
                    {activity.excludes.map(item => <li key={item} className="flex items-center"><XCircleIcon /> <span className="ml-2 text-foreground/80">{item}</span></li>)}
                  </ul>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Pertanyaan Umum (FAQ)">
              <div className="space-y-2">
                {activity.faqs.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
              </div>
            </DetailSection>

            {/* --- ✨ UPDATED MAP SECTION --- */}
            <DetailSection title="Lokasi">
              <iframe
                src={activity.mapLink}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
              ></iframe>
            </DetailSection>

          </div>

          {/* Right Column: Booking Card (no changes) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sticky top-28">
              <h3 className="text-xl font-bold mb-4 text-foreground">Pesan Aktivitas Ini</h3>
              <div className="mb-6">
                <p className="text-sm text-foreground/80">Mulai dari</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(price)}</p>
              </div>
              <Link 
                href={`/booking?activity=${encodeURIComponent(activity.title)}`}
                className="w-full block text-center bg-primary text-black font-bold py-3 rounded-lg hover:brightness-90 transition transform hover:scale-105"
              >
                Pesan Sekarang
              </Link>
              <p className="text-xs text-center text-foreground/60 mt-4">
                Anda akan diarahkan ke formulir pemesanan untuk melengkapi detail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}