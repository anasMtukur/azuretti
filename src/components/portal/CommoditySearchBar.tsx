"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight } from "lucide-react";

interface Suggestion {
  id:       string;
  name:     string;
  category: string;
  slug:     string;
}

export function CommoditySearchBar() {
  const router = useRouter();
  const [query, setQuery]             = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);
  const wrapperRef                    = useRef<HTMLDivElement>(null);
  const debounceRef                   = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function fetchSuggestions(q: string) {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/commodities/search?q=${encodeURIComponent(q)}&withStock=true`);
      const data = await res.json();
      setSuggestions((data.commodities ?? []).slice(0, 6));
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 280);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/portal/buyer/search?q=${encodeURIComponent(query.trim())}`);
  }

  function pickSuggestion(slug: string) {
    setOpen(false);
    router.push(`/portal/buyer/commodity/${slug}`);
  }

  const categoryColors: Record<string, string> = {
    pulses: "bg-green-100 text-green-700",
    grains: "bg-amber-100 text-amber-700",
    seeds:  "bg-blue-100 text-blue-700",
    nuts:   "bg-pink-100 text-pink-700",
  };

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-0 rounded-xl overflow-hidden bg-white shadow-xl shadow-black/20 ring-1 ring-white/10">
          <div className="flex items-center pl-4 pr-2 shrink-0">
            {loading
              ? <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
              : <Search className="h-5 w-5 text-neutral-400" />}
          </div>
          <input
            type="search"
            value={query}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search commodities — sesame seeds, ginger, cocoa…"
            className="flex-1 py-3.5 pr-3 text-neutral-900 text-sm bg-transparent outline-none placeholder:text-neutral-400"
            autoComplete="off"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-3.5 bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shrink-0"
          >
            Search
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden animate-scale-in">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pickSuggestion(s.slug)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-neutral-300 shrink-0" />
                <span className="text-sm font-medium text-neutral-800">{s.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${categoryColors[s.category] ?? "bg-neutral-100 text-neutral-500"}`}>
                  {s.category}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-primary-500 transition-colors" />
            </button>
          ))}

          {/* Full search link */}
          {query.length > 1 && (
            <button
              type="button"
              onClick={() => { setOpen(false); router.push(`/portal/buyer/search?q=${encodeURIComponent(query)}`); }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium transition-colors border-t border-border"
            >
              <Search className="h-4 w-4" />
              Search all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
