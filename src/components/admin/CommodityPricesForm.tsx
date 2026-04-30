"use client";

/**
 * src/components/admin/CommodityPricesForm.tsx
 *
 * Inline price editing table — one row per commodity.
 * Each row shows the commodity name, the last recorded price (read-only
 * reference), and editable inputs for the new price, market, state and
 * currency. A live "change preview" badge updates as the admin types,
 * showing the signed diff from the last price.
 *
 * "Save All Prices" submits every dirty row (rows where the price or
 * market has changed from the last saved value) as a single batch POST
 * to /api/admin/commodity-prices.
 *
 * The server computes the actual priceChange from the DB — the preview
 * here is a client-side estimate for immediate feedback.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Save, Loader2, TrendingUp, TrendingDown,
  Minus, RefreshCw, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface CommodityRow {
  id:       string;
  name:     string;
  slug:     string;
  category: string;
}

export interface LatestPrice {
  commodityId: string;
  pricePerKg:  string;
  priceChange: string | null;
  market:      string;
  state:       string | null;
  currency:    string;
  recordedAt:  Date | string;
}

interface Props {
  commodities:  CommodityRow[];
  latestPrices: Record<string, LatestPrice>;
}

// Per-row edit state
interface RowState {
  price:    string;   // raw input value
  market:   string;
  state:    string;
  currency: "NGN" | "EUR" | "USD";
  dirty:    boolean;  // true once the user has changed something
}

const MARKETS   = ["International", "Kano", "Lagos", "Abuja", "Enugu"];
const CURRENCIES= ["NGN", "EUR", "USD"] as const;

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  pulses: { bg: "#dcf5e5", text: "#176340" },
  grains: { bg: "#fef3c7", text: "#92400e" },
  seeds:  { bg: "#dbeafe", text: "#1e40af" },
  nuts:   { bg: "#fce7f3", text: "#9d174d" },
};

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/**
 * Preview the signed change from `prev` to `next`.
 * Returns null when prev is absent (first entry).
 */
function previewChange(
  prevStr: string | undefined,
  nextStr: string
): { label: string; positive: boolean; zero: boolean } | null {
  const prev = prevStr ? parseFloat(prevStr) : null;
  const next = parseFloat(nextStr);

  if (prev === null || isNaN(next) || next <= 0) return null;

  const diff = next - prev;
  const abs  = Math.abs(diff);
  const formatted =
    abs % 1 === 0 ? String(abs) : abs.toFixed(2).replace(/\.?0+$/, "");

  return {
    label:    diff === 0 ? "0" : diff > 0 ? `+${formatted}` : `-${formatted}`,
    positive: diff > 0,
    zero:     diff === 0,
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export function CommodityPricesForm({ commodities, latestPrices }: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  // Initialise row state from latest prices
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      commodities.map((c) => {
        const latest = latestPrices[c.id];
        return [
          c.id,
          {
            price:    latest ? String(parseFloat(latest.pricePerKg)) : "",
            market:   latest?.market  ?? "Kano",
            state:    latest?.state   ?? "",
            currency: (latest?.currency ?? "NGN") as "NGN" | "EUR" | "USD",
            dirty:    false,
          },
        ];
      })
    )
  );

  const [saving, setSaving] = useState(false);

  function updateRow(id: string, patch: Partial<RowState>) {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch, dirty: true },
    }));
  }

  function resetRow(id: string) {
    const latest = latestPrices[id];
    setRows((prev) => ({
      ...prev,
      [id]: {
        price:    latest ? String(parseFloat(latest.pricePerKg)) : "",
        market:   latest?.market  ?? "Kano",
        state:    latest?.state   ?? "",
        currency: (latest?.currency ?? "NGN") as "NGN" | "EUR" | "USD",
        dirty:    false,
      },
    }));
  }

  const dirtyCount = useMemo(
    () => Object.values(rows).filter((r) => r.dirty && r.price).length,
    [rows]
  );

  async function handleSave() {
    const entries = commodities
      .filter((c) => rows[c.id]?.dirty && rows[c.id]?.price)
      .map((c) => ({
        commodityId: c.id,
        pricePerKg:  parseFloat(rows[c.id].price),
        market:      rows[c.id].market,
        state:       rows[c.id].state || undefined,
        currency:    rows[c.id].currency,
      }));

    if (entries.length === 0) {
      error("Nothing to save", "Edit at least one price before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/commodity-prices", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ entries }),
      });

      if (res.ok) {
        const json = await res.json();
        success(
          "Prices saved",
          `${json.count} price${json.count !== 1 ? "s" : ""} updated successfully.`
        );
        // Reset dirty flags
        setRows((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, row]) => [id, { ...row, dirty: false }])
          )
        );
        router.refresh();
      } else {
        const json = await res.json();
        error("Save failed", json.error ?? "Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  // Group commodities by category
  const grouped = commodities.reduce<Record<string, CommodityRow[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Sticky save bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-border shadow-sm sticky top-4 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">
            {dirtyCount > 0 ? (
              <span className="font-semibold text-primary-700">
                {dirtyCount} commodity price{dirtyCount !== 1 ? "s" : ""} ready to save
              </span>
            ) : (
              "Edit prices below, then save all at once."
            )}
          </span>
          {dirtyCount > 0 && (
            <span className="text-xs text-neutral-400">
              Change preview updates as you type
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <button
              type="button"
              onClick={() =>
                commodities.forEach((c) => rows[c.id]?.dirty && resetRow(c.id))
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset changes
            </button>
          )}
          <button
            type="button"
            disabled={saving || dirtyCount === 0}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save All Prices"}
          </button>
        </div>
      </div>

      {/* Category groups */}
      {Object.entries(grouped).map(([category, items]) => {
        const colors = CATEGORY_COLORS[category] ?? { bg: "#f1f5f9", text: "#334155" };
        return (
          <div key={category} className="card overflow-hidden">
            {/* Category header */}
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ background: colors.bg }}
            >
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {category}
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: colors.text + "22", color: colors.text }}
              >
                {items.length}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    {[
                      "Commodity",
                      "Last Price",
                      "Last Recorded",
                      "New Price / kg",
                      "Market",
                      "State",
                      "Currency",
                      "Change Preview",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {items.map((commodity) => {
                    const row    = rows[commodity.id];
                    const latest = latestPrices[commodity.id];
                    const change = previewChange(latest?.pricePerKg, row.price);

                    return (
                      <tr
                        key={commodity.id}
                        className={cn(
                          "transition-colors",
                          row.dirty && row.price
                            ? "bg-primary-50/40"
                            : "hover:bg-neutral-50"
                        )}
                      >
                        {/* Name */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-neutral-900">
                            {commodity.name}
                          </p>
                          {row.dirty && row.price && (
                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wide">
                              edited
                            </span>
                          )}
                        </td>

                        {/* Last price — read-only reference */}
                        <td className="px-4 py-3">
                          {latest ? (
                            <div>
                              <span className="font-mono font-semibold text-neutral-700">
                                {parseFloat(latest.pricePerKg).toLocaleString("en-NG")}
                              </span>
                              <span className="text-xs text-neutral-400 ml-1">
                                {latest.currency}/kg
                              </span>
                              {latest.priceChange && (
                                <span
                                  className={cn(
                                    "ml-1.5 text-xs font-bold",
                                    latest.priceChange.startsWith("+")
                                      ? "text-green-600"
                                      : latest.priceChange.startsWith("-")
                                      ? "text-red-500"
                                      : "text-neutral-400"
                                  )}
                                >
                                  {latest.priceChange}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-300">No price yet</span>
                          )}
                        </td>

                        {/* Last recorded date */}
                        <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                          {latest ? fmtDate(latest.recordedAt) : "—"}
                        </td>

                        {/* New price input */}
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="0.0000"
                            value={row.price}
                            onChange={(e) =>
                              updateRow(commodity.id, { price: e.target.value })
                            }
                            className={cn(
                              "w-32 px-2.5 py-1.5 rounded border text-sm font-mono text-right",
                              "focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow",
                              row.dirty && row.price
                                ? "border-primary-400 bg-primary-50"
                                : "border-border bg-white"
                            )}
                          />
                        </td>

                        {/* Market select */}
                        <td className="px-4 py-3">
                          <div className="relative">
                            <select
                              value={row.market}
                              onChange={(e) =>
                                updateRow(commodity.id, { market: e.target.value })
                              }
                              className="w-32 pl-2.5 pr-7 py-1.5 rounded border border-border bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {MARKETS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                          </div>
                        </td>

                        {/* State input */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="e.g. Kano"
                            value={row.state}
                            onChange={(e) =>
                              updateRow(commodity.id, { state: e.target.value })
                            }
                            className="w-28 px-2.5 py-1.5 rounded border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </td>

                        {/* Currency */}
                        <td className="px-4 py-3">
                          <div className="relative">
                            <select
                              value={row.currency}
                              onChange={(e) =>
                                updateRow(commodity.id, {
                                  currency: e.target.value as "NGN" | "EUR" | "USD",
                                })
                              }
                              className="w-20 pl-2 pr-6 py-1.5 rounded border border-border bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {CURRENCIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400 pointer-events-none" />
                          </div>
                        </td>

                        {/* Live change preview */}
                        <td className="px-4 py-3 text-sm font-mono font-bold whitespace-nowrap">
                          {change === null ? (
                            <span className="text-neutral-300 text-xs font-normal">
                              {row.price ? "first entry" : "—"}
                            </span>
                          ) : change.zero ? (
                            <span className="flex items-center gap-1 text-neutral-400">
                              <Minus className="h-3.5 w-3.5" />
                              0
                            </span>
                          ) : change.positive ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {change.label}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500">
                              <TrendingDown className="h-3.5 w-3.5" />
                              {change.label}
                            </span>
                          )}
                        </td>

                        {/* Reset row */}
                        <td className="px-4 py-3">
                          {row.dirty && (
                            <button
                              type="button"
                              onClick={() => resetRow(commodity.id)}
                              className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                              title="Reset this row"
                            >
                              ↩
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
