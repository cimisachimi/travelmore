// app/[locale]/itinerary/[slug]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { 
  Clock, MapPin, CheckCircle2, CalendarDays, Users, 
  Utensils, Camera, ArrowLeft, Compass, Heart    
} from "lucide-react";
import { itinerariesData, ItineraryDay } from "@/data/itineraries";

const getDaysFromDuration = (durationStr: string) => {
  const match = durationStr.match(/(\d+)\s*Days?/i);
  return match ? match[1] : "";
};

export default async function ItineraryDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  
  
  const t = await getTranslations("Itinerary");
  const tData = await getTranslations("ItineraryData");


  const rawData = itinerariesData[slug];

  if (!rawData) {
    notFound();
  }

  // Tentukan bahasa konten (id atau en)
  const currentLang = (locale === "id" ? "id" : "en") as keyof typeof rawData.content;
  const content = rawData.content[currentLang];

  const daysValue = getDaysFromDuration(rawData.duration);
  const styleParams = rawData.styles.join(",");
  const personalityParams = rawData.personalities.join(",");

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* HEADER IMAGE */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={rawData.image}
          alt={content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col justify-end pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-white/80 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors"
          >
            <ArrowLeft size={20} /> {t("backHome")}
          </Link>

          <span className="text-primary font-bold tracking-wider uppercase mb-2 bg-primary/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full text-xs">
            Jogja Special Package
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 leading-tight">
            {content.title}
          </h1>

          <p className="text-xl text-white/90 font-serif italic max-w-2xl">
            &quot;{content.tagline}&quot;
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview Box */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-gray-100">
                {/* Duration */}
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Clock size={18} />
                    <span className="text-xs font-bold uppercase text-gray-400">
                      {t("duration")}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{rawData.duration}</p>
                </div>

                {/* Region */}
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <MapPin size={18} />
                    <span className="text-xs font-bold uppercase text-gray-400">
                      {t("region")}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">Yogyakarta</p>
                </div>

                {/* Genre */}
                <div>
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Compass size={18} />
                    <span className="text-xs font-bold uppercase text-gray-400">
                      {t("genre")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rawData.styles.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vibe */}
                <div>
                  <div className="flex items-center gap-2 text-red-500 mb-1">
                    <Heart size={18} />
                    <span className="text-xs font-bold uppercase text-gray-400">
                      {t("vibe")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rawData.personalities.slice(0, 2).map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("overview")}
              </h3>

              <p className="text-gray-600 leading-relaxed mb-6">
                {content.description}
              </p>

              {/* Highlights */}
              <h4 className="font-bold text-gray-900 mb-3">{t("highlights")}:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {content.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-primary flex-shrink-0"
                    />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CalendarDays className="text-primary" />
                {t("schedule")}
              </h3>

              <div className="space-y-6">
                {content.timeline.map((day: ItineraryDay) => (
                  <div key={day.day} className="flex gap-4 sm:gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg z-10 shrink-0">
                        {day.day}
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 my-2 -z-0" />
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-grow hover:shadow-md transition-shadow pb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        {t("day")} {day.day}: {day.title}
                      </h4>

                      <ul className="space-y-4">
                        {day.activities.map((act, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-gray-100 rounded-full text-gray-500">
                              {act.toLowerCase().includes("makan") || act.toLowerCase().includes("lunch") || act.toLowerCase().includes("dinner") ? (
                                <Utensils size={14} />
                              ) : act.toLowerCase().includes("foto") || act.toLowerCase().includes("photo") ? (
                                <Camera size={14} />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <span className="text-gray-600 text-sm md:text-base">
                              {act}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm mb-1">{t("estimatedPrice")}</p>
                  <h3 className="text-3xl font-bold text-primary">
                    {rawData.price}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2">
                    {t("priceNote")}
                  </p>
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/planner?dest=Yogyakarta&days=${daysValue}&base=${slug}&style=${styleParams}&personality=${personalityParams}&mode=custom`}
                    className="block w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-center transition-all shadow-lg shadow-primary/30 transform hover:scale-[1.02]"
                  >
                    {t("customizeBtn")}
                  </Link>

                  <p className="text-xs text-center text-gray-500 mt-2">
                    {t("customizeDesc")}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h5 className="font-bold text-gray-900 text-sm mb-3">
                    {t("includes")}
                  </h5>

                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {tData("facilities.transport")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {tData("facilities.hotel")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {tData("facilities.driver")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {tData("facilities.tickets")}
                    </li>
                  </ul>
                </div>
              </div>

              {/* HELP BOX */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4 flex gap-3 items-start">
                <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm">
                  <Users size={20} />
                </div>

                <div>
                  <h5 className="font-bold text-blue-900 text-sm">
                    {t("needHelp")}
                  </h5>
                  <p className="text-xs text-blue-700 mt-1">
                    {t("chatExpert")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}