/**
 * src/lib/warehouse.ts
 * ============================================================
 * Shared utilities for the warehousing feature.
 * Used by API routes, server components and seed scripts.
 * ============================================================
 */

// ── Unit conversion ────────────────────────────────────────────────────────

const KG_PER_LB  = 0.453592;
const KG_PER_MT  = 1000;

/**
 * Convert any supported unit to metric tonnes.
 * For sacks: sacksCount * avgSackWeightKg / 1000
 */
export function toMetricTonnes(
  rawQuantity: number,
  unit: "kg" | "lbs" | "mt" | "sacks",
  sacksCount?: number,
  avgSackWeightKg?: number
): number {
  switch (unit) {
    case "mt":
      return rawQuantity;
    case "kg":
      return rawQuantity / KG_PER_MT;
    case "lbs":
      return (rawQuantity * KG_PER_LB) / KG_PER_MT;
    case "sacks": {
      if (!sacksCount || !avgSackWeightKg) {
        throw new Error("sacksCount and avgSackWeightKg are required for sacks unit");
      }
      return (sacksCount * avgSackWeightKg) / KG_PER_MT;
    }
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}

/** Convert metric tonnes to kg */
export function mtToKg(mt: number): number {
  return mt * KG_PER_MT;
}

/** Format a MT value for display */
export function formatMt(mt: number | string, decimals = 3): string {
  return `${parseFloat(String(mt)).toFixed(decimals)} MT`;
}

/** Format raw quantity with its unit label */
export function formatRawQty(
  qty: number | string,
  unit: string,
  sacksCount?: number | null
): string {
  const n = parseFloat(String(qty));
  if (unit === "sacks" && sacksCount) return `${sacksCount} sacks (${n.toFixed(1)} kg avg)`;
  if (unit === "mt")  return `${n.toFixed(3)} MT`;
  if (unit === "kg")  return `${n.toFixed(1)} kg`;
  if (unit === "lbs") return `${n.toFixed(1)} lbs`;
  return `${n} ${unit}`;
}

// ── Receipt reference generation ───────────────────────────────────────────

const locationPrefix: Record<string, string> = {
  kano:   "KN",
  abuja:  "AB",
  france: "FR",
  other:  "OT",
};

/**
 * Generate a human-readable warehouse receipt reference.
 * Format: WR-{LOCATION}-{YEAR}-{SEQUENCE}
 * e.g. WR-KN-2025-0042
 */
export function generateReceiptRef(
  location: string,
  sequence: number
): string {
  const year   = new Date().getFullYear();
  const prefix = locationPrefix[location] ?? "OT";
  const seq    = String(sequence).padStart(4, "0");
  return `WR-${prefix}-${year}-${seq}`;
}

// ── Status display helpers ─────────────────────────────────────────────────

export type ReceiptStatus =
  | "pending_inspection"
  | "inspected"
  | "approved"
  | "rejected"
  | "dispatched"
  | "partial_dispatch";

export const RECEIPT_STATUS_META: Record<
  ReceiptStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending_inspection: { label: "Pending Inspection", bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  inspected:          { label: "Inspected",          bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  approved:           { label: "In Stock",           bg: "#dcf5e5", text: "#176340", dot: "#16a34a" },
  rejected:           { label: "Rejected",           bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
  dispatched:         { label: "Dispatched",         bg: "#f3f4f6", text: "#374151", dot: "#6b7280" },
  partial_dispatch:   { label: "Partial Dispatch",   bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
};

export const WAREHOUSE_LOCATION_LABELS: Record<string, string> = {
  kano:   "Kano, Nigeria",
  abuja:  "Abuja, Nigeria",
  france: "Villeneuve-sur-Lot, France",
  other:  "Other",
};

export const WEIGHT_UNIT_LABELS: Record<string, string> = {
  kg:    "Kilograms (kg)",
  lbs:   "Pounds (lbs)",
  mt:    "Metric Tonnes (MT)",
  sacks: "Sacks",
};
