"use client";

/**
 * src/components/admin/PaymentConfirmForm.tsx
 *
 * Admin form to record and confirm buyer payment.
 * Now includes a proof-of-payment file upload (JPEG / PNG / PDF).
 *
 * On submit: POSTs to /api/admin/payments with all fields including
 * proofOfPaymentUrl (pre-uploaded via presigned URL to MinIO).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import { PAYMENT_METHODS } from "@/lib/payments";
import { ProofOfPaymentUploader } from "@/components/admin/ProofOfPaymentUploader";
import { Loader2, CheckCircle2, CreditCard, CreditCardIcon, ExternalLink } from "lucide-react";
import { Payment } from "@/db/schema";
import Link from "next/link";

// ── Validation ─────────────────────────────────────────────────────────────

const schema = z.object({
  amountPaid:       z.number({ invalid_type_error: "Enter an amount" }).positive(),
  currency:         z.enum(["EUR", "USD", "GBP"]),
  paymentMethod:    z.enum([
    "wire_transfer", "swift", "lc",
    "documentary_collection", "cash_advance", "other",
  ]),
  transactionRef:   z.string().min(1, "Transaction reference is required"),
  valueDate:        z.string().min(1, "Value date is required"),
  payerBank:        z.string().optional(),
  payerAccountName: z.string().optional(),
  payerIban:        z.string().optional(),
  receiverBank:     z.string().optional(),
  receiverAccount:  z.string().optional(),
  exchangeRate:     z.number().positive().optional(),
  exchangeRateTo:   z.string().optional(),
  notes:            z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  demandId:        string;
  demandRef:       string;
  quotedAmountEur: number;
  currency:        string;
  payment:         Payment;
}

// ── Component ──────────────────────────────────────────────────────────────

export function PaymentConfirmForm({
  demandId,
  demandRef,
  quotedAmountEur,
  currency,
  payment
}: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  // Proof of payment URL — set by ProofOfPaymentUploader after MinIO upload
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [addPayment, setAddPayment] = useState<boolean>(false);

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency:   (currency as FormData["currency"]) ?? "EUR",
      amountPaid: quotedAmountEur,
      valueDate:  new Date().toISOString().slice(0, 10),
    },
  });

  const watchedCurrency = watch("currency");
  const showFx          = watchedCurrency !== "EUR";

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/admin/payments", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        ...data,
        demandId,
        proofOfPaymentUrl: proofUrl ?? null,
        // Convert valueDate to full ISO datetime for the API validator
        valueDate: new Date(data.valueDate).toISOString(),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      success("Payment confirmed", `Reference: ${json.paymentRef}`);
      router.refresh();
    } else {
      const json = await res.json();
      error("Confirmation failed", json.error ?? "Please try again.");
    }
  }

  if (payment && !addPayment) {
    return (
      <div className="space-y-6">
        
        {/* Success banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">
              Payment received for {demandRef}
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Transaction reference: {payment.transactionRef}
            </p>
          </div>
        </div>

        {/* Payment summary */}
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2.5 mb-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary-100`}>
              <CreditCardIcon className={`h-5 w-5 text-primary-600`} />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-neutral-900">
                Payment Summary
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-lg text-neutral-900">
                {payment.transactionRef}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-200 text-primary-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 text-primary-600" />
                {payment.paymentMethod}
              </span>
            </div>
            {payment.proofOfPaymentUrl ? (
              <Link
                target="_blank"
                href={payment.proofOfPaymentUrl}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
              >
                Proof of payment
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ): (
              <p className="text-sm text-neutral-500">
                No proof of payment uploaded.
              </p>
            )}
          </div>

          <div className="text-sm text-neutral-700 space-y-1">
            <p><strong>Amount:</strong> {payment.amountPaid} {payment.currency}</p>
            <p><strong>Method:</strong> {PAYMENT_METHODS[payment.paymentMethod]}</p>
            <p><strong>Reference:</strong> {payment.transactionRef}</p>
            <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

      {/* Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
        <CreditCard className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-900">
            Confirm payment for {demandRef}
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            Recording this payment will mark the demand as fulfilled and begin
            the settlement process for all contributing exporters.
          </p>
        </div>
      </div>

      {/* ── Payment details ─────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display font-semibold text-base text-neutral-900">Payment Details</h3>

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
            <label className="label">Amount Paid <span className="text-error">*</span></label>
            <input
              type="number"
              step="0.01"
              className={`input ${errors.amountPaid ? "border-error" : ""}`}
              {...register("amountPaid", { valueAsNumber: true })}
            />
            {errors.amountPaid && (
              <p className="mt-1.5 text-xs text-error">{errors.amountPaid.message}</p>
            )}
          </div>

          <div>
            <label className="label">Value Date <span className="text-error">*</span></label>
            <input
              type="date"
              className={`input ${errors.valueDate ? "border-error" : ""}`}
              {...register("valueDate")}
            />
            {errors.valueDate && (
              <p className="mt-1.5 text-xs text-error">{errors.valueDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Payment Method <span className="text-error">*</span></label>
            <select
              className={`input bg-white ${errors.paymentMethod ? "border-error" : ""}`}
              defaultValue=""
              {...register("paymentMethod")}
            >
              <option value="" disabled>Select method</option>
              {Object.entries(PAYMENT_METHODS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="mt-1.5 text-xs text-error">{errors.paymentMethod.message}</p>
            )}
          </div>

          <div>
            <label className="label">Transaction Reference <span className="text-error">*</span></label>
            <input
              type="text"
              className={`input ${errors.transactionRef ? "border-error" : ""}`}
              placeholder="e.g. SWIFT ref, IBAN transfer ref"
              {...register("transactionRef")}
            />
            {errors.transactionRef && (
              <p className="mt-1.5 text-xs text-error">{errors.transactionRef.message}</p>
            )}
          </div>
        </div>

        {/* FX fields for non-EUR */}
        {showFx && (
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-lg bg-amber-50 border border-amber-100">
            <div>
              <label className="label text-xs">Exchange Rate (to EUR)</label>
              <input
                type="number"
                step="0.000001"
                className="input"
                placeholder="e.g. 1.08"
                {...register("exchangeRate", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>
            <div>
              <label className="label text-xs">Convert to</label>
              <input
                type="text"
                className="input"
                placeholder="EUR"
                {...register("exchangeRateTo")}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Bank details ─────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-display font-semibold text-base text-neutral-900">
          Bank Details{" "}
          <span className="text-xs text-neutral-400 font-normal">(optional but recommended)</span>
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { name: "payerBank"        as const, label: "Payer Bank",          placeholder: "e.g. BNP Paribas, Paris" },
            { name: "payerAccountName" as const, label: "Payer Account Name",  placeholder: "e.g. Dupont Foods S.A.S." },
            { name: "payerIban"        as const, label: "Payer IBAN / Account", placeholder: "FR76 ..." },
            { name: "receiverBank"     as const, label: "Receiver Bank",       placeholder: "e.g. Zenith Bank, Lagos" },
            { name: "receiverAccount"  as const, label: "Receiver Account",    placeholder: "Account number" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input
                type="text"
                className="input"
                placeholder={placeholder}
                {...register(name)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Proof of payment upload ───────────────────────── */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-base text-neutral-900 mb-4">
          Proof of Payment
        </h3>
        <ProofOfPaymentUploader
          uploadUrlEndpoint="/api/admin/payments/upload-url"
          onUploaded={(url) => setProofUrl(url)}
          onCleared={() => setProofUrl(null)}
          label="Bank receipt, SWIFT confirmation or screenshot"
        />
      </div>

      {/* Notes */}
      <div className="card p-6">
        <label className="label">Notes</label>
        <textarea
          rows={2}
          className="input resize-none"
          placeholder="Any additional notes about this payment…"
          {...register("notes")}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 rounded bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isSubmitting ? "Confirming…" : "Confirm Payment Received"}
        </button>
        <p className="text-xs text-neutral-400">This action cannot be undone.</p>
      </div>
    </form>
  );
}