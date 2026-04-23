import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, User, FileText } from "lucide-react";
import { formatDate, formatMt } from "@/lib/utils";
import {
  RECEIPT_STATUS_META,
  WAREHOUSE_LOCATION_LABELS,
  formatRawQty,
  type ReceiptStatus,
} from "@/lib/warehouse";

interface Item {
  id:                   string;
  commodityName:        string | null;
  commodityCategory:    string | null;
  rawQuantity:          string;
  rawUnit:              string;
  sacksCount:           number | null;
  avgSackWeightKg:      string | null;
  quantityMt:           string;
  quantityDispatchedMt: string;
  grade:                string | null;
  moistureContent:      string | null;
  impurityLevel:        string | null;
  inspectionNotes:      string | null;
}

interface Receipt {
  id:                string;
  receiptRef:        string;
  status:            string;
  warehouseLocation: string;
  warehouseName:     string | null;
  arrivedAt:         Date;
  inspectedAt:       Date | null;
  approvedAt:        Date | null;
  notes:             string | null;
  ownerName:         string | null;
  ownerEmail:        string | null;
}

interface Props {
  receipt:  Receipt;
  items:    Item[];
  readOnly?: boolean;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  pulses: { bg: "#dcf5e5", text: "#176340" },
  grains: { bg: "#fef3c7", text: "#92400e" },
  seeds:  { bg: "#dbeafe", text: "#1e40af" },
  nuts:   { bg: "#fce7f3", text: "#9d174d" },
};

export function ReceiptDetailView({ receipt, items, readOnly = false }: Props) {
  const meta       = RECEIPT_STATUS_META[receipt.status as ReceiptStatus];
  const totalMt    = items.reduce((s, i) => s + parseFloat(i.quantityMt || "0"), 0);
  const dispatchMt = items.reduce((s, i) => s + parseFloat(i.quantityDispatchedMt || "0"), 0);
  const remaining  = totalMt - dispatchMt;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={readOnly ? "/portal/exporter/warehouse" : "/admin/warehouse/receipts"}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {readOnly ? "My Warehouse" : "Receipts"}
      </Link>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-mono font-bold text-2xl text-neutral-900">{receipt.receiptRef}</h1>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: meta.bg, color: meta.text }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: meta.dot }} />
                {meta.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {receipt.ownerName ?? receipt.ownerEmail}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {WAREHOUSE_LOCATION_LABELS[receipt.warehouseLocation] ?? receipt.warehouseLocation}
                {receipt.warehouseName && ` — ${receipt.warehouseName}`}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Arrived {formatDate(receipt.arrivedAt)}
              </div>
              {receipt.inspectedAt && (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Calendar className="h-4 w-4" />
                  Inspected {formatDate(receipt.inspectedAt)}
                </div>
              )}
              {receipt.approvedAt && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <Calendar className="h-4 w-4" />
                  Approved {formatDate(receipt.approvedAt)}
                </div>
              )}
            </div>

            {receipt.notes && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-neutral-50 text-sm text-neutral-600">
                <FileText className="h-4 w-4 shrink-0 mt-0.5 text-neutral-400" />
                {receipt.notes}
              </div>
            )}
          </div>

          {/* MT summary */}
          <div className="flex gap-4 shrink-0">
            {[
              { label: "Total In",   value: `${totalMt.toFixed(3)} MT`,    color: "text-neutral-900" },
              { label: "Dispatched", value: `${dispatchMt.toFixed(3)} MT`, color: "text-neutral-400" },
              { label: "Remaining",  value: `${remaining.toFixed(3)} MT`,  color: remaining > 0 ? "text-green-600" : "text-neutral-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
                <p className="text-xs text-neutral-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Commodity Items ({items.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Commodity", "As Received", "Converted (MT)", "Grade", "Moisture", "Impurity", "Remaining MT", "Notes"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const colors = categoryColors[item.commodityCategory ?? ""] ?? { bg: "#f1f5f9", text: "#334155" };
                const remaining = parseFloat(item.quantityMt || "0") - parseFloat(item.quantityDispatchedMt || "0");

                return (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{item.commodityName ?? "—"}</p>
                      {item.commodityCategory && (
                        <span
                          className="text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {item.commodityCategory}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-700 whitespace-nowrap">
                      {formatRawQty(item.rawQuantity, item.rawUnit, item.sacksCount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-neutral-900">
                      {parseFloat(item.quantityMt).toFixed(4)} MT
                    </td>
                    <td className="px-4 py-3">
                      {item.grade ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                          {item.grade}
                        </span>
                      ) : <span className="text-neutral-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">
                      {item.moistureContent ? `${parseFloat(item.moistureContent).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">
                      {item.impurityLevel ? `${parseFloat(item.impurityLevel).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-semibold ${remaining > 0 ? "text-green-700" : "text-neutral-400"}`}>
                        {remaining.toFixed(4)} MT
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 max-w-[200px] truncate">
                      {item.inspectionNotes ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
