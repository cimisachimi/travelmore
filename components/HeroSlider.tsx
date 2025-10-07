"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const CustomArrowButton = ({ direction, onClick }: { direction: "up" | "down"; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full bg-white bg-opacity-30 text-black hover:bg-opacity-50 transition-colors duration-300"
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

const DotIndicator = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${active ? "bg-white scale-125" : "bg-gray-400 bg-opacity-70"}`}
    aria-label="go to slide"
  />
);

export default function HeroSlider() {
  const t = useTranslations("HeroSlider");

  const slides = t.raw("slides");

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const changeSlide = useCallback((newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlideIndex(newIndex);
      setTimeout(() => setIsAnimating(false), 500);
    }, 500);
  }, [isAnimating]);

  const goToNextSlide = useCallback(() => {
    changeSlide((currentSlideIndex + 1) % slides.length);
  }, [currentSlideIndex, changeSlide, slides.length]);

  const goToPrevSlide = () => {
    changeSlide((currentSlideIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 7000);
    return () => clearInterval(interval);
  }, [goToNextSlide]);

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      {slides.map((_: any, index: number) => (
        <Image
          key={index}
          src={`/hero-${index + 1}.jpg`}
          alt={`Background ${index + 1}`}
          fill
          style={{ objectFit: "cover" }}
          priority={index === 0}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlideIndex ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

      <div className={`relative z-20 flex flex-col justify-center items-center text-center h-full max-w-4xl mx-auto px-4 text-white transition-all duration-500
          ${isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}`}>
        <p className="font-serif italic text-lg mb-4">{currentSlide.subtitle}</p>
        <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">{currentSlide.title}</h1>

        <Link
          href="/planner"
          className="px-8 py-4 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all duration-300 flex items-center space-x-2 text-lg transform hover:scale-105 shadow-lg"
        >
          <span>{t("cta")}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-3 z-30">
        <CustomArrowButton direction="up" onClick={goToPrevSlide} />
        <div className="flex flex-col space-y-2">
          {slides.map((_: any, index: number) => (
            <DotIndicator key={index} active={index === currentSlideIndex} onClick={() => changeSlide(index)} />
          ))}
        </div>
        <CustomArrowButton direction="down" onClick={goToNextSlide} />
      </div>
    </div>
  );
}