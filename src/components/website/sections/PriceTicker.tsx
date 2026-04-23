"use client";

/**
 * PriceTicker
 * Horizontally scrolling commodity price ticker.
 * In production this data is fetched from an API / DB.
 * The static data here is placeholder until the live feed is wired up.
 */

const samplePrices = [
  { commodity: "Hibiscus Flower",  market: "Kano",     price: "₦1,850/kg",  change: "+2.3%" },
  { commodity: "Sesame Seeds",     market: "Lagos",    price: "₦1,120/kg",  change: "+0.8%" },
  { commodity: "Cocoa Beans",      market: "Int'l",    price: "$2,560/MT",  change: "-1.1%" },
  { commodity: "Raw Cashew Nut",   market: "Abuja",    price: "₦3,400/kg",  change: "+3.0%" },
  { commodity: "Sorghum",          market: "Kano",     price: "₦420/kg",    change: "+1.2%" },
  { commodity: "Gum Arabic",       market: "Int'l",    price: "$3,200/MT",  change: "-0.4%" },
  { commodity: "Ginger (dried)",   market: "Lagos",    price: "₦2,100/kg",  change: "+4.5%" },
  { commodity: "Sheanuts",         market: "Abuja",    price: "₦980/kg",    change: "+1.8%" },
  { commodity: "Sunflower Seeds",  market: "Int'l",    price: "$520/MT",    change: "-0.6%" },
  { commodity: "Millet",           market: "Kano",     price: "₦380/kg",    change: "+0.5%" },
];

// Duplicate for seamless infinite loop
const tickerItems = [...samplePrices, ...samplePrices];

export function PriceTicker() {
  return (
    <section className="bg-neutral-900 py-4 overflow-hidden" aria-label="Commodity prices">
      <div className="flex items-center">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-2 px-5 bg-accent-500 text-neutral-900 h-full py-2.5 z-10">
          <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Market Prices
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="flex animate-ticker gap-0" style={{ width: "max-content" }}>
            {tickerItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-6 border-r border-neutral-800 whitespace-nowrap"
              >
                <span className="text-xs font-semibold text-white">
                  {item.commodity}
                </span>
                <span className="text-xs text-neutral-400">{item.market}</span>
                <span className="text-xs font-bold text-accent-400">{item.price}</span>
                <span
                  className={`text-[10px] font-medium ${
                    item.change.startsWith("+") ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
