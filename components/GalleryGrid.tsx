// components/GalleryGrid.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { destinations } from "@/data/gallery";
import type { Destination } from "@/data/gallery";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Tag, 
  Info, 
  ZoomIn 
} from "lucide-react";

export default function GalleryGrid() {
  const [selectedImage, setSelectedImage] = useState<Destination | null>(null);

  const closeLightBox = () => setSelectedImage(null);

  const navigateImage = useCallback((direction: "next" | "prev") => {
    if (!selectedImage) return;
    const currentIndex = destinations.findIndex((d) => d.id === selectedImage.id);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % destinations.length;
    } else {
      newIndex = (currentIndex - 1 + destinations.length) % destinations.length;
    }
    setSelectedImage(destinations[newIndex]);
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === "Escape") closeLightBox();
      if (e.key === "ArrowRight") navigateImage("next");
      if (e.key === "ArrowLeft") navigateImage("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, navigateImage]);

  if (!destinations || destinations.length === 0) {
    return <p className="text-center text-gray-500">No destinations to display.</p>;
  }

  return (
    <>
      {/* --- GRID GALLERY --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {destinations.map((dest: Destination) => (
          <div
            key={dest.id}
            onClick={() => setSelectedImage(dest)}
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="overflow-hidden relative h-64 w-full">
              <Image
                src={dest.imageUrl}
                alt={dest.name}
                fill
                className="object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <ZoomIn className="text-white w-8 h-8" />
                 </div>
              </div>
            </div>
            <div className="p-5 z-10 relative bg-white">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                {dest.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {dest.location}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- RICH MODAL (Force White Style) --- */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
            onClick={closeLightBox}
        >
          <div 
            className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} 
          >
            
            {/* --- KOLOM KIRI: GAMBAR --- */}
            <div className="relative w-full md:w-[60%] h-64 md:h-auto bg-gray-100 group">
               <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.name}
                  fill
                  className="object-cover"
                  priority
               />
               <button 
                  onClick={() => navigateImage("prev")} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
               >
                  <ChevronLeft size={24} />
               </button>
               <button 
                  onClick={() => navigateImage("next")} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
               >
                  <ChevronRight size={24} />
               </button>
            </div>

            {/* --- KOLOM KANAN: INFO (Force White Text Color Logic) --- */}
            <div className="w-full md:w-[40%] p-6 md:p-8 overflow-y-auto relative flex flex-col bg-white text-gray-900">
                
                <button 
                    onClick={closeLightBox} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition bg-gray-100 p-1 rounded-full"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 mt-2 pr-8">
                    {selectedImage.name}
                </h2>

                <div className="flex gap-3 mb-6">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedImage.description}
                    </p>
                </div>

                {/* Info Box */}
                <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasi</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedImage.location}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Waktu Terbaik</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedImage.bestTime}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                            <Tag size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiket Masuk (Est)</p>
                            <p className="text-sm font-semibold text-gray-800">{selectedImage.priceStart}</p>
                        </div>
                    </div>

                </div>

                <div className="mt-auto">
                    <Link 
                        href="/packages" 
                        className="block w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold text-center rounded-xl transition shadow-lg shadow-primary/20"
                    >
                        Lihat Paket Wisata
                    </Link>
                </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}