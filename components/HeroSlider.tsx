// components/HeroSlider.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image"; 
import { useRouter } from "next/navigation"; 
import { useTranslations } from "next-intl"; 
import { 
  Calendar, ArrowRight, Clock, Compass, CalendarDays, ChevronDown, Check, Lock 
} from "lucide-react";


import { useAuth } from "@/contexts/AuthContext"; 

interface ISlide {
  subtitle: string;
  title: string;
}

export default function HeroSlider() {
  const t = useTranslations("HeroSlider");
  const router = useRouter(); 


  const { user } = useAuth();
  
  
  const isLoggedIn = !!user; 

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

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 7000);
    return () => clearInterval(interval);
  }, [goToNextSlide]);

  const handleStartPlanning = () => {
    const params = new URLSearchParams();
    
    if (selectedStyles.length > 0) params.set("style", selectedStyles.join(","));
    if (duration) params.set("days", duration);
    if (travelDate) params.set("date", travelDate);
    
    const plannerUrl = `/planner?${params.toString()}`;

    if (isLoggedIn) {
      // KONDISI A: SUDAH LOGIN -> Langsung ke Planner
      router.push(plannerUrl);
    } else {
      // KONDISI B: BELUM LOGIN -> Ke Login bawa link planner
      const target = encodeURIComponent(plannerUrl);
      router.push(`/login?redirect=${target}`);
    }
  };

  const currentSlide = slides?.[currentSlideIndex] || { subtitle: "", title: "" };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Background Images */}
      {slides && slides.map((slide, index) => (
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

                
                <div className="md:col-span-3">
                    <button
                        onClick={handleStartPlanning}
                        className={`w-full h-10 font-bold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95 text-sm
                          ${isLoggedIn 
                            ? "bg-primary hover:bg-primary/90 text-white shadow-primary/30" 
                            : "bg-gray-600 hover:bg-gray-700 text-white shadow-gray-600/30" 
                          }`}
                    >
                        {/* Teks Berubah */}
                        <span>{isLoggedIn ? "Create Plan" : "Login to Plan"}</span>
                        
                       
                        {isLoggedIn ? (
                            <ArrowRight className="w-4 h-4" />
                        ) : (
                            <Lock className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}