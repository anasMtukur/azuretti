"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { CheckCircle2, XCircle, FlaskConical, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { RECEIPT_STATUS_META, type ReceiptStatus } from "@/lib/warehouse";
import { cn } from "@/lib/utils";

interface Item {
  id:              string;
  commodityName:   string | null;
  grade:           string | null;
  moistureContent: string | null;
  impurityLevel:   string | null;
  inspectionNotes: string | null;
}

interface Receipt {
  id:     string;
  status: string;
}

interface ItemState {
  grade:           string;
  moistureContent: string;
  impurityLevel:   string;
  inspectionNotes: string;
}

interface Props {
  receipt: Receipt;
  items:   Item[];
}

const NEXT_ACTIONS: Partial<Record<ReceiptStatus, { label: string; status: ReceiptStatus; icon: React.ElementType; className: string }[]>> = {
  pending_inspection: [
    { label: "Mark as Inspected", status: "inspected", icon: FlaskConical, className: "bg-blue-600 text-white hover:bg-blue-700" },
    { label: "Reject",            status: "rejected",  icon: XCircle,      className: "bg-red-100 text-red-700 hover:bg-red-200" },
  ],
  inspected: [
    { label: "Approve & Put in Stock", status: "approved", icon: CheckCircle2, className: "bg-primary-600 text-white hover:bg-primary-700" },
    { label: "Reject",                 status: "rejected", icon: XCircle,      className: "bg-red-100 text-red-700 hover:bg-red-200" },
  ],
};

export function InspectionPanel({ receipt, items }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading]     = useState<string | null>(null);
  const [notes, setNotes]         = useState(receipt.status === "rejected" ? "" : "");
  const [expanded, setExpanded]   = useState(false);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(
    Object.fromEntries(
      items.map((item) => [
        item.id,
        {
          grade:           item.grade           ?? "",
          moistureContent: item.moistureContent ?? "",
          impurityLevel:   item.impurityLevel   ?? "",
          inspectionNotes: item.inspectionNotes ?? "",
        },
      ])
    )
  );

  const currentStatus  = receipt.status as ReceiptStatus;
  const availableActions = NEXT_ACTIONS[currentStatus] ?? [];
  const meta           = RECEIPT_STATUS_META[currentStatus];

  function updateItemState(id: string, field: keyof ItemState, value: string) {
    setItemStates((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function handleAction(targetStatus: ReceiptStatus) {
    setLoading(targetStatus);
    try {
      const itemUpdates = items.map((item) => {
        const state = itemStates[item.id];
        return {
          id:              item.id,
          grade:           state?.grade           || undefined,
          moistureContent: state?.moistureContent ? parseFloat(state.moistureContent) : undefined,
          impurityLevel:   state?.impurityLevel   ? parseFloat(state.impurityLevel)   : undefined,
          inspectionNotes: state?.inspectionNotes || undefined,
        };
      });

      const res = await fetch(`/api/warehouse/receipts/${receipt.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: targetStatus, notes: notes || undefined, itemUpdates }),
      });

      if (res.ok) {
        const label = RECEIPT_STATUS_META[targetStatus].label;
        success("Receipt updated", `Status changed to "${label}"`);
        router.refresh();
      } else {
        const json = await res.json();
        error("Update failed", json.error ?? "Please try again.");
      }
    } finally {
      setLoading(null);
    }
  }

  // Nothing to do if already in a terminal state
  if (availableActions.length === 0) {
    return (
      <div className="card p-6 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.dot }} />
        <p className="text-sm text-neutral-600">
          This receipt is <strong>{meta.label}</strong>. No further actions available.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5 border-2 border-dashed border-primary-200 bg-primary-50/30">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg text-neutral-900">
          Inspection Actions
        </h2>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: meta.bg, color: meta.text }}
        >
          Currently: {meta.label}
        </span>
      </div>

      {/* Per-item grading */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? "Hide" : "Edit"} per-item inspection data
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-white border border-border">
                <p className="font-semibold text-sm text-neutral-900 mb-3">{item.commodityName}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="label text-xs">Grade</label>
                    <input
                      type="text"
                      className="input py-1.5 text-xs"
                      placeholder="e.g. Grade A"
                      value={itemStates[item.id]?.grade ?? ""}
                      onChange={(e) => updateItemState(item.id, "grade", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Moisture (%)</label>
                    <input
                      type="number" step="0.1" min="0" max="100"
                      className="input py-1.5 text-xs"
                      placeholder="e.g. 10.5"
                      value={itemStates[item.id]?.moistureContent ?? ""}
                      onChange={(e) => updateItemState(item.id, "moistureContent", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Impurity (%)</label>
                    <input
                      type="number" step="0.1" min="0" max="100"
                      className="input py-1.5 text-xs"
                      placeholder="e.g. 2.0"
                      value={itemStates[item.id]?.impurityLevel ?? ""}
                      onChange={(e) => updateItemState(item.id, "impurityLevel", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Notes</label>
                    <input
                      type="text"
                      className="input py-1.5 text-xs"
                      placeholder="Observations…"
                      value={itemStates[item.id]?.inspectionNotes ?? ""}
                      onChange={(e) => updateItemState(item.id, "inspectionNotes", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General notes */}
      <div>
        <label className="label">Receipt-level notes / rejection reason</label>
        <textarea
          rows={2}
          className="input resize-none text-sm"
          placeholder="Add any notes about this receipt's status change…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {availableActions.map(({ label, status, icon: Icon, className }) => (
          <button
            key={status}
            type="button"
            disabled={!!loading}
            onClick={() => handleAction(status)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition-all disabled:opacity-50",
              className
            )}
          >
            {loading === status ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
