// components/HeroSlider.tsx
"use client";

import { useState, useEffect, useCallback } from "react"; // ✨ Import useCallback
import Image from "next/image";
import Link from "next/link";

// Define the structure for each slide's data
interface SlideData {
  imageSrc: string;
  subtitle: string;
  title: string;
}

// Custom arrow button component (no change needed here, still good)
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

// Dot indicator component (no change needed here, still good)
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
  const [isTransitioning, setIsTransitioning] = useState(false); // ✨ New state for transition
  const [visibleSlideIndex, setVisibleSlideIndex] = useState(0); // ✨ New state for visible slide

  // Function to handle slide change with transition
  const changeSlide = useCallback((newIndex: number) => {
    if (isTransitioning) return; // Prevent rapid clicking issues
    setIsTransitioning(true);

    // Fade out the current content
    setTimeout(() => {
      setCurrentSlideIndex(newIndex); // Update to the new slide after fade-out
      // No need to set isTransitioning(false) here, as it will be set when content fades in
    }, 500); // Duration of the fade-out animation in global.css
  }, [isTransitioning]);

  // Update visibleSlideIndex when currentSlideIndex changes, for content fade-in
  useEffect(() => {
    setVisibleSlideIndex(currentSlideIndex);
    const fadeInTimeout = setTimeout(() => {
      setIsTransitioning(false); // Mark transition as complete after fade-in
    }, 800); // Duration of fade-in animation, matches animate-fadeInUp
    return () => clearTimeout(fadeInTimeout);
  }, [currentSlideIndex]);


  const goToNextSlide = () => {
    const newIndex = (currentSlideIndex + 1) % slides.length;
    changeSlide(newIndex);
  };

  const goToPrevSlide = () => {
    const newIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    changeSlide(newIndex);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(goToNextSlide, 7000); // Change slide every 7 seconds
    return () => clearInterval(interval);
  }, [goToNextSlide]); // Depend on goToNextSlide (which depends on changeSlide)


  // Get the slide data for the currently displayed content
  const currentContentSlide = slides[visibleSlideIndex];
  // Get the slide data for the background image (which transitions separately)
  const currentImageSlide = slides[currentSlideIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      {/* We use currentImageSlide for the Image component to allow pre-loading */}
      <Image
        src={currentImageSlide.imageSrc}
        alt={`Background for ${currentImageSlide.title}`}
        fill
        style={{ objectFit: "cover" }}
        priority // Load the first image with high priority
        className="transition-opacity duration-1000 ease-in-out opacity-100" // Always fully opaque
        key={currentImageSlide.imageSrc} // Key to force re-render/transition on image change
      />
      {/* Create a second image for the transition effect */}
      {currentImageSlide.imageSrc !== slides[visibleSlideIndex].imageSrc && (
        <Image
          src={slides[visibleSlideIndex].imageSrc}
          alt={`Previous background`}
          fill
          style={{ objectFit: "cover" }}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0" // Fades out
        />
      )}

      <div className="absolute inset-0 bg-black opacity-40 z-10"></div> {/* Dark overlay */}

      {/* Content */}
      <div
        className={`relative z-20 flex flex-col justify-center items-start h-full max-w-6xl mx-auto px-4 text-white
          ${isTransitioning ? "animate-fadeOutDown" : "animate-none"} `} // ✨ Apply fade out here
      >
        <p className={`font-serif italic text-lg mb-4 transform translate-y-4 opacity-0 ${!isTransitioning ? 'animate-fadeInUp animate-delay-200' : ''}`}>
          {currentContentSlide.subtitle}
        </p>
        <h1 className={`text-5xl md:text-6xl font-bold mb-8 leading-tight transform translate-y-4 opacity-0 ${!isTransitioning ? 'animate-fadeInUp animate-delay-400' : ''}`}>
          {currentContentSlide.title}
        </h1>
        <div className="flex space-x-4">
          <Link
            href="/tours"
            className={`
              px-6 py-3 rounded-lg bg-blue-500 text-white font-medium
              hover:bg-blue-600 transition-colors duration-300
              flex items-center space-x-2
              transform translate-y-4 opacity-0 ${!isTransitioning ? 'animate-fadeInUp animate-delay-600' : ''}
            `}
          >
            <span>Explore Tours</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/services"
            className={`
              px-6 py-3 rounded-lg border border-white text-white font-medium
              hover:bg-white hover:text-black transition-colors duration-300
              flex items-center space-x-2
              transform translate-y-4 opacity-0 ${!isTransitioning ? 'animate-fadeInUp animate-delay-800' : ''}
            `}
          >
            <span>Our Services</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Navigation (Arrows and Indicators) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-3 z-30"> {/* Z-index increased */}
        {/* Up Arrow */}
        <CustomArrowButton direction="up" onClick={goToPrevSlide} />

        {/* Indicators */}
        <div className="flex flex-col space-y-2">
          {slides.map((_, index) => (
            <DotIndicator
              key={index}
              active={index === currentSlideIndex} // Indicators should reflect the current image being shown
              onClick={() => changeSlide(index)} // Use changeSlide for indicators too
            />
          ))}
        </div>

        {/* Down Arrow */}
        <CustomArrowButton direction="down" onClick={goToNextSlide} />
      </div>
    </div>
  );
}