"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

export function BrandSection() {
  return (
    <section className="relative w-full py-24 bg-slate-950 text-white overflow-hidden">
      {/* Subtle Background Accents */}
      <div 
        className="absolute top-1/4 right-0 w-96 h-96 bg-accent-400/5 rounded-full blur-[120px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-10 left-10 w-72 h-72 bg-white/[0.02] rounded-full blur-[80px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="container-theme mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Creative Image Framework */}
          <div className="lg:col-span-6 relative w-full flex items-center justify-center">
            {/* Background Decorative Frame */}
            <div className="absolute inset-0 border border-white/5 translate-x-4 translate-y-4 rounded-2xl pointer-events-none hidden sm:block" />
            
            {/* Primary Image Container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-slate-900 group">
              <img
                src="/images/djeni/djeni-1.jpg" 
                alt="DJeni premium food products sourcing"
                className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Soft overlay on image matching minimalist luxury profile */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            </div>

            {/* Overlapping Floating Asset Card */}
            <div className="absolute -bottom-6 -left-4 sm:left-6 bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl max-w-[240px] hidden xs:flex items-center gap-3">
              <div className="p-2.5 bg-accent-400/10 rounded-lg text-accent-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Compliance Status</p>
                <p className="text-sm font-semibold text-white">100% EU Traceable</p>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Text Typography */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Minimalist Pill Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-400/10 border border-accent-400/20 text-accent-400 text-xs font-semibold uppercase tracking-widest mb-6 w-fit">
              Our Brand
            </div>

            {/* Dynamic Main Title */}
            <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-white mb-6 leading-tight">
              DJeni®<span className="text-accent-400 font-sans text-xl relative -top-4">®</span> – Our Premium Consumer Brand
            </h2>

            {/* Structured Copy Blocks */}
            <p className="text-lg text-white/85 leading-relaxed mb-6 font-normal">
              <strong className="text-white font-semibold">DJeni®</strong> is Azuretti's registered brand in Nigeria and France, supplying premium Nigerian food products to supermarkets, wholesalers, distributors, and retailers across Europe.
            </p>

            <p className="text-base text-white/70 leading-relaxed mb-8">
              Engineered for absolute cross-continental alignment, our products remove the historical bottlenecks of agro-exporting, opening doors directly to mainstream western markets.
            </p>

            {/* Highlighting Key Features/Specs with Minimal Layout */}
            <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Export-Compliant</h4>
                  <p className="text-xs text-white/60 mt-0.5">Strict regulatory vetting for EU markets.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Flexible Logistics</h4>
                  <p className="text-xs text-white/60 mt-0.5">Available in both retail and bulk packaging.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}