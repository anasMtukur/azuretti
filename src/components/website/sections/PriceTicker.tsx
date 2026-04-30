"use client";

import { useState, useEffect } from "react";

export function PriceTicker() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/commodity-prices")
      .then((res) => res.json())
      .then(setData);
  }, []);
  
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
            {data.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-6 border-r border-neutral-800 whitespace-nowrap"
              >
                <span className="text-xs font-semibold text-white">
                  {item.commodity}
                </span>
                <span className="text-xs text-neutral-400">{item.market}</span>
                <span className="text-xs font-bold text-accent-400">{item.price}</span>
                {item.change && <span
                  className={`text-[10px] font-medium ${
                    item.change.startsWith("+") ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.change}
                </span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
