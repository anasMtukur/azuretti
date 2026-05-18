import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { demandRequests, buyerProfiles, commodities } from "@/db/schema";

import { eq, desc, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { DEMAND_STATUS_META } from "@/lib/demands";
import { Plus, FileQuestion } from "lucide-react";

const db = getDb();

export const metadata: Metadata = { title: "Quote Requests – Buyer Portal" };

export default async function BuyerRfqPage() {
  const user = await requireRole(["buyer", "admin"]);

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, user.id))
    .limit(1);

  const rfqs = profile
    ? await db
        .select({
          id:            demandRequests.id,
          demandRef:     demandRequests.demandRef,
          status:        demandRequests.status,
          quantityMt:    demandRequests.quantityMt,
          deliveryCountry: demandRequests.deliveryCountry,
          createdAt:     demandRequests.createdAt,
          commodityName: commodities.name,
          commodityCategory: commodities.category,
        })
        .from(demandRequests)
        .leftJoin(commodities, eq(demandRequests.commodityId, commodities.id))
        .where(
          and(
            eq(demandRequests.buyerId, profile.id),
            eq(demandRequests.isRfq, true),
          )
        )
        .orderBy(desc(demandRequests.createdAt))
    : [];

  const statusLabels: Record<string, string> = {
    submitted:    "Awaiting Quote",
    under_review: "Under Review",
    quoted:       "Quote Received",
    accepted:     "Accepted",
    rejected:     "Rejected",
    cancelled:    "Cancelled",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Quote Requests</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {rfqs.length} request{rfqs.length !== 1 ? "s" : ""} sent
          </p>
        </div>
        <Link href="/portal/buyer/rfq/new" className="btn-primary text-sm px-4 py-2">
          <Plus className="h-4 w-4" />
          New Quote Request
        </Link>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <FileQuestion className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Quote requests let you explore pricing before committing to an order.
          Once you receive and accept a quote, it converts into a confirmed demand.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Ref", "Commodity", "Qty (MT)", "Destination", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {rfqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <FileQuestion className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-neutral-500">No quote requests yet</p>
                    <p className="text-xs text-neutral-400 mt-1 mb-4">
                      Not sure about pricing? Request a quote with no commitment.
                    </p>
                    <Link href="/portal/buyer/rfq/new" className="btn-primary text-xs px-4 py-2">
                      Request a quote
                    </Link>
                  </td>
                </tr>
              ) : (
                rfqs.map((r) => {
                  const meta = DEMAND_STATUS_META[r.status] ?? DEMAND_STATUS_META.submitted;
                  const label = statusLabels[r.status] ?? meta.label;
                  return (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-neutral-800">
                          {r.demandRef}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">{r.commodityName ?? "—"}</p>
                        <p className="text-xs text-neutral-400 capitalize">{r.commodityCategory}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-neutral-700">
                        {parseFloat(String(r.quantityMt)).toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600">
                        {r.deliveryCountry ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ background: meta.bg, color: meta.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/portal/buyer/rfq/${r.id}`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
