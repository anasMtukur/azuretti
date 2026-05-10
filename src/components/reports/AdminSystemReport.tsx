"use client";

/**
 * src/components/reports/AdminSystemReport.tsx
 * Renders the full system report data returned from the API.
 */

import type { SystemReport } from "@/lib/reports";
import {
  KpiCard, ReportSection, StatusBreakdown, SimpleTable,
} from "./index";

interface Props { report: SystemReport }

function fmtEur(n: number) {
  return n.toLocaleString("en-EU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}
function fmtMt(n: number) {
  return `${n.toFixed(3)} MT`;
}

export function AdminSystemReport({ report }: Props) {
  const { overview, warehouse, demands, payments, shipments, commodities, topExporters, topBuyers } = report;

  return (
    <div className="space-y-5">

      {/* ── Overview KPIs ───────────────────────────────── */}
      <ReportSection title="Overview" defaultOpen>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard label="Total Demands"      value={overview.totalDemands}     accent="blue"    />
          <KpiCard label="Fulfilled"          value={overview.fulfilledDemands} sub={overview.fulfilmentRate}  accent="green"   />
          <KpiCard label="Total GMV"          value={fmtEur(overview.totalGmvEur)}   accent="green"   />
          <KpiCard label="Total MT Traded"    value={fmtMt(overview.totalMtTraded)}  accent="purple"  />
          <KpiCard label="Active Exporters"   value={overview.activeExporters}  accent="amber"   />
          <KpiCard label="Active Buyers"      value={overview.activeBuyers}     accent="blue"    />
          <KpiCard label="Warehouse Receipts" value={overview.totalReceipts}    accent="neutral" />
          <KpiCard label="Payments Confirmed" value={overview.totalPayments}    accent="green"   />
        </div>
      </ReportSection>

      {/* ── Warehouse ────────────────────────────────────── */}
      <ReportSection title="Warehouse" badge={String(warehouse.totalReceipts)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <KpiCard label="MT Received"   value={fmtMt(warehouse.totalMtReceived)}   accent="blue"    />
          <KpiCard label="MT Approved"   value={fmtMt(warehouse.totalMtApproved)}   accent="green"   />
          <KpiCard label="MT In Stock"   value={fmtMt(warehouse.totalMtInStock)}    accent="green"   />
          <KpiCard label="MT Dispatched" value={fmtMt(warehouse.totalMtDispatched)} accent="neutral" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">By Warehouse Location</p>
            <SimpleTable
              columns={[
                { key: "location", label: "Location" },
                { key: "mt",       label: "MT Received", align: "right" },
              ]}
              rows={warehouse.byLocation.map(r => ({ location: r.location, mt: fmtMt(r.mt) }))}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">By Commodity</p>
            <SimpleTable
              columns={[
                { key: "commodity", label: "Commodity" },
                { key: "mt",        label: "MT Received", align: "right" },
              ]}
              rows={warehouse.byCommodity.map(r => ({ commodity: r.commodity, mt: fmtMt(r.mt) }))}
            />
          </div>
        </div>
      </ReportSection>

      {/* ── Demands ──────────────────────────────────────── */}
      <ReportSection title="Demands & Quotes" badge={String(demands.total)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-6">
          <KpiCard label="Total Demands"  value={demands.total}              accent="blue"  />
          <KpiCard label="RFQs Sent"      value={demands.rfqCount}           accent="purple"/>
          <KpiCard label="RFQ Conversion" value={demands.rfqConversionRate}  accent="green" />
        </div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">By Status</p>
        <StatusBreakdown rows={demands.byStatus} />
      </ReportSection>

      {/* ── Payments ─────────────────────────────────────── */}
      <ReportSection title="Payments & Settlement">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="Payments Confirmed"  value={payments.totalConfirmed}                    accent="green"   />
          <KpiCard label="Total Value"         value={fmtEur(payments.totalValueEur)}             accent="green"   />
          <KpiCard label="Pending Settlement"  value={payments.pendingSettlement}                 accent="amber"   />
          <KpiCard label="Settled"             value={payments.settledCount}                      accent="blue"    />
          <KpiCard label="Settled Value"       value={fmtEur(payments.settledValueEur)}           accent="green"   />
        </div>
      </ReportSection>

      {/* ── Shipments ────────────────────────────────────── */}
      <ReportSection title="Shipments" badge={String(shipments.total)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-6">
          <KpiCard label="Total Shipments" value={shipments.total}     accent="blue"  />
          <KpiCard label="Delivered"       value={shipments.delivered} accent="green" />
        </div>
        {shipments.byStatus.length > 0 && (
          <>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">By Status</p>
            <StatusBreakdown rows={shipments.byStatus} />
          </>
        )}
        {shipments.topDestinationPorts.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Top Destination Ports</p>
            <SimpleTable
              columns={[
                { key: "port",  label: "Port" },
                { key: "count", label: "Shipments", align: "right" },
              ]}
              rows={shipments.topDestinationPorts}
            />
          </div>
        )}
      </ReportSection>

      {/* ── Commodities ──────────────────────────────────── */}
      <ReportSection title="Commodity Breakdown" badge={String(commodities.length)}>
        <SimpleTable
          columns={[
            { key: "commodityName", label: "Commodity" },
            { key: "category",      label: "Category"  },
            { key: "mtReceived",    label: "MT Received", align: "right" },
            { key: "mtTraded",      label: "MT Traded",   align: "right" },
            { key: "demandCount",   label: "Demands",     align: "right" },
          ]}
          rows={commodities.map(r => ({
            ...r,
            mtReceived: fmtMt(r.mtReceived),
            mtTraded:   fmtMt(r.mtTraded),
          }))}
        />
      </ReportSection>

      {/* ── Top Exporters ────────────────────────────────── */}
      <ReportSection title="Top Exporters" badge={String(topExporters.length)}>
        <SimpleTable
          columns={[
            { key: "exporterName",  label: "Exporter"        },
            { key: "exporterEmail", label: "Email"           },
            { key: "mtSupplied",    label: "MT Supplied",  align: "right" },
            { key: "revenueEur",    label: "Revenue (EUR)", align: "right" },
            { key: "receiptCount",  label: "Receipts",     align: "right" },
          ]}
          rows={topExporters.map(r => ({
            ...r,
            mtSupplied:  fmtMt(r.mtSupplied),
            revenueEur:  fmtEur(r.revenueEur),
          }))}
          empty="No exporter data for this period"
        />
      </ReportSection>

      {/* ── Top Buyers ───────────────────────────────────── */}
      <ReportSection title="Top Buyers" badge={String(topBuyers.length)}>
        <SimpleTable
          columns={[
            { key: "buyerName",   label: "Buyer"                       },
            { key: "buyerEmail",  label: "Email"                       },
            { key: "mtPurchased", label: "MT Purchased", align: "right" },
            { key: "spendEur",    label: "Spend (EUR)",  align: "right" },
            { key: "demandCount", label: "Demands",      align: "right" },
          ]}
          rows={topBuyers.map(r => ({
            ...r,
            mtPurchased: fmtMt(r.mtPurchased),
            spendEur:    fmtEur(r.spendEur),
          }))}
          empty="No buyer data for this period"
        />
      </ReportSection>
    </div>
  );
}
