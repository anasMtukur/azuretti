"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { theme } from "@/config/theme";
import { PreviewCommodity } from "./CommoditiesPreview";

const categoryLabels: Record<string, string> = {
  pulses: "Pulses",
  grains: "Grains",
  seeds:  "Seeds",
  nuts:   "Nuts",
};

const categoryImages: Record<string, string> = {
  pulses: "/images/commodities/pulses.jpg",
  grains: "/images/commodities/grains.jpg",
  seeds:  "/images/commodities/seeds.jpg",
  nuts:   "/images/commodities/nuts.jpg",
};

type Category = keyof typeof theme.commodityColors;

interface CurtainGridProps {
  groupedData: Record<string, PreviewCommodity[]>;
}

export function CommoditiesCurtainGrid({ groupedData }: CurtainGridProps) {
  // Start with the first category pulled open by default
  const [activeCategory, setActiveCategory] = useState<string>("pulses");

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[43vh] w-full overflow-hidden select-none">
      {Object.entries(groupedData).map(([category, items]) => {
        const isExpanded = activeCategory === category;
        const label = categoryLabels[category] || category;
        const bgImage = categoryImages[category] || "/images/commodities/default.jpg";

        return (
          <div
            key={category}
            className={`relative h-[40vh] transition-all duration-500 ease-in-out border border-border rounded-xl overflow-hidden flex ${
              isExpanded ? "flex-1 bg-neutral-50/50" : "w-full lg:w-[60px] h-[60px] lg:h-[40vh] cursor-pointer"
            }`}
            onClick={() => !isExpanded && setActiveCategory(category)}
          >
            {/* --- THE CURTAIN BAR (60px Image Panel) --- */}
            <div
              className={`relative shrink-0 flex items-center justify-center transition-all duration-500 ${
                isExpanded 
                  ? "w-full lg:w-[120px] h-[60px] lg:h-[40vh] border-b lg:border-b-0 lg:border-r border-border" 
                  : "w-full lg:w-[60px] h-[40vh]"
              }`}
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.65)), url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h3 
                className={`font-display font-bold text-white tracking-wider uppercase transition-all duration-300 ${
                  isExpanded 
                    ? "text-sm lg:text-base" 
                    : "text-xs lg:-rotate-90 lg:whitespace-nowrap transform tracking-widest"
                }`}
              >
                {label}
              </h3>
            </div>

            {/* --- REVEALED CONTENT: Your Original Items Grid --- */}
            <div
              className={`flex-1 p-6 transition-all duration-300 max-h-[40vh] overflow-y-auto ${
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-neutral-900 capitalize">{label} Portfolio</h4>
                  <p className="text-xs text-neutral-500 mt-1">Select a commodity below to review testing sheets and documentation.</p>
                </div>
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md">
                  {items.length} Products
                </span>
              </div>

              {/* Your exact card components layout grid rendered cleanly inside */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map(({ name, slug }) => {
                  const colors = theme.commodityColors[category as Category] ?? 
                                 theme.commodityColors.default;
                  return (
                    <Link
                      key={slug}
                      href={`/commodities/${slug}`}
                      className="group relative flex flex-col gap-3 p-4 rounded-lg border border-border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Category dot + label */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: colors.dot }}
                        />
                        <span
                          className="text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: colors.text }}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Name */}
                      <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors leading-snug">
                        {name}
                      </p>

                      {/* Arrow on hover */}
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-150 self-end mt-auto" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}