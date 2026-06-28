"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Action {
  title: string;
  link: string;
}

interface SlideItem {
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string; // Background fallback image
  video?: string; // Optional background video
  actions?: Action[];
}

interface UniversalHeroCarouselProps {
  slides: SlideItem[];
  autoPlayInterval?: number;
}

export function Carousel({ slides, autoPlayInterval = 6000 }: UniversalHeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    
    return () => clearInterval(timer);
  }, [slides, autoPlayInterval]);

  if (!slides || slides.length === 0) return null;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Helper function to color the last word of a headline using your accent token
  const renderTitle = (titleText: string) => {
    const words = titleText.split(" ");
    return words.map((word, i, arr) => (
      <span key={i}>
        {i === arr.length - 1 ? (
          <span className="text-accent-400">{word}</span>
        ) : (
          word + " "
        )}
      </span>
    ));
  };

  return (
    <section
      className="relative min-h-[55vh] flex items-center overflow-hidden bg-slate-950"
      aria-label="Interactive Hero Showcase"
    >
      {/* Background Layer: Images or Videos */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {slide.video && index === currentSlide ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={slide.video} type="video/mp4" />
              <img src={slide.image} alt="" className="w-full h-full object-cover" />
            </video>
          ) : (
            <img 
              src={slide.image} 
              alt="" 
              className="w-full h-full object-cover"
            />
          )}
          {/* Uniform light overlay tint */}
          <div className="absolute inset-0 bg-slate-950/30" />
        </div>
      ))}

      {/* Persistent Content Mask Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent z-0" aria-hidden="true" />
      
      {/* Dot Matrix styling overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative container-theme section-padding z-10 w-full">
        <div className="grid grid-cols-1 gap-12 items-center">
          <div className="max-w-4xl">
            
            {/* Active Content Block */}
            <div key={currentSlide} className="animate-fade-up">
              {/* Optional Eyebrow Chip */}
              {slides[currentSlide].eyebrow && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-slow" />
                  {slides[currentSlide].eyebrow}
                </div>
              )}

              {/* Dynamic Title */}
              <h1 className="font-display font-bold text-white mb-6 text-5xl lg:text-6xl leading-tight drop-shadow-sm">
                {renderTitle(slides[currentSlide].title)}
              </h1>

              {/* Dynamic Subtitle */}
              <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-2xl drop-shadow-sm">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Conditional Action Buttons Mapping */}
            {slides[currentSlide].actions && slides[currentSlide].actions!.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-12">
                {slides[currentSlide].actions!.map((action, actionIdx) => {
                  // Style the first button as primary accent, subsequent buttons as outlined secondary
                  const isPrimary = actionIdx === 0;
                  return (
                    <Link
                      key={actionIdx}
                      href={action.link}
                      className={
                        isPrimary
                          ? "btn-accent text-base px-6 py-3.5"
                          : "flex items-center gap-2 px-6 py-3.5 rounded text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all"
                      }
                    >
                      {action.title} <ArrowRight className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Slider Navigation Panel - Only visible if 2+ slides exist */}
            {slides.length > 1 && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={prevSlide} 
                  className="p-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 transition-all duration-300 rounded-full ${
                        i === currentSlide ? "w-8 bg-accent-400" : "w-2 bg-white/20"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={nextSlide} 
                  className="p-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Decorative Bottom edge fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" aria-hidden="true" />
    </section>
  );
}