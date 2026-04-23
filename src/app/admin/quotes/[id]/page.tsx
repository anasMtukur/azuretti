import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import {
  demandQuotes, demandRequests, buyerProfiles,
  commodities, users,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { QTY_LOCK_META, DEMAND_STATUS_META } from "@/lib/demands";
import { QuoteForm } from "@/components/admin/QuoteForm";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (params.id === "new") return { title: "Issue Quote – Admin" };
  return { title: "Quote Detail – Admin" };
}

interface Props {
  params:      { id: string };
  searchParams:{ demandId?: string };
}

export default async function AdminQuoteDetailPage({ params, searchParams }: Props) {
  await requireRole(["admin"]);

  const isNew = params.id === "new";

  if (isNew) {
    // Load the demand this quote is for
    const demandId = searchParams.demandId;
    if (!demandId) notFound();

    const [row] = await db
      .select({
        demand:        demandRequests,
        commodityName: commodities.name,
        buyerName:     users.name,
      })
      .from(demandRequests)
      .leftJoin(buyerProfiles, eq(demandRequests.buyerId,    buyerProfiles.id))
      .leftJoin(users,         eq(buyerProfiles.userId,      users.id))
      .leftJoin(commodities,   eq(demandRequests.commodityId, commodities.id))
      .where(eq(demandRequests.id, demandId))
      .limit(1);

    if (!row) notFound();

    return (
      <div className="max-w-full space-y-6">
        <Link href={`/admin/demands/${demandId}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to demand {row.demand.demandRef}
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Issue Quote</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Issuing quote for {row.demand.demandRef} · {row.commodityName}
          </p>
        </div>
        <QuoteForm
          demandId={demandId}
          demandRef={row.demand.demandRef}
          commodityName={row.commodityName ?? "—"}
          quantityMt={parseFloat(String(row.demand.quantityMt))}
          existingQuote={null}
        />
      </div>
    );
  }

  // Existing quote — view / edit
  const [row] = await db
    .select({
      quote:         demandQuotes,
      demandRef:     demandRequests.demandRef,
      demandId:      demandRequests.id,
      demandStatus:  demandRequests.status,
      commodityName: commodities.name,
      buyerName:     users.name,
      buyerEmail:    users.email,
    })
    .from(demandQuotes)
    .leftJoin(demandRequests, eq(demandQuotes.demandId,         demandRequests.id))
    .leftJoin(buyerProfiles,  eq(demandRequests.buyerId,        buyerProfiles.id))
    .leftJoin(users,          eq(buyerProfiles.userId,          users.id))
    .leftJoin(commodities,    eq(demandRequests.commodityId,    commodities.id))
    .where(eq(demandQuotes.id, params.id))
    .limit(1);

  if (!row) notFound();

  const { quote } = row;
  const lockMeta  = QTY_LOCK_META[quote.qtyLock];
  const expired   = new Date() > new Date(quote.validUntil);
  const canEdit   = !quote.buyerResponse; // can't edit after buyer responds

  return (
    <div className="max-w-full space-y-6">
      <Link href="/admin/quotes" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to quotes
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">{quote.quoteRef}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            For demand{" "}
            <Link href={`/admin/demands/${row.demandId}`} className="text-primary-600 hover:text-primary-800">
              {row.demandRef}
            </Link>
            {" · "}{row.commodityName}
          </p>
        </div>
        <div className="flex gap-2">
          {expired && (
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
              Expired
            </span>
          )}
          {quote.buyerResponse === "accepted" && (
            <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
              Accepted
            </span>
          )}
          {quote.buyerResponse === "rejected" && (
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
              Rejected
            </span>
          )}
        </div>
      </div>

      {canEdit ? (
        <QuoteForm
          demandId={row.demandId ?? ""}
          demandRef={row.demandRef ?? ""}
          commodityName={row.commodityName ?? "—"}
          quantityMt={parseFloat(String(demandRequests))}
          existingQuote={{
            id:            quote.id,
            pricePerMt:    String(quote.pricePerMt),
            currency:      quote.currency as unknown as "EUR" | "USD" | "GBP",
            quotedQtyMt:   String(quote.quotedQtyMt),
            qtyLock:       quote.qtyLock,
            validUntil:    new Date(quote.validUntil),
            incoterm:      quote.incoterm,
            portOfLoading: quote.portOfLoading,
            paymentTerms:  quote.paymentTerms,
            notes:         quote.notes,
          }}
        />
      ) : (
        /* Read-only view after buyer responds */
        <div className="card p-6 space-y-5">
          <p className="text-sm text-neutral-500">
            This quote has been {quote.buyerResponse} by the buyer and cannot be edited.
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              { label: "Price /MT",    value: `${quote.currency} ${parseFloat(String(quote.pricePerMt)).toLocaleString()}` },
              { label: "Qty",          value: `${parseFloat(String(quote.quotedQtyMt)).toFixed(3)} MT` },
              { label: "Total",        value: parseFloat(String(quote.totalAmount)).toLocaleString("en-EU", { style: "currency", currency: quote.currency, maximumFractionDigits: 0 }) },
              { label: "Qty Lock",     value: lockMeta?.label ?? quote.qtyLock },
              { label: "Valid Until",  value: formatDate(new Date(quote.validUntil)) },
              { label: "Incoterm",     value: quote.incoterm      || "—" },
              { label: "Loading Port", value: quote.portOfLoading || "—" },
              { label: "Payment",      value: quote.paymentTerms  || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</dt>
                <dd className="text-neutral-800 mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
          {quote.notes && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-neutral-700">{quote.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
