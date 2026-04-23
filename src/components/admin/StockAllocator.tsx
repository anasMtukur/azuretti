"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";
import { Loader2, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────
interface ReceiptBatch {
  id:                   string;
  receiptRef:           string;
  commodityName:        string;
  warehouseLocation:    string;
  grade:                string | null;
  remainingMt:          number;
  ownerName:            string | null;
  ownerEmail:           string;
  exporterUserId:       string;
}

interface AllocationRow {
  receiptItemId:  string;
  exporterUserId: string;
  allocatedMt:    number;
  pricePerMt:     number;
  currency:       string;
  notes:          string;
}

interface Props {
  demandId:         string;
  commodityId:      string;
  quantityNeededMt: number;
  currency?:        string;
  existingAllocations?: AllocationRow[];
}

// ── Component ─────────────────────────────────────────────────────────────
export function StockAllocator({
  demandId,
  commodityId,
  quantityNeededMt,
  currency = "EUR",
  existingAllocations = [],
}: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  const [batches, setBatches]         = useState<ReceiptBatch[]>([]);
  const [loadingBatches, setLoading]  = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  // Allocation state: receiptItemId → { allocatedMt, pricePerMt, notes }
  const [allocs, setAllocs] = useState<Record<string, {
    allocatedMt: number;
    pricePerMt:  number;
    notes:       string;
  }>>(
    Object.fromEntries(
      existingAllocations.map((a) => [
        a.receiptItemId,
        { allocatedMt: a.allocatedMt, pricePerMt: a.pricePerMt, notes: a.notes },
      ])
    )
  );

  // Load available approved batches for this commodity
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/warehouse/allocation-batches?commodityId=${commodityId}`
        );
        const data = await res.json();
        setBatches(data.batches ?? []);
      } catch {
        error("Failed to load stock", "Could not fetch available batches.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [commodityId]);

  // Derived totals
  const totalAllocatedMt = useMemo(
    () => Object.values(allocs).reduce((s, a) => s + (a.allocatedMt || 0), 0),
    [allocs]
  );
  const gapMt            = quantityNeededMt - totalAllocatedMt;
  const isOver           = totalAllocatedMt > quantityNeededMt;
  const totalValue = useMemo(
    () =>
      Object.entries(allocs).reduce((s, [, a]) => s + (a.allocatedMt || 0) * (a.pricePerMt || 0), 0),
    [allocs]
  );

  function setAllocField(
    id: string,
    field: "allocatedMt" | "pricePerMt" | "notes",
    value: number | string,
    exporterUserId: string
  ) {
    setAllocs((prev) => ({
      ...prev,
      [id]: {
        allocatedMt: prev[id]?.allocatedMt ?? 0,
        pricePerMt:  prev[id]?.pricePerMt  ?? 0,
        notes:       prev[id]?.notes       ?? "",
        exporterUserId,
        [field]: value,
      } as any,
    }));
  }

  async function handleSubmit() {
    const allocations = batches
      .filter((b) => (allocs[b.id]?.allocatedMt ?? 0) > 0)
      .map((b) => ({
        receiptItemId:  b.id,
        exporterUserId: b.exporterUserId,
        allocatedMt:    allocs[b.id]?.allocatedMt ?? 0,
        pricePerMt:     allocs[b.id]?.pricePerMt  ?? 0,
        currency,
        notes:          allocs[b.id]?.notes ?? "",
      }));

    if (allocations.length === 0) {
      error("No stock allocated", "Enter an amount for at least one batch.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/demands/${demandId}/allocate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ allocations }),
      });
      if (res.ok) {
        success("Stock allocated", "Demand moved to allocated status.");
        router.refresh();
      } else {
        const json = await res.json();
        error("Allocation failed", json.error ?? "Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Progress summary */}
      <div className="p-5 rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-neutral-700">Allocation progress</div>
          <div className={cn("text-sm font-mono font-bold", isOver ? "text-error" : gapMt <= 0 ? "text-green-600" : "text-amber-600")}>
            {totalAllocatedMt.toFixed(3)} / {quantityNeededMt.toFixed(3)} MT
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn("h-2.5 rounded-full transition-all duration-300",
              isOver ? "bg-error" : gapMt <= 0 ? "bg-green-500" : "bg-amber-400"
            )}
            style={{ width: `${Math.min((totalAllocatedMt / quantityNeededMt) * 100, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
          <span>
            {gapMt > 0 ? (
              <span className="text-amber-600 font-medium">
                <AlertTriangle className="inline h-3.5 w-3.5 mr-0.5" />
                {gapMt.toFixed(3)} MT still needed
              </span>
            ) : isOver ? (
              <span className="text-error font-medium">
                Over-allocated by {Math.abs(gapMt).toFixed(3)} MT
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                <CheckCircle2 className="inline h-3.5 w-3.5 mr-0.5" />
                Fully allocated
              </span>
            )}
          </span>
          {totalValue > 0 && (
            <span>
              Total value: <span className="font-semibold text-neutral-700">
                {totalValue.toLocaleString("en-EU", { style: "currency", currency, maximumFractionDigits: 0 })}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Batch table */}
      {loadingBatches ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading available stock…
        </div>
      ) : batches.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-border bg-neutral-50">
          <p className="text-sm font-medium text-neutral-600">No approved stock available</p>
          <p className="text-xs text-neutral-400 mt-1">
            Approve warehouse receipts for this commodity first.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Receipt", "Owner", "Warehouse", "Grade", "Available (MT)", "Allocate (MT)", `Price/${currency}/MT`, "Notes"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {batches.map((batch) => {
                const allocated = allocs[batch.id]?.allocatedMt ?? 0;
                const exhausted = batch.remainingMt === 0;
                return (
                  <tr
                    key={batch.id}
                    className={cn(
                      "transition-colors",
                      exhausted ? "opacity-40" : "hover:bg-neutral-50",
                      allocated > 0 && "bg-primary-50/50"
                    )}
                  >
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs text-neutral-700">{batch.receiptRef}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium text-neutral-900">{batch.ownerName ?? "—"}</p>
                      <p className="text-[11px] text-neutral-400">{batch.ownerEmail}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-neutral-600 whitespace-nowrap">
                      {WAREHOUSE_LOCATION_LABELS[batch.warehouseLocation] ?? batch.warehouseLocation}
                    </td>
                    <td className="px-3 py-3">
                      {batch.grade ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                          {batch.grade}
                        </span>
                      ) : <span className="text-neutral-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-neutral-700 whitespace-nowrap">
                      {batch.remainingMt.toFixed(3)}
                    </td>
                    {/* Allocate input */}
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        step="0.001"
                        min={0}
                        max={batch.remainingMt}
                        disabled={exhausted}
                        value={allocs[batch.id]?.allocatedMt ?? ""}
                        onChange={(e) =>
                          setAllocField(batch.id, "allocatedMt", parseFloat(e.target.value) || 0, batch.exporterUserId)
                        }
                        className="w-24 px-2 py-1.5 rounded border border-border text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                        placeholder="0.000"
                      />
                    </td>
                    {/* Price input */}
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        disabled={exhausted}
                        value={allocs[batch.id]?.pricePerMt ?? ""}
                        onChange={(e) =>
                          setAllocField(batch.id, "pricePerMt", parseFloat(e.target.value) || 0, batch.exporterUserId)
                        }
                        className="w-28 px-2 py-1.5 rounded border border-border text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                        placeholder="0.00"
                      />
                    </td>
                    {/* Notes */}
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        disabled={exhausted}
                        value={allocs[batch.id]?.notes ?? ""}
                        onChange={(e) =>
                          setAllocField(batch.id, "notes", e.target.value, batch.exporterUserId)
                        }
                        className="w-36 px-2 py-1.5 rounded border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-50"
                        placeholder="Optional"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={submitting || loadingBatches || totalAllocatedMt === 0 || isOver}
          onClick={handleSubmit}
          className="btn-primary px-7 py-2.5 text-sm"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving allocation…</>
          ) : (
            <><Save className="h-4 w-4" /> Confirm Allocation</>
          )}
        </button>
        {gapMt > 0 && totalAllocatedMt > 0 && (
          <p className="text-xs text-amber-600">
            Warning: {gapMt.toFixed(3)} MT gap — demand will be partially fulfilled.
          </p>
        )}
      </div>
    </div>
  );
}
