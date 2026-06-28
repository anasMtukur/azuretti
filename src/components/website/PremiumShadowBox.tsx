"use client";

import React from "react";

interface PremiumShadowBoxProps {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  tiltDirection?: "left" | "right" | "none";
  showGlow?: boolean;
  glowColor?: string; // Tailwind class like 'bg-accent-400/20' or 'bg-primary-500/10'
  className?: string;
}

export function PremiumShadowBox({
  src,
  alt,
  aspectRatio = "video",
  tiltDirection = "right",
  showGlow = true,
  glowColor = "bg-accent-400/10",
  className = "",
}: PremiumShadowBoxProps) {
  
  // 1. Map cleaner aspect ratios
  const aspectStyles = {
    video: "aspect-video",         // 16:9
    square: "aspect-square",       // 1:1
    portrait: "aspect-[3/4]",      // 3:4
    wide: "aspect-[21/9]",         // Cinematic
  }[aspectRatio];

  // 2. Creative frame offsets based on structural layout choice
  const frameStyles = {
    right: "translate-x-4 translate-y-4 border-r border-b",
    left: "-translate-x-4 translate-y-4 border-l border-b",
    none: "translate-x-0 translate-y-0 border",
  }[tiltDirection];

  return (
    <div className={`relative w-full group ${className}`}>
      
      {/* Dynamic Back-Glow (Ambient Shadow Element) */}
      {showGlow && (
        <div 
          className={`absolute -inset-1 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none select-none z-0 ${glowColor}`}
          aria-hidden="true"
        />
      )}

      {/* Creative External Wireframe Shadow-Box */}
      <div 
        className={`absolute inset-0 border-white/10 rounded-2xl transition-transform duration-500 ease-out z-0 pointer-events-none ${frameStyles} group-hover:scale-[1.02]`}
        aria-hidden="true"
      />

      {/* Main Image Framing Card */}
      <div 
        className={`relative w-full ${aspectStyles} overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] z-10`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Soft Contrast Gradient Mask (Protects layout highlights) */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-60 pointer-events-none" 
          aria-hidden="true"
        />

        {/* Minimal Glass Tech Info Tag (Peaks out slightly on Hover) */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/40 backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-[10px] font-mono tracking-widest text-white/50 uppercase">
          Verified Asset
        </div>
      </div>
      
    </div>
  );
}