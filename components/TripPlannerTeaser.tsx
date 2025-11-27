"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ArrowRight, ShieldCheck, Clock, Compass, CalendarDays, Check } from "lucide-react";

export default function TripPlannerTeaser() {
  const router = useRouter();
  
  // ✅ Ubah state menjadi array string[] untuk menampung banyak pilihan
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [travelDate, setTravelDate] = useState("");

  // Opsi Travel Style sesuai gambar Anda
  const styleOptions = [
    "Nature & Adventure",
    "Culture & Heritage",
    "Culinary & Lifestyle",
    "Wellness & Healing",
    "City & Urban Life",
    "Photography & Instagrammable",
    "Religious/Spiritual Travel",
    "Local Village & Green Travel",
    "Festival & Events",
    "Sports & Outdoor"
  ];

  // Fungsi untuk memilih/membatalkan pilihan style
  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) => 
      prev.includes(style) 
        ? prev.filter((s) => s !== style) // Hapus jika sudah ada
        : [...prev, style] // Tambah jika belum ada
    );
  };

  const handleStartPlanning = () => {
    const params = new URLSearchParams();
    
    // ✅ Gabungkan array style menjadi string dipisah koma (misal: "Nature,Culinary")
    if (selectedStyles.length > 0) params.set("style", selectedStyles.join(","));
    if (duration) params.set("days", duration);
    if (travelDate) params.set("date", travelDate);
    
    router.push(`/planner?${params.toString()}`);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-50 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-50 blur-3xl opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* --- KIRI: Selling Points --- */}
          <div className="space-y-8 animate-fadeInLeft">
            <div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Explore the Soul of <br />
                <span className="text-primary">Yogyakarta</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
  {"From the majestic Borobudur to the vibrant streets of Malioboro. Tell us your style, and we'll craft a personalized Jogja itinerary just for you."}
</p>


            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Save Time</h4>
                  <p className="text-sm text-gray-500">Get a full Jogja itinerary instantly.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Local Hidden Gems</h4>
                  <p className="text-sm text-gray-500">Discover authentic spots beyond the tourist traps.</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- KANAN: Form Card --- */}
          <div className="relative">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-gray-200/50 relative z-10">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                Plan Your Jogja Trip ✈️
              </h3>
              
              <div className="space-y-5">
                
                {/* 1. ✅ Input Travel Style (Multiple Selection) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex justify-between">
                    Travel Style Preferences
                    <span className="text-xs text-primary">{selectedStyles.length} selected</span>
                  </label>
                  
                  {/* Scrollable Container untuk Chips */}
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {styleOptions.map((style) => {
                      const isSelected = selectedStyles.includes(style);
                      return (
                        <button
                          key={style}
                          onClick={() => toggleStyle(style)}
                          className={`
                            px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 flex items-center gap-1
                            ${isSelected 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}
                          `}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 2. Input Travel Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <div className="relative">
                        <div className="absolute left-4 top-3.5 text-primary pointer-events-none">
                           <CalendarDays className="h-5 w-5" />
                        </div>
                        <input 
                          type="date" 
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-gray-900 placeholder:text-gray-400 text-sm"
                          value={travelDate}
                          min={new Date().toISOString().split("T")[0]} 
                          onChange={(e) => setTravelDate(e.target.value)} 
                        />
                      </div>
                    </div>

                    {/* 3. Input Duration */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Duration (Days)</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 text-primary h-5 w-5" />
                        <input 
                          type="number" 
                          placeholder="e.g. 3"
                          min="1"
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-gray-900 placeholder:text-gray-400 text-sm"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)} 
                        />
                      </div>
                    </div>
                </div>

                {/* Button Action */}
                <button 
                  onClick={handleStartPlanning}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Create My Itinerary
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                  Free & Instant • Specific for Yogyakarta Region
                </p>
              </div>
            </div>
            
            {/* Card Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-3xl transform rotate-3 scale-105 opacity-10 -z-0" />
          </div>

        </div>
      </div>
    </section>
  );
}