"use client";

/**
 * src/components/reports/AdminExporterReport.tsx
 * src/components/reports/AdminBuyerReport.tsx
 * Both exported from this file.
 */

import type { ExporterReport, BuyerReport } from "@/lib/reports";
import {
  KpiCard, ReportSection, StatusBreakdown, SimpleTable,
} from "./index";

function fmtEur(n: number) {
  return n.toLocaleString("en-EU", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  });
}
function fmtMt(n: number) { return `${n.toFixed(3)} MT`; }

// ══════════════════════════════════════════════════════════════
// ADMIN EXPORTER REPORT
// ══════════════════════════════════════════════════════════════

interface ExporterReportProps { report: ExporterReport }

export function AdminExporterReport({ report }: ExporterReportProps) {
  const { meta, warehouse, sales, commodities } = report;

  return (
    <div className="space-y-5">

      {/* Identity banner */}
      <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
        <p className="text-sm font-semibold text-primary-900">{meta.exporterName}</p>
        <p className="text-xs text-primary-600">{meta.exporterEmail}</p>
        <p className="text-xs text-primary-400 mt-1">Period: {meta.period}</p>
      </div>

      {/* ── Warehouse ─────────────────────────────────── */}
      <ReportSection title="Warehouse Activity" badge={String(warehouse.receiptCount)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="Receipts Logged"  value={warehouse.receiptCount}              accent="blue"    />
          <KpiCard label="MT Received"      value={fmtMt(warehouse.totalMtReceived)}    accent="blue"    />
          <KpiCard label="MT In Stock"      value={fmtMt(warehouse.totalMtInStock)}     accent="green"   />
          <KpiCard label="MT Dispatched"    value={fmtMt(warehouse.totalMtDispatched)}  accent="neutral" />
          <KpiCard label="Approved Batches" value={warehouse.approved}                  accent="green"   />
        </div>
        {warehouse.pendingInspection > 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              {warehouse.pendingInspection} batch{warehouse.pendingInspection !== 1 ? "es" : ""} pending inspection
            </p>
          </div>
        )}
      </ReportSection>

      {/* ── Sales & Settlement ────────────────────────── */}
      <ReportSection title="Sales & Settlement">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-5">
          <KpiCard label="Allocations"       value={sales.totalAllocations}              accent="blue"    />
          <KpiCard label="MT Allocated"      value={fmtMt(sales.totalMtAllocated)}       accent="purple"  />
          <KpiCard label="Total Revenue"     value={fmtEur(sales.totalRevenueEur)}       accent="green"   />
          <KpiCard label="Settled"           value={sales.settledCount}                  accent="green"   />
          <KpiCard label="Settled Value"     value={fmtEur(sales.settledValueEur)}       accent="green"   />
          <KpiCard label="Pending Settlement"value={sales.pendingSettlement}             accent="amber"   />
        </div>

        {/* Settlement breakdown bar */}
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Settlement Status
        </p>
        <StatusBreakdown
          rows={[
            { status: "settled",    count: sales.settledCount      },
            { status: "pending",    count: sales.pendingSettlement },
          ]}
        />
      </ReportSection>

      {/* ── Commodity Breakdown ───────────────────────── */}
      <ReportSection title="Commodity Breakdown" badge={String(commodities.length)}>
        <SimpleTable
          columns={[
            { key: "commodityName", label: "Commodity"             },
            { key: "mtReceived",    label: "MT Received", align: "right" },
            { key: "mtSold",        label: "MT Sold",     align: "right" },
            { key: "revenueEur",    label: "Revenue",     align: "right" },
          ]}
          rows={commodities.map(r => ({
            commodityName: r.commodityName,
            mtReceived:    fmtMt(r.mtReceived),
            mtSold:        fmtMt(r.mtSold),
            revenueEur:    fmtEur(r.revenueEur),
          }))}
          empty="No commodity data for this period"
        />
      </ReportSection>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADMIN BUYER REPORT
// ══════════════════════════════════════════════════════════════

interface BuyerReportProps { report: BuyerReport }

export function AdminBuyerReport({ report }: BuyerReportProps) {
  const { meta, demands, spend, shipments, commodities } = report;

  return (
    <div className="space-y-5">

      {/* Identity banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-sm font-semibold text-blue-900">{meta.buyerName}</p>
        <p className="text-xs text-blue-600">{meta.buyerEmail}</p>
        <p className="text-xs text-blue-400 mt-1">Period: {meta.period}</p>
      </div>

      {/* ── Demands ───────────────────────────────────── */}
      <ReportSection title="Demands" badge={String(demands.total)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-5">
          <KpiCard label="Total Demands"  value={demands.total}     accent="blue"    />
          <KpiCard label="Fulfilled"      value={demands.fulfilled}  accent="green"   />
          <KpiCard label="In Progress"    value={demands.pending}    accent="amber"   />
          <KpiCard label="Cancelled"      value={demands.cancelled}  accent="neutral" />
          <KpiCard label="RFQs Sent"      value={demands.rfqCount}   accent="purple"  />
        </div>
        <StatusBreakdown
          rows={[
            { status: "fulfilled", count: demands.fulfilled },
            { status: "pending",   count: demands.pending   },
            { status: "cancelled", count: demands.cancelled },
          ]}
        />
      </ReportSection>

      {/* ── Spend ─────────────────────────────────────── */}
      <ReportSection title="Spend">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <KpiCard label="Payments Made"   value={spend.totalPayments}            accent="blue"   />
          <KpiCard label="Total Spend"     value={fmtEur(spend.totalSpendEur)}    accent="green"  />
          <KpiCard label="Total MT Ordered"value={fmtMt(spend.totalMtOrdered)}    accent="purple" />
        </div>
      </ReportSection>

      {/* ── Shipments ─────────────────────────────────── */}
      <ReportSection title="Shipments" badge={String(shipments.total)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
          <KpiCard label="Total"      value={shipments.total}     accent="blue"    />
          <KpiCard label="Delivered"  value={shipments.delivered}  accent="green"   />
          <KpiCard label="In Transit" value={shipments.inTransit}  accent="purple"  />
          <KpiCard label="Booked"     value={shipments.booked}     accent="amber"   />
        </div>
        <StatusBreakdown
          rows={[
            { status: "delivered",  count: shipments.delivered  },
            { status: "in_transit", count: shipments.inTransit  },
            { status: "booked",     count: shipments.booked     },
          ]}
        />
      </ReportSection>

      {/* ── Commodity Breakdown ───────────────────────── */}
      <ReportSection title="Commodity Breakdown" badge={String(commodities.length)}>
        <SimpleTable
          columns={[
            { key: "commodityName", label: "Commodity"             },
            { key: "mtOrdered",     label: "MT Ordered", align: "right" },
            { key: "spendEur",      label: "Spend",      align: "right" },
            { key: "demandCount",   label: "Demands",    align: "right" },
          ]}
          rows={commodities.map(r => ({
            commodityName: r.commodityName,
            mtOrdered:     fmtMt(r.mtOrdered),
            spendEur:      fmtEur(r.spendEur),
            demandCount:   r.demandCount,
          }))}
          empty="No commodity data for this period"
        />
      </ReportSection>
    </div>
  );
}
