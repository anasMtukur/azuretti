import { Warehouse } from "lucide-react"; // Ensured icon component is present

export function InfrastructureSectionImage() {
  return (
    /* Infrastructure */
    <section className="section-padding bg-primary-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      
      {/* Background Accent Ambient Glow for the Center Asset */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-400/5 rounded-full blur-[120px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="px-8 relative z-10">
        <div className="text-center max-w-full mx-auto mb-16">
          <span className="section-label mb-4 justify-center text-accent-400 inline-flex items-center gap-2">
            <span className="block w-6 h-0.5 bg-accent-400" />
            Our Infrastructure
          </span>
          <h2 className="font-display font-bold text-white text-3xl sm:text-4xl">
            Warehousing on both sides of the trade
          </h2>
        </div>

        {/* Modern Asymmetrical 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="col-span-2 grid grid-cols-1 gap-4">
            <div className="p-7 rounded-xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-sm self-stretch flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🇳🇬</span>
                  <div>
                    <p className="font-display font-bold text-xl text-white">Nigeria</p>
                    <p className="text-accent-400 font-semibold text-sm">4,000 MT capacity</p>
                  </div>
                </div>
                <p className="text-sm text-primary-200 leading-relaxed mb-6">
                  Storage capacity across strategic hubs in Kano and Abuja, close to major commodity-producing regions.
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/5">
                {["Kano – Ibrahim Taiwo Road", "Abuja – Maitama"].map((loc) => (
                  <div key={loc} className="flex items-center gap-2 text-xs text-primary-300">
                    <Warehouse className="h-3.5 w-3.5 text-accent-500 shrink-0" />
                    {loc}
                  </div>
                ))}
              </div>
            </div>
            {/* 3. France Hub Card */}
            <div className="p-7 rounded-xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-sm self-stretch flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🇫🇷</span>
                  <div>
                    <p className="font-display font-bold text-xl text-white">France</p>
                    <p className="text-accent-400 font-semibold text-sm">3,500 MT capacity</p>
                  </div>
                </div>
                <p className="text-sm text-primary-200 leading-relaxed mb-6">
                  Storage close to major logistics corridors, enabling just-in-time deliveries to European buyers across the continent.
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/5">
                {["Villeneuve-sur-Lot, 79 Avenue de Bias"].map((loc) => (
                  <div key={loc} className="flex items-center gap-2 text-xs text-primary-300">
                    <Warehouse className="h-3.5 w-3.5 text-accent-500 shrink-0" />
                    {loc}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-3">
            {/* 2. Centerpiece Image Display (Stylish & Interactive) */}
            <div className="relative group w-full aspect-video col-span-3 rounded-xl self-stretch min-h-[320px] lg:min-h-[40vh]">
              {/* Structural External Wireframe Frame */}
              <div 
                className="absolute inset-0 border border-white/10 rounded-xl translate-y-3 translate-x-3 pointer-events-none transition-transform duration-300 group-hover:translate-y-2 group-hover:translate-x-2" 
                aria-hidden="true" 
              />
              {/* Image Outer Shell */}
              <div className="relative w-full h-full overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
                <img
                  src="/images/wh.jpg"
                  alt="Azuretti logistics warehouse facility"
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                {/* Subtle top/bottom overlay mask for content consistency */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/50 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded bg-primary-950/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-wider text-white/70 uppercase">
                  Fully Compliant Hubs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}