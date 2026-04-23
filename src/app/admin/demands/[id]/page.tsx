import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import {
  demandRequests, demandQuotes, buyerProfiles,
  commodities, users, demandAllocations,
  payments,
  shipments,
  Payment,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, FileText, Tag, MapPin,
  MessageSquare, ExternalLink,
  Ship,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DEMAND_STATUS_META, CONTAINER_SIZES, QTY_LOCK_META } from "@/lib/demands";
import { StockAllocator } from "@/components/admin/StockAllocator";
import { AdminNotesEditor } from "@/components/admin/AdminNotesEditor";
import { PaymentConfirmForm } from "@/components/admin/PaymentConfirmForm";
import DemandStatusTimeline from "@/components/demand/DemandStatusTimeline";
import { InitiateShipmentForm } from "@/components/admin/InitiateShipmentForm";

export const metadata: Metadata = { title: "Demand Detail – Admin" };

interface Props { params: { id: string } }

export default async function AdminDemandDetailPage({ params }: Props) {
  await requireRole(["admin"]);

  const [row] = await db
    .select({
      demand:            demandRequests,
      commodityName:     commodities.name,
      commodityId:       commodities.id,
      commodityCategory: commodities.category,
      buyerName:         users.name,
      buyerEmail:        users.email,
      buyerProfileId:    buyerProfiles.id,
    })
    .from(demandRequests)
    .leftJoin(buyerProfiles, eq(demandRequests.buyerId,     buyerProfiles.id))
    .leftJoin(users,         eq(buyerProfiles.userId,       users.id))
    .leftJoin(commodities,   eq(demandRequests.commodityId, commodities.id))
    .where(eq(demandRequests.id, params.id))
    .limit(1);

  if (!row) notFound();

  const { demand } = row;

  let quote = null;
  if (demand.quoteId) {
    const [q] = await db.select().from(demandQuotes)
      .where(eq(demandQuotes.id, demand.quoteId!)).limit(1);
    quote = q;
  }

  // Existing allocations
  const existingAllocations = await db
    .select({
      receiptItemId:  demandAllocations.receiptItemId,
      exporterUserId: demandAllocations.exporterUserId,
      allocatedMt:    demandAllocations.allocatedMt,
      pricePerMt:     demandAllocations.pricePerMt,
      currency:       demandAllocations.currency,
      notes:          demandAllocations.notes,
    })
    .from(demandAllocations)
    .where(eq(demandAllocations.demandId, params.id));
  
  let payment = null;
  if (demand.status == 'fulfilled') {
    const [p] = await db.select().from(payments)
      .where(eq(payments.demandId, demand.id!)).limit(1);
    payment = p;
  }

  // ── Linked shipment ──────────────────────────────────────────
  const [linkedShipment] = await db
    .select({
      id:               shipments.id,
      shipmentRef:      shipments.shipmentRef,
      status:           shipments.status,
      quantityMt:       shipments.quantityMt,
      originPort:       shipments.originPort,
      destinationPort:  shipments.destinationPort,
      departureDate:    shipments.departureDate,
      estimatedArrival: shipments.estimatedArrival,
      actualArrival:    shipments.actualArrival,
      notes:            shipments.notes,
      createdAt:        shipments.createdAt,
    })
    .from(shipments)
    .where(eq((shipments as any).demandId, params.id))
    .limit(1);

  const statusMeta          = DEMAND_STATUS_META[demand.status] ?? DEMAND_STATUS_META.submitted;
  const containerLabel      = CONTAINER_SIZES.find((c) => c.value === demand.containerSize)?.label;
  const showAllocator       = ["accepted", "allocated"].includes(demand.status);
  const showPayment         = ["allocated", "fulfilled"].includes(demand.status);
  const showQuoteButton     = !demand.quoteId && ["submitted", "under_review"].includes(demand.status);
  const showShipmentSection = demand.status === "fulfilled";

  const specRows = [
    { label: "Commodity",   value: row.commodityName ?? "—" },
    { label: "Quantity",    value: `${parseFloat(String(demand.quantityMt)).toFixed(3)} MT` },
    { label: "Packaging",   value: demand.packagingType      || "Not specified" },
    { label: "Container",   value: containerLabel            || demand.containerSize || "Not specified" },
    { label: "Incoterm",    value: demand.preferredIncoterm  || "Not specified" },
    { label: "Grade",       value: demand.preferredGrade     || "Not specified" },
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
  ];

  return (
    <div className="max-w-full space-y-6">
      {/* Back */}
      <Link href="/admin/demands" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to demands
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
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
            <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                {row.commodityName}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {row.buyerName ?? row.buyerEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {demand.deliveryCountry ?? "—"}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-display font-bold text-neutral-900">
              {parseFloat(String(demand.quantityMt)).toFixed(3)} MT
            </p>
            <p className="text-sm text-neutral-400">requested</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* Specs */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-neutral-900 mb-4">Specifications</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {specRows.map(({ label, value }) => (
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

          {/* Quote section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-neutral-900">Quote</h2>
              {showQuoteButton && (
                <Link
                  href={`/admin/quotes/new?demandId=${demand.id}`}
                  className="btn-primary text-sm px-4 py-2"
                >
                  <FileText className="h-4 w-4" />
                  Issue Quote
                </Link>
              )}
              {quote && !demand.quoteId && null}
            </div>

            {!quote ? (
              <div className="py-8 text-center text-neutral-400">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No quote issued yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-neutral-700">{quote.quoteRef}</span>
                  <Link href={`/admin/quotes/${quote.id}`} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800">
                    Edit quote <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                  <div>
                    <p className="text-xs text-neutral-400 font-medium">Price /MT</p>
                    <p className="font-semibold text-neutral-900">
                      {quote.currency} {parseFloat(String(quote.pricePerMt)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-medium">Qty</p>
                    <p className="font-semibold text-neutral-900">
                      {parseFloat(String(quote.quotedQtyMt)).toFixed(3)} MT
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-medium">Total</p>
                    <p className="font-semibold text-neutral-900">
                      {parseFloat(String(quote.totalAmount)).toLocaleString("en-EU", {
                        style: "currency", currency: quote.currency, maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-medium">Expires</p>
                    <p className="font-semibold text-neutral-900">{formatDate(new Date(quote.validUntil))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: QTY_LOCK_META[quote.qtyLock]?.bg + "66",
                      color: QTY_LOCK_META[quote.qtyLock]?.text,
                    }}
                  >
                    {QTY_LOCK_META[quote.qtyLock]?.label}
                  </span>
                  {quote.buyerResponse && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      quote.buyerResponse === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      Buyer {quote.buyerResponse}
                    </span>
                  )}
                  {!quote.buyerResponse && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">
                      Awaiting response
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stock Allocator */}
          {showAllocator && row.commodityId && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg text-neutral-900 mb-2">
                Stock Allocation
              </h2>
              <p className="text-sm text-neutral-500 mb-5">
                Select warehouse batches to fulfil this demand. Each exporter will only
                see their own portion.
              </p>
              <StockAllocator
                demandId={demand.id}
                commodityId={row.commodityId}
                quantityNeededMt={parseFloat(String(demand.quantityMt))}
                currency={quote?.currency ?? "EUR"}
                existingAllocations={existingAllocations.map((a) => ({
                  receiptItemId:  a.receiptItemId,
                  exporterUserId: a.exporterUserId,
                  allocatedMt:    parseFloat(String(a.allocatedMt)),
                  pricePerMt:     parseFloat(String(a.pricePerMt ?? "0")),
                  currency:       a.currency ?? "EUR",
                  notes:          a.notes ?? "",
                }))}
              />
            </div>
          )}

          {quote && showPayment && (
            <PaymentConfirmForm 
              demandId={demand.id} 
              demandRef={demand.demandRef} 
              quotedAmountEur={Number(quote.totalAmount)} 
              currency={quote.currency}
              payment={payment as unknown as Payment} />
          )}

          {/* ── Shipment section ─────────────────────── */}
          {showShipmentSection && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  linkedShipment ? "bg-primary-100" : "bg-neutral-100"
                }`}>
                  <Ship className={`h-5 w-5 ${linkedShipment ? "text-primary-600" : "text-neutral-400"}`} />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-neutral-900">
                    {linkedShipment ? "Shipment" : "Book Shipment"}
                  </h2>
                  {!linkedShipment && (
                    <p className="text-xs text-neutral-500">
                      Payment confirmed — ready to arrange shipping.
                    </p>
                  )}
                </div>
              </div>
 
              <InitiateShipmentForm
                demandId={demand.id}
                demandRef={demand.demandRef}
                quantityMt={parseFloat(String(demand.quantityMt))}
                destinationPort={demand.deliveryPort}
                buyerId={row.buyerProfileId}
                exporterId={null}
                commodityId={row.commodityId}
                paymentId={payment?.id ?? null}
                existingShipment={linkedShipment ?? null}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Timeline */}
          <DemandStatusTimeline demandStatus={demand.status} />

          {/* Admin notes */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-base text-neutral-900 mb-3">Admin Notes</h2>
            <AdminNotesEditor demandId={demand.id} initialNotes={demand.adminNotes ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
