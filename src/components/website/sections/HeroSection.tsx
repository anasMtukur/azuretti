"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { theme } from "@/config/theme";

const slides = [
  {
    eyebrow: "EU-Compliant & Traceable",
    title: "Secure Your Export Gateway",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200",
    icon: ShieldCheck
  },
  {
    eyebrow: "Euro-Based Revenue",
    title: "Maximize Your Trade Returns",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200",
    icon: TrendingUp
  },
  {
    eyebrow: "France Trade House Hub",
    title: "Reach 500 Million Consumers",
    image: "https://images.unsplash.com/photo-1503917988258-f19782f4c9a1?auto=format&fit=crop&q=80&w=1200",
    icon: Globe
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section
      className="relative min-h-hero flex items-center overflow-hidden bg-slate-950"
      aria-label="Hero"
    >
      {/* Dynamic Background Image - Increased opacity from 30 to 50 */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-50" : "opacity-0"
          }`}
        >
          <img 
            src={slide.image} 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Subtle vignette to ensure text contrast without darkening the whole image */}
          <div className="absolute inset-0 bg-slate-950/40" />
        </div>
      ))}

      {/* Fixed: Removed mix-blend-multiply which was crushing the highlights. 
         Using a standard gradient overlay instead.
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-0" aria-hidden="true" />
      
      <div
        className="absolute inset-0 opacity-[0.04] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative container-theme section-padding z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-3xl">
            {/* Carousel Content */}
            <div key={currentSlide} className="animate-fade-up">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-slow" />
                {slides[currentSlide].eyebrow}
              </div>

              {/* Headline */}
              <h1 className="font-display font-bold text-white mb-6 text-5xl lg:text-6xl leading-tight">
                {slides[currentSlide].title.split(" ").map((word, i, arr) => (
                  <span key={i}>
                    {i === arr.length - 1 ? <span className="text-accent-400">{word}</span> : word + " "}
                  </span>
                ))}
              </h1>

              {/* Subheadline (Static) */}
              <p className="text-lg text-white/75 leading-relaxed mb-8 max-w-2xl">
                {theme.brand.name} connects verified Nigerian exporters with serious
                European buyers through a fully compliant Trade House in France.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/auth/register?role=exporter" className="btn-accent text-base px-6 py-3.5">
                For Nigerian Exporters <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/register?role=buyer" className="flex items-center gap-2 px-6 py-3.5 rounded text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
                For European Buyers <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-4">
              <button onClick={prevSlide} className="p-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 bg-accent-400" : "w-2 bg-white/20"}`}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="p-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" aria-hidden="true" />
    </section>
  );
}