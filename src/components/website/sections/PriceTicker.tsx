"use client";

import { useState, useEffect } from "react";

export function PriceTicker() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commodity-prices")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false)); // Gracefully handle errors to prevent permanent skeletons
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

        {/* Scrolling ticker section */}
        <div className="overflow-hidden flex-1">
          {isLoading ? (
            /* --- SKELETON LOADING STATE --- */
            <div className="flex gap-0 animate-pulse" style={{ width: "max-content" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-6 border-r border-neutral-800 whitespace-nowrap"
                >
                  {/* Commodity Name Skeleton */}
                  <div className="h-3 w-16 bg-neutral-700 rounded" />
                  {/* Market Location Skeleton */}
                  <div className="h-2.5 w-10 bg-neutral-800 rounded" />
                  {/* Price Numeric Value Skeleton */}
                  <div className="h-3 w-12 bg-neutral-700 rounded opacity-60" />
                  {/* Percentage Performance Delta Skeleton */}
                  <div className="h-2.5 w-8 bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            /* --- LIVE DATA STATE --- */
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
                  {item.change && (
                    <span
                      className={`text-[10px] font-medium ${
                        item.change.startsWith("+") ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {item.change}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}