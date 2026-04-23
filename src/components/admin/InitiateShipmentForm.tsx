"use client";

/**
 * src/components/admin/InitiateShipmentForm.tsx
 *
 * Two modes controlled by the `existingShipment` prop:
 *
 *   existingShipment = null
 *     → Shows a form to create a new shipment for this demand.
 *       Only rendered when demand.status === "fulfilled" (payment confirmed).
 *
 *   existingShipment = { ...fields }
 *     → Shows a read-only detail card of the booked/in-transit/delivered
 *       shipment with a link through to the full shipment page.
 *
 * On submit, POSTs to POST /api/admin/shipments.
 * On success, router.refresh() so the server component re-fetches and
 * this component flips to read-only mode automatically.
 */

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Ship, Anchor, MapPin, Calendar, Package,
  Loader2, ArrowRight, ExternalLink, CheckCircle2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ExistingShipment {
  id:               string;
  shipmentRef:      string;
  status:           string;
  quantityMt:       string;
  originPort:       string | null;
  destinationPort:  string | null;
  departureDate:    Date | null;
  estimatedArrival: Date | null;
  actualArrival:    Date | null;
  notes:            string | null;
  createdAt:        Date;
}

interface Props {
  demandId:         string;
  demandRef:        string;
  quantityMt:       number;
  /** Pre-filled from the demand's delivery preferences */
  destinationPort?: string | null;
  /** buyerProfileId — passed so the shipment record links correctly */
  buyerId?:         string | null;
  /** exporterProfileId — first exporter on this demand */
  exporterId?:      string | null;
  /** commodityId from the demand */
  commodityId?:     string | null;
  /** paymentId if payment has already been confirmed */
  paymentId?:       string | null;
  /** Pass null when no shipment exists yet, or the shipment object */
  existingShipment: ExistingShipment | null;
}

// ── Validation ─────────────────────────────────────────────────────────────

const schema = z.object({
  originPort:       z.string().min(1, "Origin port is required"),
  destinationPort:  z.string().min(1, "Destination port is required"),
  departureDate:    z.string().min(1, "Departure date is required"),
  estimatedArrival: z.string().min(1, "Estimated arrival is required"),
  notes:            z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Status config ──────────────────────────────────────────────────────────

const SHIPMENT_STATUS: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  booked:     { label: "Booked",     bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  loaded:     { label: "Loaded",     bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  in_transit: { label: "In Transit", bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
  delivered:  { label: "Delivered",  bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
  cancelled:  { label: "Cancelled",  bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
};

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Read-only shipment detail ──────────────────────────────────────────────

function ShipmentDetail({
  shipment,
}: {
  shipment: ExistingShipment;
}) {
  const sm = SHIPMENT_STATUS[shipment.status] ?? SHIPMENT_STATUS.booked;

  const fields = [
    { label: "Origin Port",    value: shipment.originPort      || "—" },
    { label: "Destination",    value: shipment.destinationPort || "—" },
    { label: "Quantity",       value: `${parseFloat(String(shipment.quantityMt)).toFixed(3)} MT` },
    { label: "Departure",      value: fmtDate(shipment.departureDate) },
    { label: "Est. Arrival",   value: fmtDate(shipment.estimatedArrival) },
    { label: "Actual Arrival", value: fmtDate(shipment.actualArrival) },
  ];

  return (
    <div className="space-y-4">
      {/* Ref + status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-lg text-neutral-900">
            {shipment.shipmentRef}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: sm.bg, color: sm.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
            {sm.label}
          </span>
        </div>
        <Link
          href={`/admin/shipments/${shipment.id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
        >
          Full shipment page
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Route visual */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50 border border-border">
        <Anchor className="h-4 w-4 text-primary-500 shrink-0" />
        <span className="text-sm font-medium text-neutral-800">
          {shipment.originPort ?? "—"}
        </span>
        <div className="flex-1 flex items-center gap-1.5">
          <div className="flex-1 h-px bg-neutral-200" />
          <Ship className="h-4 w-4 text-neutral-300" />
          <div className="flex-1 h-px bg-neutral-200" />
        </div>
        <span className="text-sm font-medium text-neutral-800">
          {shipment.destinationPort ?? "—"}
        </span>
        <Anchor className="h-4 w-4 text-primary-500 shrink-0" />
      </div>

      {/* Fields grid */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              {label}
            </dt>
            <dd className="text-neutral-800 mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>

      {shipment.notes && (
        <div className="p-3 rounded-lg bg-neutral-50 border border-border text-xs text-neutral-600">
          {shipment.notes}
        </div>
      )}

      {/* Documents shortcut */}
      <Link
        href={`/admin/shipments/${shipment.id}`}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700 w-full"
      >
        <FileText className="h-4 w-4 text-primary-500" />
        Manage shipping documents
        <ArrowRight className="h-4 w-4 ml-auto text-neutral-400" />
      </Link>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function InitiateShipmentForm({
  demandId,
  demandRef,
  quantityMt,
  destinationPort,
  buyerId,
  exporterId,
  commodityId,
  paymentId,
  existingShipment,
}: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      destinationPort: destinationPort ?? "",
      originPort:      "Apapa, Lagos",   // sensible default for Nigerian exports
    },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/admin/shipments", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        demandId,
        paymentId:        paymentId ?? undefined,
        buyerId:          buyerId   ?? undefined,
        exporterId:       exporterId ?? undefined,
        commodityId:      commodityId ?? undefined,
        quantityMt,
        originPort:       data.originPort,
        destinationPort:  data.destinationPort,
        departureDate:    data.departureDate
          ? new Date(data.departureDate).toISOString()
          : undefined,
        estimatedArrival: data.estimatedArrival
          ? new Date(data.estimatedArrival).toISOString()
          : undefined,
        notes: data.notes || undefined,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      success("Shipment created", `Reference: ${json.shipmentRef}`);
      router.refresh();
    } else {
      const json = await res.json();
      error("Failed to create shipment", json.error ?? "Please try again.");
    }
  }

  // ── Read-only mode ───────────────────────────────────────────
  if (existingShipment) {
    return <ShipmentDetail shipment={existingShipment} />;
  }

  // ── Form mode ────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Context note */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-blue-50 border border-blue-100">
        <Ship className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Payment has been confirmed for <span className="font-semibold">{demandRef}</span>.
          Complete the fields below to book the shipment. Once created you can
          upload shipping documents from the shipment page.
        </p>
      </div>

      {/* Ports */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">
            Port of Loading <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              className={`input pl-9 ${errors.originPort ? "border-error" : ""}`}
              placeholder="e.g. Apapa, Lagos"
              {...register("originPort")}
            />
          </div>
          {errors.originPort && (
            <p className="mt-1.5 text-xs text-error">{errors.originPort.message}</p>
          )}
        </div>

        <div>
          <label className="label">
            Port of Discharge <span className="text-error">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              className={`input pl-9 ${errors.destinationPort ? "border-error" : ""}`}
              placeholder="e.g. Le Havre, France"
              {...register("destinationPort")}
            />
          </div>
          {errors.destinationPort && (
            <p className="mt-1.5 text-xs text-error">{errors.destinationPort.message}</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">
            Departure Date <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              className={`input pl-9 ${errors.departureDate ? "border-error" : ""}`}
              {...register("departureDate")}
            />
          </div>
          {errors.departureDate && (
            <p className="mt-1.5 text-xs text-error">{errors.departureDate.message}</p>
          )}
        </div>

        <div>
          <label className="label">
            Estimated Arrival <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              className={`input pl-9 ${errors.estimatedArrival ? "border-error" : ""}`}
              {...register("estimatedArrival")}
            />
          </div>
          {errors.estimatedArrival && (
            <p className="mt-1.5 text-xs text-error">{errors.estimatedArrival.message}</p>
          )}
        </div>
      </div>

      {/* Quantity — read-only display */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-neutral-50 border border-border text-sm">
        <Package className="h-4 w-4 text-neutral-400 shrink-0" />
        <span className="text-neutral-500">Shipment quantity:</span>
        <span className="font-mono font-semibold text-neutral-800">
          {quantityMt.toFixed(3)} MT
        </span>
        <span className="text-neutral-400 text-xs ml-auto">
          pulled from demand
        </span>
      </div>

      {/* Notes */}
      <div>
        <label className="label">
          Notes{" "}
          <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          className="input resize-none text-sm"
          placeholder="Vessel name, booking number, freight forwarder notes…"
          {...register("notes")}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-7 py-2.5 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Ship className="h-4 w-4" />
          )}
          {isSubmitting ? "Creating shipment…" : "Book Shipment"}
        </button>
        <p className="text-xs text-neutral-400">
          You can upload documents after booking.
        </p>
      </div>
    </form>
  );
}