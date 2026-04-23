/**
 * src/components/shared/ReceiptItemCertBadge.tsx
 *
 * Compact badge shown on receipt item rows and cards to indicate
 * that test results / certifications have been uploaded and are
 * available for viewing/download.
 *
 * Props:
 *   docCount  — total number of documents on this item
 *   visible   — number of those documents visible to buyers
 *   adminView — when true shows the full count; otherwise shows
 *               only buyer-visible count (for buyer/exporter views)
 */

import { ShieldCheck, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  docCount:  number;
  visible:   number;
  adminView?: boolean;
  className?: string;
}

export function ReceiptItemCertBadge({
  docCount,
  visible,
  adminView = false,
  className,
}: Props) {
  const count = adminView ? docCount : visible;

  if (count === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "text-[11px] font-bold tracking-wide border",
        "bg-emerald-50 text-emerald-700 border-emerald-200",
        className
      )}
      title={`${count} document${count !== 1 ? "s" : ""} available`}
    >
      <ShieldCheck className="h-3 w-3 shrink-0" />
      {count} cert{count !== 1 ? "s" : ""}
    </span>
  );
}

/**
 * Larger pill variant — used on the receipt item detail card header.
 */
export function ReceiptItemCertPill({
  docCount,
  visible,
  adminView = false,
}: Props) {
  const count = adminView ? docCount : visible;

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
      <div className="flex items-center gap-1.5 text-emerald-700">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-sm font-semibold">
          {count} document{count !== 1 ? "s" : ""} available
        </span>
      </div>
      <span className="text-xs text-emerald-600">
        {adminView
          ? `${visible} visible to buyers`
          : "Test results & certifications"}
      </span>
    </div>
  );
}