"use client";

import { useState, useEffect, useCallback, useRef } from "react";
// import Image from "next/image"; // UNCOMMENT DI PROYEK ASLI
// import { useRouter } from "next/navigation"; // UNCOMMENT DI PROYEK ASLI
// import { useTranslations } from "next-intl"; // UNCOMMENT DI PROYEK ASLI
import { 
  Calendar, ArrowRight, Clock, Compass, CalendarDays, ChevronDown, Check
} from "lucide-react";

// --- MOCK COMPONENTS (HAPUS BAGIAN INI DI PROYEK ASLI) ---
const useRouter = () => ({
  push: (url: string) => console.log("Navigasi ke:", url),
});

const useTranslations = (namespace: string) => {
  const t = (key: string) => key;
  t.raw = (key: string) => {
    // Data dummy untuk preview
    if (key === "slides") {
      return [
        { subtitle: "The Perfect Introduction to Java's Soul", title: "Rasakan Magisnya Yogyakarta" },
        { subtitle: "Explore Ancient Temples", title: "Borobudur & Prambanan" },
        { subtitle: "Nature & Adventure", title: "Merapi Lava Tour" },
      ];
    }
    return [];
  };
  return t;
};

const Image = ({ src, alt, fill, className, style, priority }: any) => (
  <img 
    src={src} 
    alt={alt} 
    className={className}
    style={{
      ...style,
      position: fill ? "absolute" : "relative",
      height: "100%",
      width: "100%",
      objectFit: "cover"
    }} 
  />
);
// ---------------------------------------------------------

interface ISlide {
  subtitle: string;
  title: string;
}

const CustomArrowButton = ({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) => (
  <button onClick={onClick} className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/10 text-white transition">
    {/* SVG Icons */}
    {direction === "up" ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    )}
  </button>
);

const DotIndicator = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`w-2 h-2 rounded-full mx-1 transition-all ${active ? "bg-white scale-125" : "bg-gray-400/70"}`} />
);

export default function HeroSlider() {
  const t = useTranslations("HeroSlider");
  const router = useRouter(); 

  // Mengambil data slides dari translation file
  const slides = t.raw("slides") as ISlide[];
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- FORM STATE ---
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]); 
  const [isStyleOpen, setIsStyleOpen] = useState(false); 
  const [duration, setDuration] = useState("");
  const [travelDate, setTravelDate] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const styleOptions = [
    "Nature & Adventure", "Culture & Heritage", "Culinary & Lifestyle", 
    "Wellness & Healing", "City & Urban Life", "Photography & Instagrammable", 
    "Religious/Spiritual Travel", "Local Village & Green Travel", 
    "Festival & Events", "Sports & Outdoor"
  ];

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) => 
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style] 
    );
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStyleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeSlide = useCallback((newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlideIndex(newIndex);
      setTimeout(() => setIsAnimating(false), 500);
    }, 500);
  }, [isAnimating]);

  const goToNextSlide = useCallback(() => {
    if (slides && slides.length > 0) changeSlide((currentSlideIndex + 1) % slides.length);
  }, [currentSlideIndex, changeSlide, slides]);

  const goToPrevSlide = () => {
    if (slides && slides.length > 0) changeSlide((currentSlideIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 7000);
    return () => clearInterval(interval);
  }, [goToNextSlide]);

  // ✅ LOGIC PENGIRIMAN DATA KE PLANNER
  const handleStartPlanning = () => {
    const params = new URLSearchParams();
    
    // Menggabungkan array styles menjadi string koma (ex: "Nature,Culture")
    if (selectedStyles.length > 0) params.set("style", selectedStyles.join(","));
    if (duration) params.set("days", duration);
    if (travelDate) params.set("date", travelDate);
    
    // Redirect ke planner dengan query params
    router.push(`/planner?${params.toString()}`);
  };

  const currentSlide = slides?.[currentSlideIndex] || { subtitle: "", title: "" };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlideIndex ? "opacity-100" : "opacity-0"}`}>
             <Image
                src={`/hero-${index + 1}.jpg`} 
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
            />
        </div>
      ))}

      <div className="absolute inset-0 bg-black/40 z-10"></div>
      
      {/* Content & Form */}
      {/* ✅ Z-INDEX 50: Agar form muncul di atas komponen SampleItineraries */}
      <div className="relative z-50 flex flex-col justify-center items-center h-full w-full px-4 text-white pb-24 md:pb-0">
        
        {/* Title */}
        <div className={`text-center max-w-4xl mb-8 transition-all duration-500 ease-in-out ${isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}>
            <p className="font-serif italic text-lg md:text-xl mb-2 tracking-wider text-primary-foreground/90">{currentSlide.subtitle}</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">{currentSlide.title}</h1>
        </div>

        {/* --- MINI PLANNER WIDGET --- */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 md:p-5 shadow-2xl relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                
                {/* 1. Travel Style Dropdown */}
                <div className="md:col-span-4 text-left space-y-1 relative" ref={dropdownRef}>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/90 ml-1">Travel Style</label>
                    <button 
                        onClick={() => setIsStyleOpen(!isStyleOpen)}
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-white/95 border-0 text-left text-sm font-medium text-gray-900 flex items-center justify-between hover:bg-white transition-colors"
                    >
                        <span className="truncate">
                            {selectedStyles.length === 0 ? "Select styles..." : `${selectedStyles.length} Selected`}
                        </span>
                        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isStyleOpen ? "rotate-180" : ""}`} />
                        <Compass className="absolute left-3 top-8 text-gray-500 h-4 w-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isStyleOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-100 z-[60] p-2 custom-scrollbar">
                            {styleOptions.map((style) => {
                                const isSelected = selectedStyles.includes(style);
                                return (
                                    <div 
                                        key={style}
                                        onClick={() => toggleStyle(style)}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer text-sm transition-colors ${isSelected ? "bg-primary/10 text-primary font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary border-primary text-white" : "border-gray-300 bg-white"}`}>
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <span>{style}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 2. Date Picker */}
                <div className="md:col-span-3 text-left space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/90 ml-1">Start Date</label>
                    <div className="relative group">
                        <CalendarDays className="absolute left-3 top-2.5 text-gray-500 h-4 w-4 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="date" 
                            className="w-full h-10 pl-9 pr-4 rounded-lg text-gray-900 bg-white/95 border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium placeholder:text-gray-500"
                            value={travelDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setTravelDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* 3. Duration Input */}
                <div className="md:col-span-2 text-left space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/90 ml-1">Days</label>
                    <div className="relative group">
                        <Clock className="absolute left-3 top-2.5 text-gray-500 h-4 w-4 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="number" 
                            placeholder="e.g 3"
                            min="1"
                            className="w-full h-10 pl-9 pr-4 rounded-lg text-gray-900 bg-white/95 border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium placeholder:text-gray-500"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                    </div>
                </div>

                {/* 4. Action Button */}
                <div className="md:col-span-3">
                    <button
                        onClick={handleStartPlanning}
                        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95 text-sm"
                    >
                        <span>Create Plan</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}