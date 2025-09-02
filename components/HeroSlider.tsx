// components/HeroSlider.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// Define the structure for each slide's data
interface SlideData {
  imageSrc: string;
  subtitle: string;
  title: string;
}

// Custom arrow button component (no changes needed)
const CustomArrowButton = ({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="
      p-2 rounded-full bg-white bg-opacity-30 text-white
      hover:bg-opacity-50 transition-colors duration-300
      focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75
      flex items-center justify-center
    "
    aria-label={`${direction} slide`}
  >
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

// Dot indicator component (no changes needed)
const DotIndicator = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`
      w-2 h-2 rounded-full mx-1 transition-all duration-300
      ${active ? "bg-white scale-125" : "bg-gray-400 bg-opacity-70"}
      focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75
    `}
    aria-label="go to slide"
  />
);

export default function HeroSlider() {
  const slides: SlideData[] = [
    { imageSrc: "/hero-1.jpg", subtitle: "Get unforgettable pleasure with us", title: "Let's make your best trip with us" },
    { imageSrc: "/hero-2.jpg", subtitle: "Discover new horizons", title: "Adventure awaits your next journey" },
    { imageSrc: "/hero-3.jpg", subtitle: "Relax and rejuvenate", title: "Your perfect getaway starts here" },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const changeSlide = useCallback((newIndex: number) => {
    if (isAnimating) return; // Prevent changing slides while one is in progress
    setIsAnimating(true);
    // After the content fades out, change the slide index
    setTimeout(() => {
      setCurrentSlideIndex(newIndex);
      // Allow new animations to start after a short delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // This should match your fade-in animation duration
    }, 500); // This should match your fade-out animation duration
  }, [isAnimating, slides.length]);

  const goToNextSlide = useCallback(() => {
    changeSlide((currentSlideIndex + 1) % slides.length);
  }, [currentSlideIndex, slides.length, changeSlide]);

  const goToPrevSlide = () => {
    changeSlide((currentSlideIndex - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(goToNextSlide, 7000);
    return () => clearInterval(interval);
  }, [goToNextSlide]);

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Images for Cross-fade */}
      {slides.map((slide, index) => (
        <Image
          key={slide.imageSrc}
          src={slide.imageSrc}
          alt={`Background for ${slide.title}`}
          fill
          style={{ objectFit: 'cover' }}
          priority={index === 0}
          className={`
            absolute inset-0 transition-opacity duration-1000 ease-in-out
            ${index === currentSlideIndex ? 'opacity-100' : 'opacity-0'}
          `}
        />
      ))}

      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

      {/* Content */}
      <div
        className={`relative z-20 flex flex-col justify-center items-start h-full max-w-6xl mx-auto px-4 text-white transition-opacity duration-500
          ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
      >
        <p className="font-serif italic text-lg mb-4">{currentSlide.subtitle}</p>
        <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">{currentSlide.title}</h1>
        <div className="flex space-x-4">
          <Link
            href="/tours"
            className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2"
          >
            <span>Explore Tours</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/services"
            className="px-6 py-3 rounded-lg border border-white text-white font-medium hover:bg-white hover:text-black transition-colors duration-300 flex items-center space-x-2"
          >
            <span>Our Services</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-3 z-30">
        <CustomArrowButton direction="up" onClick={goToPrevSlide} />
        <div className="flex flex-col space-y-2">
          {slides.map((_, index) => (
            <DotIndicator
              key={index}
              active={index === currentSlideIndex}
              onClick={() => changeSlide(index)}
            />
          ))}
        </div>
        <CustomArrowButton direction="down" onClick={goToNextSlide} />
      </div>
    </div>
  );
}