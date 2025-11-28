// app/[locale]/itinerary/[slug]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  CalendarDays, 
  Users, 
  Utensils, 
  Camera,
  ArrowLeft
} from "lucide-react";

// --- Data Dummy (Bisa dipindah ke file terpisah) ---
const itinerariesData: Record<string, any> = {
  "3d2n-explorer": {
    title: "3D2N Yogyakarta Explorer",
    tagline: "The Perfect Introduction to Java's Soul",
    description: "Rasakan magisnya Yogyakarta dalam 3 hari. Mulai dari kemegahan Candi kuno hingga hiruk pikuk jalanan Malioboro yang legendaris.",
    image: "/jogja-1.WEBP", 
    duration: "3 Days 2 Nights",
    price: "Start from Rp 1.850.000 /pax",
    highlights: ["Sunrise Borobudur", "Sunset Prambanan", "Merapi Lava Tour", "Malioboro Street Food"],
    timeline: [
      {
        day: 1,
        title: "Arrival & Temple Run",
        activities: ["Penjemputan di YIA", "Makan Siang Sate Klathak", "Check-in Hotel", "Sunset Prambanan", "Makan Malam Gudeg"],
      },
      {
        day: 2,
        title: "Merapi Adventure & Heritage",
        activities: ["Sunrise Punthuk Setumbu", "Explore Borobudur", "Merapi Lava Tour", "Makan Siang Kopi Klotok", "Malioboro"],
      },
      {
        day: 3,
        title: "City Tour & Departure",
        activities: ["Sarapan & Checkout", "Tamansari & Keraton", "Oleh-oleh", "Drop Airport"],
      },
    ],
  },
  "4d3n-culture": {
    title: "4D3N Culture + Nature Trip",
    tagline: "Deep Dive into Javanese Culture & Scenic Nature",
    description: "Paket lengkap untuk pecinta budaya dan alam. Jelajahi museum terbaik, hutan pinus yang asri, dan pantai selatan yang eksotis.",
    image: "/jogja-2.WEBP",
    duration: "4 Days 3 Nights",
    price: "Start from Rp 2.500.000 /pax",
    highlights: ["Ullen Sentalu", "Timang Beach", "HeHa Sky View", "Keraton"],
    timeline: [
       { day: 1, title: "Highlands", activities: ["Ullen Sentalu", "Bhumi Merapi", "HeHa Sky View"] },
       { day: 2, title: "Gunung Kidul", activities: ["Gondola Timang", "Indrayanti Beach", "Pinus Pengger"] },
       { day: 3, title: "Heritage", activities: ["Keraton", "Kotagede Silver", "Warungboto", "Alun-alun Kidul"] },
       { day: 4, title: "Departure", activities: ["Manding Leather", "Bakpia", "Airport Transfer"] },
    ],
  },
  "2d1n-culinary": {
    title: "2D1N Culinary + Hidden Gems",
    tagline: "Short Escape for Foodies",
    description: "Liburan singkat namun kenyang! Fokus mencicipi kuliner legendaris Jogja.",
    image: "/jogja-3.WEBP",
    duration: "2 Days 1 Night",
    price: "Start from Rp 1.200.000 /pax",
    highlights: ["Kopi Klotok", "Mangut Lele", "Gumuk Pasir", "Obelix Hills"],
    timeline: [
        { day: 1, title: "Authentic Flavors", activities: ["Mangut Lele", "Gumuk Pasir", "Obelix Hills", "Bakmi Jowo"] },
        { day: 2, title: "Morning Vibes", activities: ["Kopi Klotok", "Sawah Kaliurang", "Tempo Gelato", "Transfer Out"] },
    ],
  },
};

// ✅ Helper: Ambil angka hari dari string durasi (ex: "3 Days 2 Nights" -> "3")
const getDaysFromDuration = (durationStr: string) => {
  const match = durationStr.match(/(\d+)\s*Days?/i);
  return match ? match[1] : "";
};

export default async function ItineraryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = itinerariesData[slug];

  if (!data) {
    notFound();
  }

  // ✅ Hitung durasi hari untuk dikirim ke planner
  const daysValue = getDaysFromDuration(data.duration);

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[60vh] w-full">
        <Image
          src={data.image}
          alt={data.title}
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
            <ArrowLeft size={20} /> Back to Home
          </Link>
          <span className="text-primary font-bold tracking-wider uppercase mb-2 bg-primary/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full text-xs">
            Jogja Special Package
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 leading-tight">
            {data.title}
          </h1>
          <p className="text-xl text-white/90 font-serif italic max-w-2xl">
            "{data.tagline}"
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: DETAILS */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* 1. Overview Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Duration</p>
                    <p className="font-semibold">{data.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
                    <p className="font-semibold">Yogyakarta Region</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Type</p>
                    <p className="font-semibold">Private Tour</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tour Overview</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {data.description}
              </p>
              
              <h4 className="font-bold text-gray-900 mb-3">Highlights:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.highlights.map((highlight: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Itinerary Timeline */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CalendarDays className="text-primary" /> 
                Itinerary Schedule
              </h3>
              <div className="space-y-6">
                {data.timeline.map((day: any) => (
                  <div key={day.day} className="flex gap-4 sm:gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg z-10 shrink-0">
                        {day.day}
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 my-2 -z-0" />
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-grow hover:shadow-md transition-shadow pb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Day {day.day}: {day.title}</h4>
                      <ul className="space-y-4">
                        {day.activities.map((act: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-gray-100 rounded-full text-gray-500">
                                {act.toLowerCase().includes("makan") ? <Utensils size={14}/> : 
                                 act.toLowerCase().includes("foto") ? <Camera size={14}/> : 
                                 <div className="w-3.5 h-3.5 rounded-full bg-gray-400" />}
                            </div>
                            <span className="text-gray-600 text-sm md:text-base">{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY BOOKING CARD */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm mb-1">Best Price Offer</p>
                  <h3 className="text-3xl font-bold text-primary">{data.price}</h3>
                  <p className="text-xs text-gray-400 mt-2">*Price depends on pax & season</p>
                </div>

                <div className="space-y-3">
                  {/* ✅ UPDATE: Mengirim data dest, days, dan base ke planner */}
                  <Link 
                    href={`/planner?dest=Yogyakarta&days=${daysValue}&base=${slug}&mode=booking`}
                    className="block w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-center transition-colors shadow-lg shadow-primary/20"
                  >
                    Book This Trip Now
                  </Link>
                  <Link 
                    href={`/planner?dest=Yogyakarta&days=${daysValue}&base=${slug}&mode=custom`}
                    className="block w-full py-3.5 bg-white border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 font-bold rounded-xl text-center transition-colors"
                  >
                    Customize This Plan
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h5 className="font-bold text-gray-900 text-sm mb-3">Includes:</h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Private AC Transport</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Hotel Accommodation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Driver & BBM</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> All Entrance Tickets</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-xl p-4 flex gap-3 items-start">
                <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm">
                   <Users size={20} />
                </div>
                <div>
                    <h5 className="font-bold text-blue-900 text-sm">Need Help?</h5>
                    <p className="text-xs text-blue-700 mt-1">
                        Chat with our Jogja expert to tailor this itinerary for your group.
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