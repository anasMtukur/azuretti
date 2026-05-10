"use client";

/**
 * src/app/admin/reports/page.tsx
 *
 * Admin report hub. Three tabs:
 *   1. System Report   — full platform overview
 *   2. Exporter Report — pick one exporter, generate their report
 *   3. Buyer Report    — pick one buyer, generate their report
 */

import { useState, useEffect, useCallback } from "react";
import {
  ReportPeriodSelector,
  ReportExportButtons,
} from "@/components/reports";
import type { PeriodParams } from "@/components/reports";
import { AdminSystemReport }                from "@/components/reports/AdminSystemReport";
import { AdminExporterReport, AdminBuyerReport } from "@/components/reports/AdminExporterBuyerReports";
import type { SystemReport, ExporterReport, BuyerReport } from "@/lib/reports";
import {
  BarChart3, Users, Package, Loader2,
  RefreshCw, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "system" | "exporter" | "buyer";

interface UserOption { id: string; name: string | null; email: string }

// ── Period params → query string ───────────────────────────────────────────

function periodToQs(p: PeriodParams): string {
  const params = new URLSearchParams({ mode: p.mode });
  if (p.year)  params.set("year",  String(p.year));
  if (p.month) params.set("month", String(p.month));
  if (p.from)  params.set("from",  p.from);
  if (p.to)    params.set("to",    p.to);
  return params.toString();
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [tab, setTab]       = useState<Tab>("system");
  const [period, setPeriod] = useState<PeriodParams>({ mode: "all" });

  // System report state
  const [systemReport,  setSystemReport]  = useState<SystemReport | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);

  // Exporter report state
  const [exporters,        setExporters]        = useState<UserOption[]>([]);
  const [selectedExporter, setSelectedExporter] = useState<string>("");
  const [exporterReport,   setExporterReport]   = useState<ExporterReport | null>(null);
  const [exporterLoading,  setExporterLoading]  = useState(false);

  // Buyer report state
  const [buyers,        setBuyers]        = useState<UserOption[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");
  const [buyerReport,   setBuyerReport]   = useState<BuyerReport | null>(null);
  const [buyerLoading,  setBuyerLoading]  = useState(false);

  // ── Fetch user lists on mount ────────────────────────
  useEffect(() => {
    fetch("/api/admin/users?role=exporter&role=farmer&limit=200")
      .then(r => r.json())
      .then(d => setExporters(d.users ?? []));
    fetch("/api/admin/users?role=buyer&limit=200")
      .then(r => r.json())
      .then(d => setBuyers(d.users ?? []));
  }, []);

  // ── Generate system report ───────────────────────────
  async function generateSystem() {
    setSystemLoading(true);
    setSystemReport(null);
    try {
      const res  = await fetch(`/api/admin/reports/system?${periodToQs(period)}`);
      const data = await res.json();
      setSystemReport(data);
    } finally {
      setSystemLoading(false);
    }
  }

  // ── Generate exporter report ─────────────────────────
  async function generateExporter() {
    if (!selectedExporter) return;
    setExporterLoading(true);
    setExporterReport(null);
    try {
      const res  = await fetch(`/api/admin/reports/exporter/${selectedExporter}?${periodToQs(period)}`);
      const data = await res.json();
      setExporterReport(data);
    } finally {
      setExporterLoading(false);
    }
  }

  // ── Generate buyer report ────────────────────────────
  async function generateBuyer() {
    if (!selectedBuyer) return;
    setBuyerLoading(true);
    setBuyerReport(null);
    try {
      const res  = await fetch(`/api/admin/reports/buyer/${selectedBuyer}?${periodToQs(period)}`);
      const data = await res.json();
      setBuyerReport(data);
    } finally {
      setBuyerLoading(false);
    }
  }

  const TABS = [
    { key: "system"   as Tab, label: "System Report",   icon: BarChart3 },
    { key: "exporter" as Tab, label: "Exporter Report", icon: Package   },
    { key: "buyer"    as Tab, label: "Buyer Report",    icon: Users     },
  ];

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">Reports & Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Generate system-wide or user-specific reports for any time period.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
              tab === key
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── SYSTEM TAB ──────────────────────────────────── */}
      {tab === "system" && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <ReportPeriodSelector value={period} onChange={setPeriod} />
            </div>
            <div className="flex items-center gap-3">
              {systemReport && (
                <ReportExportButtons
                  apiEndpoint="/api/admin/reports/system"
                  periodParams={period}
                  reportName="system-report"
                />
              )}
              <button
                type="button"
                disabled={systemLoading}
                onClick={generateSystem}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {systemLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <BarChart3 className="h-4 w-4" />}
                {systemLoading ? "Generating…" : "Generate Report"}
              </button>
            </div>
          </div>

          {/* Report output */}
          {systemLoading && <LoadingPlaceholder label="Generating system report…" />}
          {systemReport && <AdminSystemReport report={systemReport} />}
          {!systemReport && !systemLoading && (
            <EmptyState
              label="Choose a period and click Generate Report"
              icon={BarChart3}
            />
          )}
        </div>
      )}

      {/* ── EXPORTER TAB ────────────────────────────────── */}
      {tab === "exporter" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <ReportPeriodSelector value={period} onChange={setPeriod} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Exporter picker */}
              <div className="relative">
                <select
                  value={selectedExporter}
                  onChange={e => { setSelectedExporter(e.target.value); setExporterReport(null); }}
                  className="input py-2 pr-9 text-sm w-64 appearance-none bg-white"
                >
                  <option value="" disabled>Select exporter / farmer</option>
                  {exporters.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>

              {exporterReport && (
                <ReportExportButtons
                  apiEndpoint={`/api/admin/reports/exporter/${selectedExporter}`}
                  periodParams={period}
                  reportName="exporter-report"
                />
              )}
              <button
                type="button"
                disabled={exporterLoading || !selectedExporter}
                onClick={generateExporter}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {exporterLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Package className="h-4 w-4" />}
                {exporterLoading ? "Generating…" : "Generate Report"}
              </button>
            </div>
          </div>

          {exporterLoading && <LoadingPlaceholder label="Generating exporter report…" />}
          {exporterReport  && <AdminExporterReport report={exporterReport} />}
          {!exporterReport && !exporterLoading && (
            <EmptyState label="Select an exporter and click Generate Report" icon={Package} />
          )}
        </div>
      )}

      {/* ── BUYER TAB ───────────────────────────────────── */}
      {tab === "buyer" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <ReportPeriodSelector value={period} onChange={setPeriod} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Buyer picker */}
              <div className="relative">
                <select
                  value={selectedBuyer}
                  onChange={e => { setSelectedBuyer(e.target.value); setBuyerReport(null); }}
                  className="input py-2 pr-9 text-sm w-64 appearance-none bg-white"
                >
                  <option value="" disabled>Select buyer</option>
                  {buyers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>

              {buyerReport && (
                <ReportExportButtons
                  apiEndpoint={`/api/admin/reports/buyer/${selectedBuyer}`}
                  periodParams={period}
                  reportName="buyer-report"
                />
              )}
              <button
                type="button"
                disabled={buyerLoading || !selectedBuyer}
                onClick={generateBuyer}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {buyerLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Users className="h-4 w-4" />}
                {buyerLoading ? "Generating…" : "Generate Report"}
              </button>
            </div>
          </div>

          {buyerLoading && <LoadingPlaceholder label="Generating buyer report…" />}
          {buyerReport  && <AdminBuyerReport report={buyerReport} />}
          {!buyerReport && !buyerLoading && (
            <EmptyState label="Select a buyer and click Generate Report" icon={Users} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function LoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-neutral-400 gap-3">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function EmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon:  React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3 rounded-2xl border-2 border-dashed border-border">
      <Icon className="h-10 w-10 text-neutral-200" />
      <p className="text-sm text-neutral-400">{label}</p>
    </div>
  );
}
