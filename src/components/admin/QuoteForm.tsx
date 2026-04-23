"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import { QTY_LOCK_META, INCOTERMS } from "@/lib/demands";
import { Loader2, Save, Lock, TrendingUp, Unlock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  demandId:      string;
  demandRef:     string;
  commodityName: string;
  quantityMt:    number;
  existingQuote?: {
    id:           string;
    pricePerMt:   string;
    currency:     "EUR" | "USD" | "GBP";
    quotedQtyMt:  string;
    qtyLock:      string;
    validUntil:   Date;
    incoterm:     string | null;
    portOfLoading:string | null;
    paymentTerms: string | null;
    notes:        string | null;
  } | null;
}

const schema = z.object({
  pricePerMt:    z.number({ invalid_type_error: "Enter a price" }).positive("Must be positive"),
  currency:      z.enum(["EUR", "USD", "GBP"]),
  quotedQtyMt:   z.number({ invalid_type_error: "Enter quantity" }).positive("Must be positive"),
  qtyLock:       z.enum(["locked", "min_qty", "open"]),
  validUntil:    z.string().min(1, "Set an expiry date"),
  incoterm:      z.string().optional(),
  portOfLoading: z.string().optional(),
  paymentTerms:  z.string().optional(),
  notes:         z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const lockIcons = {
  locked:  Lock,
  min_qty: TrendingUp,
  open:    Unlock,
};

export function QuoteForm({
  demandId, demandRef, commodityName, quantityMt, existingQuote,
}: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency:    existingQuote?.currency ?? 'EUR',
      quotedQtyMt: existingQuote ? parseFloat(existingQuote.quotedQtyMt) : quantityMt,
      pricePerMt:  existingQuote ? parseFloat(existingQuote.pricePerMt) : undefined,
      qtyLock:    (existingQuote?.qtyLock as FormData["qtyLock"]) ?? "locked",
      validUntil:  existingQuote
        ? new Date(existingQuote.validUntil).toISOString().slice(0, 16)
        : "",
      incoterm:      existingQuote?.incoterm      ?? "",
      portOfLoading: existingQuote?.portOfLoading ?? "",
      paymentTerms:  existingQuote?.paymentTerms  ?? "",
      notes:         existingQuote?.notes         ?? "",
    },
  });

  const watchedPrice   = watch("pricePerMt");
  const watchedQty     = watch("quotedQtyMt");
  const watchedCurrency= watch("currency");
  const watchedLock    = watch("qtyLock");

  const total = watchedPrice && watchedQty
    ? (watchedPrice * watchedQty).toLocaleString("en-EU", {
        style: "currency", currency: watchedCurrency, maximumFractionDigits: 0,
      })
    : null;

  async function onSubmit(data: FormData) {
    const endpoint = existingQuote
      ? `/api/admin/quotes/${existingQuote.id}`
      : "/api/admin/quotes";
    const method = existingQuote ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...data, demandId }),
    });

    if (res.ok) {
      const json = await res.json();
      success(
        existingQuote ? "Quote updated" : "Quote issued",
        existingQuote ? "Changes saved." : `Reference: ${json.quoteRef}`
      );
      router.push(`/admin/demands/${demandId}`);
      router.refresh();
    } else {
      const json = await res.json();
      error("Failed", json.error ?? "Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
      {/* Context banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-border">
        <Info className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
        <div className="text-sm text-neutral-600">
          Issuing quote for <span className="font-semibold text-neutral-900">{demandRef}</span>
          {" — "}{commodityName}
          {" — "}<span className="font-semibold">{quantityMt} MT</span> requested
        </div>
      </div>

      {/* Price + qty */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-neutral-900">Pricing</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Currency</label>
            <select className="input bg-white" {...register("currency")}>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="label">Price per MT <span className="text-error">*</span></label>
            <input
              type="number"
              step="0.01"
              className={`input ${errors.pricePerMt ? "border-error" : ""}`}
              placeholder="e.g. 1 200.00"
              {...register("pricePerMt", { valueAsNumber: true })}
            />
            {errors.pricePerMt && <p className="mt-1.5 text-xs text-error">{errors.pricePerMt.message}</p>}
          </div>

          <div>
            <label className="label">Quoted Quantity (MT) <span className="text-error">*</span></label>
            <input
              type="number"
              step="0.001"
              className={`input ${errors.quotedQtyMt ? "border-error" : ""}`}
              {...register("quotedQtyMt", { valueAsNumber: true })}
            />
            {errors.quotedQtyMt && <p className="mt-1.5 text-xs text-error">{errors.quotedQtyMt.message}</p>}
          </div>
        </div>

        {/* Live total */}
        {total && (
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-xs text-primary-700 font-medium">Quote total</p>
            <p className="text-2xl font-display font-bold text-primary-800 mt-0.5">{total}</p>
            <p className="text-xs text-primary-600 mt-0.5">
              {watchedQty?.toFixed(3)} MT × {watchedPrice?.toLocaleString()} /MT
            </p>
          </div>
        )}
      </div>

      {/* Quantity lock */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-neutral-900">
          Quantity Lock Type
        </h2>
        <p className="text-sm text-neutral-500">
          Controls whether the buyer can adjust the quantity when accepting this quote.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["locked", "min_qty", "open"] as const).map((lock) => {
            const Icon = lockIcons[lock];
            const meta = QTY_LOCK_META[lock];
            const isSelected = watchedLock === lock;
            return (
              <button
                key={lock}
                type="button"
                onClick={() => setValue("qtyLock", lock)}
                className={cn(
                  "flex flex-col gap-2 p-4 rounded-xl border text-left transition-all",
                  isSelected
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-border hover:border-primary-300 hover:bg-neutral-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", isSelected ? "text-primary-600" : "text-neutral-400")} />
                  <span className={cn("text-sm font-semibold", isSelected ? "text-primary-800" : "text-neutral-700")}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-snug">{meta.description}</p>
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register("qtyLock")} />
      </div>

      {/* Validity + terms */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-neutral-900">Terms & Validity</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              Quote valid until <span className="text-error">*</span>
            </label>
            <input
              type="datetime-local"
              className={`input ${errors.validUntil ? "border-error" : ""}`}
              {...register("validUntil")}
            />
            {errors.validUntil && <p className="mt-1.5 text-xs text-error">{errors.validUntil.message}</p>}
          </div>

          <div>
            <label className="label">Incoterm</label>
            <select className="input bg-white" {...register("incoterm")} defaultValue="">
              <option value="">Not specified</option>
              {INCOTERMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Port of Loading</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Apapa, Lagos"
              {...register("portOfLoading")}
            />
          </div>

          <div>
            <label className="label">Payment Terms</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. 50% upfront, 50% on BL"
              {...register("paymentTerms")}
            />
          </div>
        </div>

        <div>
          <label className="label">Notes to buyer</label>
          <textarea
            rows={3}
            className="input resize-none"
            placeholder="Any additional information for the buyer — quality notes, lead times, special conditions…"
            {...register("notes")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="h-4 w-4" /> {existingQuote ? "Update Quote" : "Issue Quote"}</>
          )}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost px-6 py-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
