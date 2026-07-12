import { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

export type HeroType = "about" | "commodities" | "compliance" | "contact" | "news";

interface HeroSubSectionProps {
  type: HeroType;
  tagText: string;
  title: ReactNode; // Allows string or <br /> tags
  description: string;
  bgImage?: string; // Optional background image URL if you want to swap the gradient later
}

export function HeroSubSection({ type, tagText, title, description, bgImage }: HeroSubSectionProps) {
  // 1. Determine structural layout classes based on the variant 'type'
  const isCentered = false; //type === "about" || type === "news";
  
  const sectionClasses = {
    about: "bg-gradient-hero pt-48 pb-20 relative overflow-hidden",
    commodities: "bg-gradient-hero pt-48 pb-16 relative overflow-hidden",
    compliance: "relative pt-40 pb-20 bg-gradient-hero overflow-hidden",
    contact: "bg-gradient-hero pt-44 pb-16 relative overflow-hidden",
    news: "bg-gradient-to-br from-primary-950 to-primary-800 pt-48 pb-20 px-4 relative overflow-hidden",
  }[type];

  const headingClasses = {
    about: "font-display font-bold text-2xl lg:text-5xl text-white mb-5",
    commodities: "font-display text-2xl lg:text-5xl font-bold text-white mb-4",
    compliance: "font-display font-bold text-2xl lg:text-5xl text-white mb-5",
    contact: "font-display font-bold text-2xl lg:text-5xl text-white mb-4",
    news: "font-display font-bold text-2xl lg:text-5xl text-white mb-4",
  }[type];

  const descriptionClasses = {
    about: "text-lg text-primary-200 max-w-2xl mx-auto leading-relaxed",
    commodities: "text-primary-200 text-lg max-w-2xl leading-relaxed",
    compliance: "text-lg text-primary-200 leading-relaxed",
    contact: "text-primary-200 text-lg max-w-xl leading-relaxed",
    news: "text-primary-200 text-lg max-w-2xl mx-auto",
  }[type];

  return (
    <section 
      className={sectionClasses}
      style={bgImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {/* Structural Dot Grid Overlays (for Types 1 - 4) */}
      {type !== "news" && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
      )}

      {/* Compliance Glowing Blob Effect (Type 3) */}
      {type === "compliance" && (
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 -translate-x-1/3 -translate-y-1/3"
          style={{ background: "radial-gradient(circle, #4fba81, transparent 70%)" }}
          aria-hidden="true"
        />
      )}

      {/* Bottom Right Peaking Image Asset */}
      <div className="absolute right-0 bottom-0 w-72 h-72 md:w-96 md:h-96 z-0 pointer-events-none select-none select-none opacity-25 mix-blend-lighten">
        <img 
          src="/images/hero-peak.png" 
          alt="" 
          className="w-full h-full object-contain object-right-bottom"
        />
        {/* Soft fading gradient masking to blend smoothly into the core blue backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent left-0 top-0" style={{
          background: 'linear-gradient(to top right, transparent 20%, var(--tw-gradient-from, #020617) 90%)'
        }} />
      </div>

      {/* Content Wrapper */}
      <div className={type === "news" ? "max-w-5xl mx-auto text-center relative z-10" : `container-theme relative z-10 ${isCentered ? "text-center" : ""}`}>
        <div className={!isCentered && type !== "compliance" ? "" : type === "compliance" ? "max-w-full" : ""}>
          
          {/* Custom Tag Badges */}
          {type === "news" ? (
            <p className="text-accent-400 text-xs font-bold uppercase tracking-widest mb-4">
              {tagText}
            </p>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              {type === "compliance" && <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />}
              {tagText}
            </span>
          )}

          <h1 className={headingClasses}>{title}</h1>
          <p className={descriptionClasses}>{description}</p>
        </div>
      </div>
    </section>
  );
}