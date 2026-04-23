"use client";

/**
 * src/components/admin/ShipmentStatusLogger.tsx
 *
 * Admin-only form to add a new status event to a shipment.
 * Updates both:
 *   - shipments.status           (current status)
 *   - shipment_status_events     (historical log entry)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { Ship, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "booked",     label: "Booked" },
  { value: "loaded",     label: "Loaded" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
];

interface Props {
  shipmentId:    string;
  currentStatus: string;
}

export function ShipmentStatusLogger({ shipmentId, currentStatus }: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  const [open, setOpen]       = useState(false);
  const [status, setStatus]   = useState(currentStatus);
  const [note, setNote]       = useState("");
  const [eventDate, setDate]  = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving]   = useState(false);

  async function handleSave() {
    if (!status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/shipments/${shipmentId}/status`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, note: note.trim() || null, eventDate }),
      });
      if (res.ok) {
        success("Status updated", `Shipment marked as ${STATUS_OPTIONS.find(s => s.value === status)?.label}`);
        setNote("");
        setOpen(false);
        router.refresh();
      } else {
        const json = await res.json();
        error("Update failed", json.error ?? "Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary-200 bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Log Status Update
      </button>
    );
  }

  return (
    <div className="p-5 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/30 space-y-4">
      <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
        <Ship className="h-4 w-4 text-primary-600" />
        Log Status Update
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Status */}
        <div>
          <label className="label">New Status <span className="text-error">*</span></label>
          <select
            className="input bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="label">Date <span className="text-error">*</span></label>
          <input
            type="date"
            className="input"
            value={eventDate}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Note */}
        <div>
          <label className="label">Note <span className="text-neutral-400 font-normal">(optional)</span></label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Vessel departed Apapa"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 rounded bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ship className="h-4 w-4" />}
          Save Update
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded border border-border text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}