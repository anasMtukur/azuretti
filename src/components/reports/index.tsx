"use client";

/**
 * src/components/reports/index.tsx
 * ══════════════════════════════════════════════════════════════
 * Shared report UI components — all exported from one file.
 *
 * Components:
 *   ReportPeriodSelector  — period mode picker + inputs
 *   ReportExportButtons   — CSV + JSON download
 *   KpiCard               — single metric display
 *   ReportSection         — collapsible section wrapper
 *   StatusBreakdown       — horizontal bar of status counts
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from "react";
import {
  Calendar, Download, ChevronDown, ChevronUp,
  FileText, Braces, Loader2, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PeriodMode } from "@/lib/reports";

// ── ReportPeriodSelector ───────────────────────────────────────────────────

interface PeriodSelectorProps {
  value:    PeriodParams;
  onChange: (p: PeriodParams) => void;
}

export interface PeriodParams {
  mode:   PeriodMode;
  year?:  number;
  month?: number;
  from?:  string;
  to?:    string;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export function ReportPeriodSelector({ value, onChange }: PeriodSelectorProps) {
  function set(patch: Partial<PeriodParams>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-border">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-white rounded-lg border border-border p-0.5">
        {([
          { mode: "monthly" as PeriodMode, label: "Month" },
          { mode: "annual"  as PeriodMode, label: "Year"  },
          { mode: "range"   as PeriodMode, label: "Range" },
          { mode: "all"     as PeriodMode, label: "All time" },
        ]).map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => set({ mode })}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              value.mode === mode
                ? "bg-primary-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Monthly controls */}
      {value.mode === "monthly" && (
        <>
          <select
            value={value.month ?? new Date().getMonth() + 1}
            onChange={e => set({ month: parseInt(e.target.value) })}
            className="input py-1.5 text-sm w-36"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={value.year ?? CURRENT_YEAR}
            onChange={e => set({ year: parseInt(e.target.value) })}
            className="input py-1.5 text-sm w-24"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </>
      )}

      {/* Annual controls */}
      {value.mode === "annual" && (
        <select
          value={value.year ?? CURRENT_YEAR}
          onChange={e => set({ year: parseInt(e.target.value) })}
          className="input py-1.5 text-sm w-24"
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}

      {/* Range controls */}
      {value.mode === "range" && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500 font-medium">From</label>
            <input
              type="date"
              value={value.from ?? ""}
              onChange={e => set({ from: e.target.value })}
              className="input py-1.5 text-sm w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-500 font-medium">To</label>
            <input
              type="date"
              value={value.to ?? ""}
              onChange={e => set({ to: e.target.value })}
              className="input py-1.5 text-sm w-36"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── ReportExportButtons ────────────────────────────────────────────────────

interface ExportButtonsProps {
  apiEndpoint: string;   // e.g. /api/admin/reports/system
  periodParams: PeriodParams;
  reportName:   string;  // used in filename
}

export function ReportExportButtons({
  apiEndpoint,
  periodParams,
  reportName,
}: ExportButtonsProps) {
  const [loadingCsv,  setLoadingCsv]  = useState(false);
  const [loadingJson, setLoadingJson] = useState(false);

  function buildUrl(format: "csv" | "json") {
    const url = new URL(apiEndpoint, window.location.origin);
    url.searchParams.set("format", format);
    url.searchParams.set("mode",   periodParams.mode);
    if (periodParams.year)  url.searchParams.set("year",  String(periodParams.year));
    if (periodParams.month) url.searchParams.set("month", String(periodParams.month));
    if (periodParams.from)  url.searchParams.set("from",  periodParams.from);
    if (periodParams.to)    url.searchParams.set("to",    periodParams.to);
    return url.toString();
  }

  async function download(format: "csv" | "json") {
    const setLoading = format === "csv" ? setLoadingCsv : setLoadingJson;
    setLoading(true);
    try {
      const res  = await fetch(buildUrl(format));
      const blob = format === "json"
        ? new Blob([JSON.stringify(await res.json(), null, 2)], { type: "application/json" })
        : await res.blob();
      const href = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = href;
      a.download = `${reportName}-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(href);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-400 font-medium mr-1">Export:</span>
      <button
        type="button"
        disabled={loadingCsv}
        onClick={() => download("csv")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-white text-xs font-semibold text-neutral-600 hover:border-primary-300 hover:text-primary-700 transition-all disabled:opacity-50"
      >
        {loadingCsv
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <FileText className="h-3.5 w-3.5" />}
        CSV
      </button>
      <button
        type="button"
        disabled={loadingJson}
        onClick={() => download("json")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-white text-xs font-semibold text-neutral-600 hover:border-primary-300 hover:text-primary-700 transition-all disabled:opacity-50"
      >
        {loadingJson
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Braces className="h-3.5 w-3.5" />}
        JSON
      </button>
    </div>
  );
}

// ── KpiCard ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label:      string;
  value:      string | number;
  sub?:       string;
  trend?:     "up" | "down" | "flat";
  trendLabel?:string;
  accent?:    "green" | "blue" | "amber" | "purple" | "neutral";
}

const ACCENT_COLORS = {
  green:   { bg: "bg-green-50",   text: "text-green-700",   icon: "text-green-500"  },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    icon: "text-blue-500"   },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: "text-amber-500"  },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  icon: "text-purple-500" },
  neutral: { bg: "bg-neutral-50", text: "text-neutral-700", icon: "text-neutral-400"},
};

export function KpiCard({
  label, value, sub, trend, trendLabel, accent = "neutral",
}: KpiCardProps) {
  const c = ACCENT_COLORS[accent];
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={cn("font-display font-bold text-2xl", c.text)}>{value}</p>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-1.5">
          {trend && trend !== "flat" && (
            trend === "up"
              ? <TrendingUp className={cn("h-3.5 w-3.5", c.icon)} />
              : <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          )}
          {trend === "flat" && <Minus className="h-3.5 w-3.5 text-neutral-300" />}
          {(sub || trendLabel) && (
            <p className="text-xs text-neutral-400">{trendLabel ?? sub}</p>
          )}
        </div>
      )}
      {sub && !trend && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── ReportSection ──────────────────────────────────────────────────────────

interface SectionProps {
  title:    string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?:   string;
}

export function ReportSection({
  title, children, defaultOpen = true, badge,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-border hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-display font-semibold text-base text-neutral-900">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold">
              {badge}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-neutral-400" />
          : <ChevronDown className="h-4 w-4 text-neutral-400" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

// ── StatusBreakdown ────────────────────────────────────────────────────────

interface StatusBreakdownProps {
  rows:    { status: string; count: number }[];
  colors?: Record<string, string>;
}

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  submitted:    "#3b82f6",
  under_review: "#f59e0b",
  quoted:       "#8b5cf6",
  accepted:     "#10b981",
  rejected:     "#ef4444",
  allocated:    "#06b6d4",
  fulfilled:    "#16a34a",
  cancelled:    "#94a3b8",
  booked:       "#3b82f6",
  loaded:       "#f59e0b",
  in_transit:   "#8b5cf6",
  delivered:    "#16a34a",
  pending:      "#f59e0b",
  processing:   "#3b82f6",
  settled:      "#16a34a",
};

export function StatusBreakdown({ rows, colors = DEFAULT_STATUS_COLORS }: StatusBreakdownProps) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  if (total === 0) return <p className="text-sm text-neutral-400">No data</p>;

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden">
        {rows.filter(r => r.count > 0).map(r => (
          <div
            key={r.status}
            style={{
              width:      `${(r.count / total) * 100}%`,
              background: colors[r.status] ?? "#94a3b8",
            }}
            title={`${r.status}: ${r.count}`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {rows.map(r => (
          <div key={r.status} className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colors[r.status] ?? "#94a3b8" }}
            />
            <span className="capitalize">{r.status.replace(/_/g, " ")}</span>
            <span className="font-semibold text-neutral-800">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SimpleTable ────────────────────────────────────────────────────────────

interface SimpleTableProps {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows:    Record<string, any>[];
  empty?:  string;
}

export function SimpleTable({ columns, rows, empty = "No data" }: SimpleTableProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-neutral-400 py-4 text-center">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-neutral-50">
            {columns.map(c => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap",
                  c.align === "right" ? "text-right" : "text-left"
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-neutral-50 transition-colors">
              {columns.map(c => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-sm text-neutral-700",
                    c.align === "right" ? "text-right font-mono" : ""
                  )}
                >
                  {row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
