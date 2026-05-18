import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import {
  demandRequests, buyerProfiles, commodities, users,
} from "@/db/schema";

import { eq, desc, and, count, or } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { DEMAND_STATUS_META, CONTAINER_SIZES } from "@/lib/demands";
import { Package, FileQuestion, Clock, CheckCircle2, Layers } from "lucide-react";

const db = getDb();

export const metadata: Metadata = { title: "Demands & RFQs – Admin" };

const TABS = [
  { key: "all",          label: "All",       icon: Layers },
  { key: "submitted",    label: "New",        icon: Clock },
  { key: "under_review", label: "Reviewing",  icon: Clock },
  { key: "quoted",       label: "Quoted",     icon: FileQuestion },
  { key: "accepted",     label: "Accepted",   icon: CheckCircle2 },
  { key: "allocated",    label: "Allocated",  icon: Package },
];

interface Props {
  searchParams: { status?: string; type?: string };
}

export default async function AdminDemandsPage({ searchParams }: Props) {
  await requireRole(["admin"]);
  const activeStatus = searchParams.status ?? "all";
  const typeFilter   = searchParams.type   ?? "all"; // "demand" | "rfq" | "all"

  // Build conditions
  const conditions: any[] = [];
  if (activeStatus !== "all") conditions.push(eq(demandRequests.status, activeStatus as any));
  if (typeFilter === "demand") conditions.push(eq(demandRequests.isRfq, false));
  if (typeFilter === "rfq")    conditions.push(eq(demandRequests.isRfq, true));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, statusCounts] = await Promise.all([
    db.select({
        id:            demandRequests.id,
        demandRef:     demandRequests.demandRef,
        status:        demandRequests.status,
        isRfq:         demandRequests.isRfq,
        quantityMt:    demandRequests.quantityMt,
        containerSize: demandRequests.containerSize,
        preferredIncoterm: demandRequests.preferredIncoterm,
        deliveryCountry:   demandRequests.deliveryCountry,
        createdAt:     demandRequests.createdAt,
        buyerName:     users.name,
        buyerEmail:    users.email,
        commodityName: commodities.name,
        commodityCategory: commodities.category,
      })
      .from(demandRequests)
      .leftJoin(buyerProfiles, eq(demandRequests.buyerId,    buyerProfiles.id))
      .leftJoin(users,         eq(buyerProfiles.userId,      users.id))
      .leftJoin(commodities,   eq(demandRequests.commodityId, commodities.id))
      .where(where)
      .orderBy(desc(demandRequests.createdAt))
      .limit(200),

    db.select({ status: demandRequests.status, cnt: count() })
      .from(demandRequests)
      .groupBy(demandRequests.status),
  ]);

  const cntMap = Object.fromEntries(statusCounts.map((s) => [s.status, s.cnt]));
  const totalCount = rows.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">Demands & RFQs</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {totalCount} result{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(({ key, label }) => {
          const cnt = key === "all"
            ? Object.values(cntMap).reduce((s, c) => s + c, 0)
            : (cntMap[key] ?? 0);
          return (
            <Link
              key={key}
              href={`/admin/demands?status=${key}${typeFilter !== "all" ? `&type=${typeFilter}` : ""}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeStatus === key
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-border hover:border-neutral-300"
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeStatus === key ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
              }`}>
                {cnt}
              </span>
            </Link>
          );
        })}

        {/* Type filter */}
        <div className="flex gap-1 ml-4">
          {[
            { key: "all",    label: "All types" },
            { key: "demand", label: "Demands only" },
            { key: "rfq",    label: "RFQs only" },
          ].map(({ key, label }) => (
            <Link
              key={key}
              href={`/admin/demands?${activeStatus !== "all" ? `status=${activeStatus}&` : ""}type=${key}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                typeFilter === key
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-neutral-500 border-border hover:border-neutral-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Ref", "Buyer", "Commodity", "Qty (MT)", "Container", "Incoterm", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Package className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">No demands found for this filter.</p>
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const meta = DEMAND_STATUS_META[r.status] ?? DEMAND_STATUS_META.submitted;
                  const containerLabel = CONTAINER_SIZES.find((c) => c.value === r.containerSize)?.label;
                  return (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-neutral-800">{r.demandRef}</span>
                          {r.isRfq && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                              RFQ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-medium text-neutral-900">{r.buyerName ?? "—"}</p>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[140px]">{r.buyerEmail}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-neutral-900 text-xs">{r.commodityName ?? "—"}</p>
                        <p className="text-[11px] text-neutral-400 capitalize">{r.commodityCategory}</p>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-neutral-700 whitespace-nowrap">
                        {parseFloat(String(r.quantityMt)).toFixed(3)}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-500 whitespace-nowrap">
                        {containerLabel ?? r.containerSize ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-500">
                        {r.preferredIncoterm ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ background: meta.bg, color: meta.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-neutral-400 whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/demands/${r.id}`}
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
