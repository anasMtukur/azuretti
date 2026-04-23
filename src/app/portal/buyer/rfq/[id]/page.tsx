import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import {
  demandRequests, demandQuotes, buyerProfiles, commodities,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, FileQuestion } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DEMAND_STATUS_META, CONTAINER_SIZES } from "@/lib/demands";
import { QuoteResponsePanel } from "@/components/admin/QuoteResponsePanel";

export const metadata: Metadata = { title: "Quote Request Detail – Buyer Portal" };

interface Props { params: { id: string } }

export default async function BuyerRfqDetailPage({ params }: Props) {
  const user = await requireRole(["buyer", "admin"]);

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, user.id))
    .limit(1);

  const conditions = [
    eq(demandRequests.id, params.id),
    eq(demandRequests.isRfq, true),
  ];
  if (user.role === "buyer" && profile) {
    conditions.push(eq(demandRequests.buyerId, profile.id));
  }

  const [row] = await db
    .select({
      demand:            demandRequests,
      commodityName:     commodities.name,
      commodityCategory: commodities.category,
      commoditySlug:     commodities.slug,
    })
    .from(demandRequests)
    .leftJoin(commodities, eq(demandRequests.commodityId, commodities.id))
    .where(and(...conditions))
    .limit(1);

  if (!row) notFound();

  const { demand } = row;

  let quote = null;
  if (demand.quoteId) {
    const [q] = await db
      .select()
      .from(demandQuotes)
      .where(eq(demandQuotes.id, demand.quoteId!))
      .limit(1);
    quote = q;
  }

  const statusMeta    = DEMAND_STATUS_META[demand.status] ?? DEMAND_STATUS_META.submitted;
  const isExpired     = quote ? new Date() > new Date(quote.validUntil) : false;
  const containerLabel = CONTAINER_SIZES.find((c) => c.value === demand.containerSize)?.label;

  // RFQ-specific status labels
  const rfqStatusLabels: Record<string, string> = {
    submitted:    "Awaiting Quote",
    under_review: "Under Review",
    quoted:       "Quote Ready",
    accepted:     "Converted to Demand",
    rejected:     "Quote Declined",
    cancelled:    "Cancelled",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/portal/buyer/rfq"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to quote requests
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileQuestion className="h-5 w-5 text-blue-500" />
              <span className="font-mono font-bold text-2xl text-neutral-900">{demand.demandRef}</span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: statusMeta.bg, color: statusMeta.text }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: statusMeta.dot }} />
                {rfqStatusLabels[demand.status] ?? statusMeta.label}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">RFQ</span>
            </div>
            <p className="text-lg font-semibold text-neutral-800 mb-1">{row.commodityName}</p>
            <p className="text-sm text-neutral-500">Submitted {formatDate(demand.createdAt)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-display font-bold text-neutral-900">
              {parseFloat(String(demand.quantityMt)).toFixed(3)}
            </p>
            <p className="text-sm text-neutral-400">metric tonnes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* Specs */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-neutral-900 mb-4">Request Specifications</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "Packaging",   value: demand.packagingType     || "Not specified" },
                { label: "Container",   value: containerLabel           || demand.containerSize || "Not specified" },
                { label: "Incoterm",    value: demand.preferredIncoterm || "Not specified" },
                { label: "Grade",       value: demand.preferredGrade    || "Not specified" },
                { label: "Destination", value: [demand.deliveryPort, demand.deliveryCountry].filter(Boolean).join(", ") || "Not specified" },
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
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">
                  Special Requirements
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">{demand.specialRequirements}</p>
              </div>
            )}
          </div>

          {/* Quote panel — awaiting */}
          {!quote && demand.status === "submitted" && (
            <div className="card p-6 border-dashed border-neutral-300">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-neutral-400" />
                <h2 className="font-display font-semibold text-lg text-neutral-600">
                  Awaiting Quote
                </h2>
              </div>
              <p className="text-sm text-neutral-500">
                Our trade team is reviewing your request and will provide a quote shortly.
                You'll be notified when it's ready.
              </p>
            </div>
          )}

          {/* Quote panel — ready to respond */}
          {quote && demand.status === "quoted" && (
            <QuoteResponsePanel
              demandId={demand.id}
              quote={quote}
              isExpired={isExpired}
              originalQtyMt={parseFloat(String(demand.quantityMt))}
            />
          )}

          {/* Accepted */}
          {demand.status === "accepted" && (
            <div className="card p-6 border-green-200 bg-green-50">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="font-display font-semibold text-lg text-green-900">
                  Quote Accepted — Converted to Demand
                </h2>
              </div>
              <p className="text-sm text-green-700 mb-3">
                You accepted this quote. Your demand is now confirmed and Azuretti is
                processing the order.
              </p>
              <Link href="/portal/buyer/demands" className="btn-primary text-xs px-4 py-2">
                View my demands →
              </Link>
            </div>
          )}
        </div>

        {/* Status sidebar */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-base text-neutral-900 mb-5">Timeline</h2>
          <div className="space-y-0">
            {[
              { label: "Request submitted", done: true,                                                               date: demand.createdAt },
              { label: "Under review",      done: ["under_review","quoted","accepted","rejected"].includes(demand.status), date: null },
              { label: "Quote issued",      done: ["quoted","accepted","rejected"].includes(demand.status),           date: quote ? new Date(quote.validUntil) : null },
              { label: "Your response",     done: ["accepted","rejected"].includes(demand.status),                    date: null },
            ].map(({ label, done, date }, i, arr) => (
              <div key={label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${done ? "bg-primary-600" : "bg-neutral-100 border border-border"}`}>
                    {done
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      : <div className="w-2 h-2 rounded-full bg-neutral-300" />}
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-0.5 h-8 mt-0.5 ${done ? "bg-primary-200" : "bg-neutral-100"}`} />
                  )}
                </div>
                <div className="pb-6 last:pb-0 pt-0.5">
                  <p className={`text-sm font-medium ${done ? "text-neutral-900" : "text-neutral-400"}`}>{label}</p>
                  {date && done && <p className="text-xs text-neutral-400 mt-0.5">{formatDate(date)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
