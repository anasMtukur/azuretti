"use client";

/**
 * StockFulfillment
 * ─────────────────────────────────────────────────────────────
 * Buyer-facing view of how their demand is being fulfilled from
 * warehouse stock. Mirrors the progress visual from StockAllocator.
 *
 * PRIVACY MODEL — server must pre-aggregate before passing props
 * ─────────────────────────────────────────────────────────────
 *   ✓  Warehouse location + optional bay name
 *   ✓  Commodity name + grade per batch
 *   ✓  Allocated MT (summed per location+grade pair)
 *   ✓  Dispatch status + dispatched date
 *   ✗  NO exporter names, emails, or IDs
 *   ✗  NO per-exporter quantities or prices
 *   ✗  NO receipt reference numbers
 *
 * Recommended server query (aggregate by location+grade):
 * ─────────────────────────────────────────────────────────────
 *   const rows = await db
 *     .select({
 *       // synthetic id for React key
 *       id: sql`gen_random_uuid()`.mapWith(String),
 *       warehouseLocation: warehouseReceipts.warehouseLocation,
 *       warehouseName:     warehouseReceipts.warehouseName,
 *       commodityName:     commodities.name,
 *       grade:             warehouseReceiptItems.grade,
 *       allocatedMt:       sql`SUM(${demandAllocations.allocatedMt})`
 *                            .mapWith(Number),
 *       status:            demandAllocations.status,
 *       dispatchedAt:      demandAllocations.dispatchedAt,
 *     })
 *     .from(demandAllocations)
 *     .innerJoin(warehouseReceiptItems,
 *       eq(demandAllocations.receiptItemId, warehouseReceiptItems.id))
 *     .innerJoin(warehouseReceipts,
 *       eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
 *     .leftJoin(commodities,
 *       eq(warehouseReceiptItems.commodityId, commodities.id))
 *     .where(eq(demandAllocations.demandId, params.id))
 *     .groupBy(
 *       warehouseReceipts.warehouseLocation,
 *       warehouseReceipts.warehouseName,
 *       warehouseReceiptItems.grade,
 *       commodities.name,
 *       demandAllocations.status,
 *       demandAllocations.dispatchedAt,
 *     );
 *
 *   <StockFulfillment
 *     quantityNeededMt={parseFloat(demand.quantityMt)}
 *     quotedPricePerMt={quote ? parseFloat(quote.pricePerMt) : undefined}
 *     currency={quote?.currency ?? "EUR"}
 *     allocations={rows}
 *   />
 * ─────────────────────────────────────────────────────────────
 */

import { cn } from "@/lib/utils";
import { WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MapPin,
  Package,
  Clock,
  Truck,
  ShieldCheck,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface FulfillmentBatch {
  /** Synthetic key — must NOT be a receipt reference */
  id:                string;
  /** Warehouse location enum value e.g. "kano" | "france" */
  warehouseLocation: string;
  /** Optional bay / zone from the warehouse receipt */
  warehouseName:     string | null;
  /** Commodity name */
  commodityName:     string | null;
  /** Grade designation for this batch */
  grade:             string | null;
  /**
   * Total MT from this location+grade combination.
   * Must be the SUM across all exporter contributions —
   * never a per-exporter figure.
   */
  allocatedMt:       number;
  /** Current dispatch state */
  status:            "pending" | "confirmed" | "dispatched";
  /** Present only when status === "dispatched" */
  dispatchedAt:      Date | string | null;
}

interface Props {
  /** Total MT the buyer originally requested */
  quantityNeededMt:  number;
  /** Currency code for the total value estimate */
  currency?:         string;
  /**
   * Unit price from the accepted quote.
   * When provided a total estimated value is shown in the
   * progress card footer. Omit if price is confidential.
   */
  quotedPricePerMt?: number;
  /** Pre-aggregated, anonymised batches — see doc comment above */
  allocations:       FulfillmentBatch[];
  /** True while parent is resolving the allocation query */
  loading?:          boolean;
}

// ── Status display config ──────────────────────────────────────────────────

const STATUS = {
  pending: {
    label:     "Awaiting dispatch",
    labelShort:"Pending",
    Icon:      Clock,
    text:      "text-amber-700",
    bg:        "bg-amber-50",
    border:    "border-amber-200",
    dot:       "bg-amber-500",
  },
  confirmed: {
    label:     "Confirmed",
    labelShort:"Confirmed",
    Icon:      CheckCircle2,
    text:      "text-blue-700",
    bg:        "bg-blue-50",
    border:    "border-blue-200",
    dot:       "bg-blue-500",
  },
  dispatched: {
    label:     "Dispatched",
    labelShort:"Dispatched",
    Icon:      Truck,
    text:      "text-green-700",
    bg:        "bg-green-50",
    border:    "border-green-200",
    dot:       "bg-green-600",
  },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Component ──────────────────────────────────────────────────────────────

export function DemandStockFulfillment({
  quantityNeededMt,
  currency = "EUR",
  quotedPricePerMt,
  allocations,
  loading = false,
}: Props) {

  // ── Derived values ─────────────────────────────────────────
  const totalAllocatedMt  = allocations.reduce((s, a) => s + a.allocatedMt, 0);
  const dispatchedMt      = allocations
    .filter((a) => a.status === "dispatched")
    .reduce((s, a) => s + a.allocatedMt, 0);
  const gapMt             = quantityNeededMt - totalAllocatedMt;
  const isFullyAllocated  = gapMt <= 0.0005;             // float tolerance
  const allocPct          = quantityNeededMt > 0
    ? Math.min((totalAllocatedMt / quantityNeededMt) * 100, 100)
    : 0;
  const dispatchPct       = totalAllocatedMt > 0         // inner bar within the allocated bar
    ? Math.min((dispatchedMt / totalAllocatedMt) * 100, 100)
    : 0;
  const totalValue        = quotedPricePerMt != null
    ? totalAllocatedMt * quotedPricePerMt
    : null;

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Loading fulfillment status…</span>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (allocations.length === 0) {
    return (
      <div className="p-10 rounded-xl border border-dashed border-border bg-neutral-50 text-center">
        <Package className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-neutral-600">
          Stock not yet allocated
        </p>
        <p className="text-xs text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
          Our trade team is sourcing stock to meet your order.
          You'll be notified once batches are confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ══════════════════════════════════════════════════════
          PROGRESS CARD — mirrors StockAllocator visual exactly
          ══════════════════════════════════════════════════════ */}
      <div className="p-5 rounded-xl border border-border bg-white">

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-neutral-700">
            Fulfillment progress
          </div>
          <div
            className={cn(
              "text-sm font-mono font-bold",
              isFullyAllocated ? "text-green-600" : "text-amber-600"
            )}
          >
            {totalAllocatedMt.toFixed(3)} / {quantityNeededMt.toFixed(3)} MT
          </div>
        </div>

        {/* Progress bar — outer = allocated, inner stripe = dispatched */}
        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-2.5 rounded-full transition-all duration-500 relative",
              isFullyAllocated ? "bg-green-300" : "bg-amber-300"
            )}
            style={{ width: `${allocPct}%` }}
          >
            {dispatchedMt > 0 && (
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${dispatchPct}%` }}
              />
            )}
          </div>
        </div>

        {/* Sub-row — same layout as StockAllocator */}
        <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
          <span>
            {!isFullyAllocated ? (
              <span className="text-amber-600 font-medium">
                <AlertTriangle className="inline h-3.5 w-3.5 mr-0.5" />
                {gapMt.toFixed(3)} MT pending sourcing
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                <CheckCircle2 className="inline h-3.5 w-3.5 mr-0.5" />
                Fully allocated
              </span>
            )}
          </span>

          {totalValue !== null && (
            <span>
              Total value:{" "}
              <span className="font-semibold text-neutral-700">
                {totalValue.toLocaleString("en-EU", {
                  style: "currency", currency, maximumFractionDigits: 0,
                })}
              </span>
            </span>
          )}
        </div>

        {/* Dispatched layer legend — only shown once something is dispatched */}
        {dispatchedMt > 0 && (
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-300 shrink-0" />
              Allocated ({totalAllocatedMt.toFixed(3)} MT)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
              Dispatched ({dispatchedMt.toFixed(3)} MT)
            </span>
          </div>
        )}
      </div>

      {/* ── Stat chips ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Allocated",
            value: `${totalAllocatedMt.toFixed(3)} MT`,
            sub:   `of ${quantityNeededMt.toFixed(3)} MT ordered`,
            color: isFullyAllocated ? "text-green-700" : "text-amber-700",
            bg:    isFullyAllocated
              ? "bg-green-50 border-green-100"
              : "bg-amber-50 border-amber-100",
          },
          {
            label: "Dispatched",
            value: `${dispatchedMt.toFixed(3)} MT`,
            sub:   dispatchedMt > 0 ? "in transit / delivered" : "awaiting dispatch",
            color: dispatchedMt > 0 ? "text-green-700" : "text-neutral-500",
            bg:    dispatchedMt > 0
              ? "bg-green-50 border-green-100"
              : "bg-neutral-50 border-border",
          },
          {
            label: "Batches",
            value: String(allocations.length),
            sub:   `warehouse ${allocations.length === 1 ? "batch" : "batches"}`,
            color: "text-primary-700",
            bg:    "bg-primary-50 border-primary-100",
          },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg}`}>
            <p className="text-xs text-neutral-500 font-medium mb-1">{label}</p>
            <p className={`font-display font-bold text-lg leading-none ${color}`}>
              {value}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Batch cards ──────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-0.5">
          Allocated Batches
        </p>

        {allocations.map((batch, index) => {
          const s    = STATUS[batch.status];
          const Icon = s.Icon;
          const loc  = WAREHOUSE_LOCATION_LABELS[batch.warehouseLocation]
            ?? batch.warehouseLocation;

          return (
            <div
              key={batch.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-colors",
                s.bg, s.border
              )}
            >
              {/* Batch number bubble */}
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                  "font-bold text-sm bg-white border",
                  s.text, s.border
                )}
              >
                {index + 1}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">

                {/* Commodity + grade chips */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-sm font-semibold text-neutral-900">
                    {batch.commodityName}
                  </span>
                  {batch.grade && (
                    <span className="px-2 py-0.5 rounded-full bg-white border border-border text-[11px] font-semibold text-neutral-600">
                      {batch.grade}
                    </span>
                  )}
                </div>

                {/* Metadata row */}
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <MapPin className={cn("h-3.5 w-3.5 shrink-0", s.text)} />
                    {loc}
                    {batch.warehouseName && (
                      <span className="text-neutral-400 ml-0.5">
                        — {batch.warehouseName}
                      </span>
                    )}
                  </span>

                  <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <Package className={cn("h-3.5 w-3.5 shrink-0", s.text)} />
                    <span className="font-mono font-semibold text-neutral-800">
                      {batch.allocatedMt.toFixed(3)} MT
                    </span>
                  </span>

                  {batch.dispatchedAt && (
                    <span className="flex items-center gap-1.5 text-xs text-green-700">
                      <Truck className="h-3.5 w-3.5 shrink-0" />
                      Dispatched {fmtDate(batch.dispatchedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status pill */}
              <span
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                  "text-xs font-semibold shrink-0 bg-white border",
                  s.text, s.border
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
                {s.labelShort}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Privacy + compliance footer ──────────────────────── */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-neutral-50 border border-border">
        <ShieldCheck className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Stock is sourced from verified Nigerian exporters and farmers within
          the Azuretti Trade House programme. Individual supplier details are
          managed confidentially by the Azuretti trade team in line with our
          data protection policy.
        </p>
      </div>
    </div>
  );
}