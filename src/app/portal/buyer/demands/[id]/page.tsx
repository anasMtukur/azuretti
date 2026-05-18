import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import {
  demandRequests, demandQuotes, buyerProfiles,
  commodities, shipments, shipmentDocuments,
} from "@/db/schema";

import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Ship, FileText, Download,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DEMAND_STATUS_META, CONTAINER_SIZES } from "@/lib/demands";
import { SHIPMENT_DOC_TYPES } from "@/lib/payments";
import { QuoteResponsePanel } from "@/components/admin/QuoteResponsePanel";
import {
  ShipmentStatusBadge,
} from "@/components/shared/ShipmentStatusTracker";
import type { ShipmentStatus } from "@/components/shared/ShipmentStatusTracker";
import { cn } from "@/lib/utils";

const db = getDb();

export const metadata: Metadata = { title: "Demand Detail – Buyer Portal" };

interface Props { params: { id: string } }

function fmtBytes(b: number | null) {
  if (!b) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function BuyerDemandDetailPage({ params }: Props) {
  const user = await requireRole(["buyer", "admin"]);

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, user.id))
    .limit(1);

  const conditions = [eq(demandRequests.id, params.id)];
  if (user.role === "buyer" && profile) {
    conditions.push(eq(demandRequests.buyerId, profile.id));
  }

  const [row] = await db
    .select({
      demand:            demandRequests,
      commodityName:     commodities.name,
      commoditySlug:     commodities.slug,
      commodityCategory: commodities.category,
    })
    .from(demandRequests)
    .leftJoin(commodities, eq(demandRequests.commodityId, commodities.id))
    .where(and(...conditions))
    .limit(1);

  if (!row) notFound();

  const { demand } = row;

  // Quote
  let quote = null;
  if (demand.quoteId) {
    const [q] = await db.select().from(demandQuotes)
      .where(eq(demandQuotes.id, demand.quoteId!)).limit(1);
    quote = q;
  }

  // Linked shipment + its documents
  const [linkedShipment] = await db
    .select({
      id:               shipments.id,
      shipmentRef:      shipments.shipmentRef,
      status:           shipments.status,
      originPort:       shipments.originPort,
      destinationPort:  shipments.destinationPort,
      departureDate:    shipments.departureDate,
      estimatedArrival: shipments.estimatedArrival,
    })
    .from(shipments)
    .where(eq((shipments as any).demandId, params.id))
    .limit(1);

  const shipmentDocs = linkedShipment
    ? await db
        .select()
        .from(shipmentDocuments)
        .where(eq(shipmentDocuments.shipmentId, linkedShipment.id))
        .orderBy(shipmentDocuments.docType, shipmentDocuments.createdAt)
    : [];

  const statusMeta     = DEMAND_STATUS_META[demand.status] ?? DEMAND_STATUS_META.submitted;
  const containerLabel = CONTAINER_SIZES.find((c) => c.value === demand.containerSize)?.label;
  const isExpired      = quote && new Date() > new Date(quote.validUntil);

  const timeline = [
    { label: "Submitted",         done: true },
    { label: "Under review",      done: ["under_review","quoted","accepted","allocated","fulfilled"].includes(demand.status) },
    { label: "Quoted",            done: ["quoted","accepted","allocated","fulfilled"].includes(demand.status) },
    { label: "Accepted",          done: ["accepted","allocated","fulfilled"].includes(demand.status) },
    { label: "Allocated",         done: ["allocated","fulfilled"].includes(demand.status) },
    { label: "Payment confirmed", done: demand.status === "fulfilled" },
    { label: "Shipped",           done: !!linkedShipment },
  ];

  return (
    <div className="max-w-full space-y-6">
      {/* Back */}
      <Link
        href="/portal/buyer/demands"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my demands
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-mono font-bold text-2xl text-neutral-900">{demand.demandRef}</span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: statusMeta.bg, color: statusMeta.text }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: statusMeta.dot }} />
                {statusMeta.label}
              </span>
              {demand.isRfq && (
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">RFQ</span>
              )}
            </div>
            <p className="text-lg font-semibold text-neutral-800 mb-1">{row.commodityName}</p>
            <p className="text-sm text-neutral-500">Submitted {formatDate(demand.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display font-bold text-neutral-900">
              {parseFloat(String(demand.quantityMt)).toFixed(3)}
            </p>
            <p className="text-sm text-neutral-400">metric tonnes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main panels */}
        <div className="lg:col-span-2 space-y-5">

          {/* Specs */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-neutral-900 mb-4">Specifications</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "Packaging",   value: demand.packagingType    || "Not specified" },
                { label: "Container",   value: containerLabel          || demand.containerSize || "Not specified" },
                { label: "Incoterm",    value: demand.preferredIncoterm || "Not specified" },
                { label: "Grade",       value: demand.preferredGrade   || "Not specified" },
                { label: "Destination", value: [demand.deliveryPort, demand.deliveryCountry].filter(Boolean).join(", ") || "Not specified" },
                {
                  label: "Target price",
                  value: demand.targetPricePerMt
                    ? `${demand.targetPriceCurrency} ${parseFloat(String(demand.targetPricePerMt)).toLocaleString()} /MT`
                    : "Not specified",
                },
                {
                  label: "Timeline",
                  value: [
                    demand.timelineFrom ? formatDate(demand.timelineFrom) : null,
                    demand.timelineTo   ? formatDate(demand.timelineTo)   : null,
                  ].filter(Boolean).join(" — ") || "Not specified",
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</dt>
                  <dd className="text-neutral-800 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
            {demand.specialRequirements && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Special Requirements</p>
                <p className="text-sm text-neutral-700 leading-relaxed">{demand.specialRequirements}</p>
              </div>
            )}
          </div>

          {/* Quote panels */}
          {quote && demand.status === "quoted" && (
            <QuoteResponsePanel
              demandId={demand.id}
              quote={quote}
              isExpired={!!isExpired}
              originalQtyMt={parseFloat(String(demand.quantityMt))}
            />
          )}

          {quote && ["accepted", "allocated", "fulfilled"].includes(demand.status) && (
            <div className="card p-6 border-primary-200 bg-primary-50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
                <h2 className="font-display font-semibold text-lg text-primary-900">
                  Accepted Quote — {quote.quoteRef}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Price</p>
                  <p className="text-neutral-900 font-semibold">
                    {quote.currency} {parseFloat(String(quote.pricePerMt)).toLocaleString()} /MT
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Total</p>
                  <p className="text-neutral-900 font-semibold">
                    {parseFloat(String(quote.totalAmount)).toLocaleString("en-EU", {
                      style: "currency", currency: quote.currency, maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                {quote.paymentTerms && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Payment Terms</p>
                    <p className="text-neutral-800">{quote.paymentTerms}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipment card */}
          {linkedShipment && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Ship className="h-5 w-5 text-primary-600" />
                  <h2 className="font-display font-semibold text-lg text-neutral-900">Shipment</h2>
                </div>
                <Link
                  href={`/portal/buyer/shipments/${linkedShipment.id}`}
                  className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Full details →
                </Link>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono font-semibold text-neutral-800">{linkedShipment.shipmentRef}</span>
                <ShipmentStatusBadge status={linkedShipment.status as ShipmentStatus} />
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  { label: "Route",        value: `${linkedShipment.originPort ?? "—"} → ${linkedShipment.destinationPort ?? "—"}` },
                  { label: "Departure",    value: linkedShipment.departureDate    ? formatDate(linkedShipment.departureDate)    : "TBC" },
                  { label: "Est. Arrival", value: linkedShipment.estimatedArrival ? formatDate(linkedShipment.estimatedArrival) : "TBC" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</dt>
                    <dd className="text-neutral-800 mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Documents */}
          {shipmentDocs.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <FileText className="h-5 w-5 text-primary-600" />
                <h2 className="font-display font-semibold text-lg text-neutral-900">
                  Shipping Documents
                </h2>
              </div>
              <div className="space-y-2">
                {shipmentDocs.map((doc) => {
                  const typeInfo = SHIPMENT_DOC_TYPES[doc.docType];
                  const label = doc.docType === "other"
                    ? (doc.customLabel ?? "Other Document")
                    : (typeInfo?.label ?? doc.docType);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">{label}</p>
                        <p className="text-xs text-neutral-400 truncate">
                          {doc.fileName}
                          {doc.fileSizeBytes ? ` · ${fmtBytes(doc.fileSizeBytes)}` : ""}
                        </p>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.fileName}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Timeline sidebar */}
        <div className="card p-6 h-fit">
          <h2 className="font-display font-semibold text-base text-neutral-900 mb-5">Status Timeline</h2>
          {timeline.map(({ label, done }, i, arr) => (
            <div key={label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10",
                  done ? "bg-primary-600" : "bg-neutral-100 border border-border"
                )}>
                  {done
                    ? <CheckCircle2 className="h-3 w-3 text-white" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />}
                </div>
                {i < arr.length - 1 && (
                  <div className={cn("w-0.5 h-7 mt-0.5", done ? "bg-primary-200" : "bg-neutral-100")} />
                )}
              </div>
              <p className={cn("text-sm font-medium pt-0.5 pb-5 last:pb-0", done ? "text-neutral-900" : "text-neutral-400")}>
                {label}
              </p>
            </div>
          ))}
          {demand.adminNotes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Note from Azuretti</p>
              <p className="text-sm text-neutral-700 leading-relaxed">{demand.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}