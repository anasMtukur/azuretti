const partners = [
  { name: "Nigerian Export Promotion Council", abbr: "NEPC" },
  { name: "Federal Ministry of Trade",         abbr: "FMT"  },
  { name: "First Bank Nigeria",                abbr: "FBN"  },
  { name: "Nexim Bank",                        abbr: "NEXIM"},
  { name: "Ebury",                             abbr: "EBURY"},
  { name: "Bureau Veritas",                    abbr: "BV"   },
  { name: "SGS",                               abbr: "SGS"  },
];

export function PartnersBand() {
  return (
    <section className="py-12 bg-white border-y border-border" aria-label="Partners">
      <div className="container-theme">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 text-center mb-8">
          Collaborating with leading Nigerian &amp; international institutions
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {partners.map(({ name, abbr }) => (
            <div key={name} title={name} className="flex flex-col items-center gap-1 group">
              {/* Placeholder logo block */}
              <div className="h-10 px-4 rounded border border-border bg-neutral-50 flex items-center justify-center group-hover:border-primary-200 group-hover:bg-primary-50 transition-colors duration-150">
                <span className="font-display font-bold text-sm text-neutral-400 group-hover:text-primary-600 transition-colors duration-150">
                  {abbr}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 text-center max-w-[100px] leading-tight hidden sm:block">
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
