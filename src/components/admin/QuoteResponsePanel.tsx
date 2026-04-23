"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { QTY_LOCK_META, INCOTERMS } from "@/lib/demands";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, Lock, TrendingUp, Unlock, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface Quote {
  id:            string;
  quoteRef:      string;
  pricePerMt:    string;
  currency:      string;
  totalAmount:   string;
  quotedQtyMt:   string;
  qtyLock:       string;
  validUntil:    Date;
  incoterm:      string | null;
  portOfLoading: string | null;
  paymentTerms:  string | null;
  notes:         string | null;
}

interface Props {
  demandId:       string;
  quote:          Quote;
  isExpired:      boolean;
  originalQtyMt:  number;
}

const lockIcons = { locked: Lock, min_qty: TrendingUp, open: Unlock };

export function QuoteResponsePanel({ demandId, quote, isExpired, originalQtyMt }: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  const [adjustedQty, setAdjustedQty] = useState(parseFloat(quote.quotedQtyMt));
  const [paymentTerms, setPaymentTerms] = useState(quote.paymentTerms || "");
  const [submitting, setSubmitting]   = useState<"accept" | "reject" | null>(null);

  const pricePerMt  = parseFloat(quote.pricePerMt);
  const estimatedTotal = (adjustedQty * pricePerMt).toLocaleString("en-EU", {
    style: "currency", currency: quote.currency, maximumFractionDigits: 0,
  });

  const canAdjust  = !isExpired && (quote.qtyLock === "open" || quote.qtyLock === "min_qty");
  const minQty     = quote.qtyLock === "min_qty" ? parseFloat(quote.quotedQtyMt) : 0.001;
  const LockIcon   = lockIcons[quote.qtyLock as keyof typeof lockIcons] ?? Lock;
  const lockMeta   = QTY_LOCK_META[quote.qtyLock];

  async function respond(action: "accept" | "reject") {
    setSubmitting(action);
    try {
      const res = await fetch(`/api/buyer/demands/${demandId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action,
          adjustedQtyMt: action === "accept" && canAdjust ? adjustedQty : undefined,
        }),
      });
      if (res.ok) {
        success(
          action === "accept" ? "Demand confirmed!" : "Quote rejected",
          action === "accept"
            ? "Azuretti will now allocate stock and process your order."
            : "Our trade team will reach out if needed."
        );
        router.refresh();
      } else {
        const json = await res.json();
        error("Action failed", json.error ?? "Please try again.");
      }
    } finally {
      setSubmitting(null);
    }
  }

  if (isExpired) {
    return (
      <div className="card p-6 border-amber-200 bg-amber-50">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <h2 className="font-display font-semibold text-lg text-amber-900">Quote Expired</h2>
        </div>
        <p className="text-sm text-amber-700">
          This quote expired on {formatDate(quote.validUntil)}. Please contact the Azuretti trade team
          for an updated quote.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 border-purple-200 bg-purple-50/30">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
          <Info className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Quote Received — {quote.quoteRef}
          </h2>
          <p className="text-xs text-neutral-500">
            Review and accept or reject this quote below.
          </p>
        </div>
      </div>

      {/* Quote details */}
      <div className="grid grid-cols-2 gap-4 mb-5 sm:grid-cols-4">
        <div className="p-3 rounded-lg bg-white border border-border">
          <p className="text-xs text-neutral-400 font-medium">Price /MT</p>
          <p className="text-lg font-display font-bold text-neutral-900 mt-0.5">
            {pricePerMt.toLocaleString()} {quote.currency}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white border border-border">
          <p className="text-xs text-neutral-400 font-medium">Quoted Qty</p>
          <p className="text-lg font-display font-bold text-neutral-900 mt-0.5">
            {parseFloat(quote.quotedQtyMt).toFixed(3)} MT
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white border border-border">
          <p className="text-xs text-neutral-400 font-medium">Total</p>
          <p className="text-lg font-display font-bold text-neutral-900 mt-0.5">
            {parseFloat(quote.totalAmount).toLocaleString("en-EU", {
              style: "currency", currency: quote.currency, maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white border border-border">
          <p className="text-xs text-neutral-400 font-medium">Valid until</p>
          <p className="text-sm font-semibold text-neutral-900 mt-0.5">
            {formatDate(new Date(quote.validUntil))}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-neutral-400" />
            <p className="text-xs text-neutral-400">
              {Math.ceil((new Date(quote.validUntil).getTime() - Date.now()) / 86400000)} days left
            </p>
          </div>
        </div>
      </div>

      {/* Quantity lock type */}
      <div
        className="flex items-start gap-3 p-3.5 rounded-lg mb-5 border"
        style={{ background: lockMeta?.bg + "66", borderColor: lockMeta?.bg }}
      >
        <LockIcon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: lockMeta?.text }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: lockMeta?.text }}>
            {lockMeta?.label} quantity
          </p>
          <p className="text-xs mt-0.5 text-neutral-600">{lockMeta?.description}</p>
        </div>
      </div>

      {/* Shipping terms */}
      {(quote.incoterm || quote.portOfLoading || quote.paymentTerms) && (
        <div className="p-4 rounded-lg bg-white border border-border mb-5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Shipping Terms</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {quote.incoterm && (
              <div>
                <p className="text-xs text-neutral-400">Incoterm</p>
                <p className="font-semibold text-neutral-800">{quote.incoterm}</p>
              </div>
            )}
            {quote.portOfLoading && (
              <div>
                <p className="text-xs text-neutral-400">Port of Loading</p>
                <p className="font-semibold text-neutral-800">{quote.portOfLoading}</p>
              </div>
            )}
            <div className="col-span-2">
              <label className="label">Payment Terms</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. 50% upfront, 50% on BL"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
              <p className="font-semibold text-neutral-800">{quote.paymentTerms}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {quote.notes && (
        <div className="p-4 rounded-lg bg-white border border-border mb-5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{quote.notes}</p>
        </div>
      )}

      {/* Quantity adjustment — only for open / min_qty */}
      {canAdjust && (
        <div className="p-4 rounded-lg bg-white border border-border mb-5">
          <p className="text-sm font-semibold text-neutral-800 mb-3">
            Adjust quantity before accepting
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.001"
              min={minQty}
              value={adjustedQty}
              onChange={(e) => setAdjustedQty(parseFloat(e.target.value) || minQty)}
              className="w-36 px-3 py-2 rounded border border-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-500">MT</span>
            <span className="text-sm text-neutral-400">
              → Estimated: <span className="font-semibold text-neutral-800">{estimatedTotal}</span>
            </span>
          </div>
          {quote.qtyLock === "min_qty" && adjustedQty < parseFloat(quote.quotedQtyMt) && (
            <p className="mt-1.5 text-xs text-error">
              Minimum quantity is {parseFloat(quote.quotedQtyMt).toFixed(3)} MT for this quote.
            </p>
          )}
        </div>
      )}

      {/* Accept / Reject */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!!submitting}
          onClick={() => respond("accept")}
          className="flex items-center gap-2 px-6 py-3 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {submitting === "accept" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Accept Quote
        </button>
        <button
          type="button"
          disabled={!!submitting}
          onClick={() => respond("reject")}
          className="flex items-center gap-2 px-6 py-3 rounded bg-red-50 text-red-700 font-semibold text-sm border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {submitting === "reject" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Reject Quote
        </button>
      </div>
    </div>
  );
}
