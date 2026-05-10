"use client";

/**
 * src/app/portal/exporter/reports/page.tsx
 */

import { useState } from "react";
import {
  ReportPeriodSelector,
  ReportExportButtons,
} from "@/components/reports";
import type { PeriodParams } from "@/components/reports";
import { ExporterOwnReport } from "@/components/reports/PortalReports";
import type { ExporterReport } from "@/lib/reports";
import { BarChart3, Loader2, FileText } from "lucide-react";

function periodToQs(p: PeriodParams): string {
  const params = new URLSearchParams({ mode: p.mode });
  if (p.year)  params.set("year",  String(p.year));
  if (p.month) params.set("month", String(p.month));
  if (p.from)  params.set("from",  p.from);
  if (p.to)    params.set("to",    p.to);
  return params.toString();
}

export default function ExporterReportsPage() {
  const [period,  setPeriod]  = useState<PeriodParams>({ mode: "all" });
  const [report,  setReport]  = useState<ExporterReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setReport(null);
    try {
      const res  = await fetch(`/api/portal/exporter/reports?${periodToQs(period)}`);
      const data = await res.json();
      setReport(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">My Reports</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Generate a comprehensive report of your warehouse activity, sales and settlements.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[300px]">
          <ReportPeriodSelector value={period} onChange={setPeriod} />
        </div>
        <div className="flex items-center gap-3">
          {report && (
            <ReportExportButtons
              apiEndpoint="/api/portal/exporter/reports"
              periodParams={period}
              reportName="my-report"
            />
          )}
          <button
            type="button"
            disabled={loading}
            onClick={generate}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <BarChart3 className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Output */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-neutral-400 gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">Generating your report…</span>
        </div>
      )}

      {report && <ExporterOwnReport report={report} />}

      {!report && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border-2 border-dashed border-border">
          <FileText className="h-10 w-10 text-neutral-200" />
          <p className="text-sm text-neutral-400">
            Select a period above and click Generate Report
          </p>
        </div>
      )}
    </div>
  );
}
