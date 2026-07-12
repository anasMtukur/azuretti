"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { theme } from "@/config/theme";

export function HeroSection() {
  return (
    <section
      className="relative min-h-hero flex items-center overflow-hidden bg-slate-950"
      aria-label="Hero"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          {/* Replace with your actual video source path */}
          <source src="/videos/video-bg.mp4" type="video/mp4" />
          {/* Fallback image using one of your original high-quality assets */}
          <img 
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200" 
            alt="Trade Hub" 
            className="w-full h-full object-cover"
          />
        </video>
        
        {/* Light Overlay Tint - Keeps highlights crisp without being too dark */}
        <div className="absolute inset-0 bg-slate-950/30" aria-hidden="true" />
      </div>

      {/* Side gradient to ease text reading over moving video */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent z-0" aria-hidden="true" />
      
      {/* Subtle dot matrix grid matching original design */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative container-theme section-padding-lg-top lg:section-padding z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-5xl">
            <div className="animate-fade-up">
              {/* Eyebrow - Kept original styled chip for context */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-slow" />
                Europe Trade Gateway
              </div>

              {/* Dynamic Accent Coloring on Title */}
              <h1 className="font-display font-bold text-white mb-6 text-5xl lg:text-6xl leading-tight drop-shadow-sm">
                Export<br /> Trade House - <span className="text-accent-400">ETH</span>
              </h1>

              {/* Requested Subtitle Copy */}
              <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-2xl drop-shadow-sm">
                Your Gateway to European Markets - Connecting verified Nigerian exporters with trusted European buyers through our fully compliant Trade House in France.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register?role=exporter" className="btn-accent text-base px-6 py-3.5">
                For Nigerian Exporters <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/register?role=buyer" className="flex items-center gap-2 px-6 py-3.5 rounded text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
                For European Buyers <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" aria-hidden="true" />
    </section>
  );
}