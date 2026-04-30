"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { ProofOfPaymentUploader } from "@/components/admin/ProofOfPaymentUploader";
import { SETTLEMENT_STATUS_META } from "@/lib/payments";
import {
  Loader2, CheckCircle2, ChevronDown, ChevronUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  exporterUserId: string;
  exporterName:   string | null;
  currentStatus:  string;
}

export function SettlementAction({
  exporterUserId,
  exporterName,
  currentStatus,
}: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading]             = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [settlementRef, setSettlementRef] = useState("");
  const [settlementNotes, setNotes]       = useState("");
  const [proofUrl, setProofUrl]           = useState<string | null>(null);

  // ── Already settled — show read-only badge ─────────────────
  if (currentStatus === "settled") {
    const meta = SETTLEMENT_STATUS_META["settled"];
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: meta.bg, color: meta.text }}
      >
        <CheckCircle2 className="h-3 w-3" />
        {meta.label}
      </span>
    );
  }

  // ── pending → processing (simple button, no form needed) ───
  if (currentStatus === "pending") {
    const markProcessing = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settlements/bulk", {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            exporterUserId,
            settlementStatus: "processing",
          }),
        });
        if (res.ok) {
          success("Settlement updated", "Marked as Processing");
          router.refresh();
        } else {
          const json = await res.json();
          error("Failed", json.error ?? "Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    return (
      <button
        type="button"
        disabled={loading}
        onClick={markProcessing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 disabled:opacity-50"
      >
        {loading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <ArrowRight className="h-3.5 w-3.5" />}
        Mark as Processing
      </button>
    );
  }

  // ── processing → settled (expanded form with proof upload) ──
  const markSettled = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settlements/bulk", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          exporterUserId,
          settlementStatus:   "settled",
          settlementRef:      settlementRef.trim() || null,
          settlementNotes:    settlementNotes.trim() || null,
          settlementProofUrl: proofUrl ?? null,
        }),
      });
      if (res.ok) {
        success(
          "Settlement confirmed",
          exporterName ? `${exporterName} marked as settled` : "Marked as settled"
        );
        router.refresh();
      } else {
        const json = await res.json();
        error("Failed", json.error ?? "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
      >
        <ChevronDown className="h-3.5 w-3.5" />
        Mark as Settled
      </button>
    );
  }

  return (
    <div className="mt-2 p-4 rounded-xl border border-green-200 bg-green-50/50 space-y-4 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-green-900">
          Confirm Settlement
          {exporterName && (
            <span className="font-normal text-green-700 ml-1">— {exporterName}</span>
          )}
        </p>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-green-600 hover:text-green-800 transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      {/* Settlement reference */}
      <div>
        <label className="label text-xs">
          Settlement Reference{" "}
          <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          className="input text-sm"
          placeholder="e.g. bank transfer ref, payment order number"
          value={settlementRef}
          onChange={(e) => setSettlementRef(e.target.value)}
        />
      </div>

      {/* Proof of settlement upload */}
      <ProofOfPaymentUploader
        uploadUrlEndpoint="/api/admin/settlements/upload-url"
        onUploaded={(url: string) => setProofUrl(url)}
        onCleared={() => setProofUrl(null)}
        label="Proof of Settlement"
      />

      {/* Notes */}
      <div>
        <label className="label text-xs">
          Notes{" "}
          <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          className="input text-sm"
          placeholder="Any notes about this settlement…"
          value={settlementNotes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={markSettled}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <CheckCircle2 className="h-3.5 w-3.5" />}
          Confirm Settlement
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-3 py-2 rounded border border-border text-xs text-neutral-500 hover:bg-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
