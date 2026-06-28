const partners = [
  { name: "Nigerian Export Promotion Council", abbr: "NEPC",     logo: "/images/partners/nepc.png"     },
  { name: "Akiro Logistics Limited",           abbr: "AKIRO",    logo: "/images/partners/akiro.png"    },
  { name: "Aldi",                              abbr: "ALDI",     logo: "/images/partners/aldi.png"     },
  { name: "Nexim Bank",                        abbr: "NEXIM",    logo: "/images/partners/nexim.png"    },
  { name: "Ebury",                             abbr: "EBURY",    logo: "/images/partners/ebury.png"    },
  { name: "Amazon",                            abbr: "AMAZON",   logo: "/images/partners/amazon.png"   },
  { name: "Carefour",                          abbr: "CAREFOUR", logo: "/images/partners/carefour.png" },
  { name: "Jati Market",                       abbr: "JATI",     logo: "/images/partners/jati.png"     },
  { name: "Skylab",                            abbr: "SKYLAB",   logo: "/images/partners/skylab.png"   },
];

export function PartnersBand() {
  return (
    <section className="py-12 bg-white border-y border-border" aria-label="Partners">
      <div className="container-theme">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 text-center mb-8">
          Collaborating with leading Nigerian &amp; international institutions
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map(({ name, abbr, logo }) => (
            <div key={abbr} title={name} className="flex flex-col items-center gap-2 group">
              {/* Fixed dimensional wrapper bounding box */}
              <div className="w-36 h-12 px-3 rounded border border-border bg-neutral-50 flex items-center justify-center group-hover:border-primary-200 group-hover:bg-primary-50 transition-all duration-150 overflow-hidden">
                <img
                  src={logo}
                  alt={`${abbr} logo`}
                  /* max-h-full + max-w-full + object-contain forces uniformity across all aspect ratios */
                  className="max-h-full max-w-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-150"
                />
              </div>
              <span className="text-[10px] text-neutral-400 text-center max-w-[120px] leading-tight hidden sm:block">
                {name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-xs text-neutral-400 max-w-lg mx-auto">
          We are trusted by major global and Nigerian institutions to ensure compliance,
          trade finance and market access across the export value chain.
        </p>
      </div>
    </section>
  );
}