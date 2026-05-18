import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { demandAllocations, demandRequests, commodities } from "@/db/schema";

import { eq, desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { SETTLEMENT_STATUS_META } from "@/lib/payments";
import { TrendingUp, Package, DollarSign, CheckCircle2 } from "lucide-react";

const db = getDb();

export const metadata: Metadata = { title: "My Sales – Exporter Portal" };

const allocationStatusMeta: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: "Pending Dispatch", bg: "#fef3c7", text: "#92400e" },
  confirmed:  { label: "Confirmed",        bg: "#dcfce7", text: "#166534" },
  dispatched: { label: "Dispatched",       bg: "#f1f5f9", text: "#475569" },
};

export default async function ExporterSalesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  /**
   * PRIVACY: Only selects columns that belong to this exporter.
   * No total demand qty, no buyer identity, no other exporters.
   */
  const sales = await db
    .select({
      id:                demandAllocations.id,
      allocatedMt:       demandAllocations.allocatedMt,
      pricePerMt:        demandAllocations.pricePerMt,
      currency:          demandAllocations.currency,
      allocationAmount:  demandAllocations.allocationAmount,
      status:            demandAllocations.status,
      settlementStatus:  demandAllocations.settlementStatus,
      settledAt:         demandAllocations.settledAt,
      dispatchedAt:      demandAllocations.dispatchedAt,
      createdAt:         demandAllocations.createdAt,
      commodityName:     commodities.name,
      commodityCategory: commodities.category,
    })
    .from(demandAllocations)
    .leftJoin(demandRequests, eq(demandAllocations.demandId,    demandRequests.id))
    .leftJoin(commodities,    eq(demandRequests.commodityId,    commodities.id))
    .where(eq(demandAllocations.exporterUserId, user.id))
    .orderBy(desc(demandAllocations.createdAt));

  const totalAllocatedMt   = sales.reduce((s, r) => s + parseFloat(r.allocatedMt || "0"), 0);
  const totalSalesValue    = sales.reduce((s, r) => s + parseFloat(r.allocationAmount || "0"), 0);
  const pendingSettlement  = sales.filter((r) => r.settlementStatus === "pending"    && r.status === "dispatched").length;
  const settledCount       = sales.filter((r) => r.settlementStatus === "settled").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">My Sales</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Stock allocations where your commodities have been selected to fulfil buyer orders.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-50 border border-primary-100">
        <Package className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
        <p className="text-xs text-primary-800 leading-relaxed">
          You can see the quantity and value of stock allocated from your batches and
          the settlement status of each sale. Total order sizes and buyer details
          are kept confidential.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Allocated (MT)",
            value: totalAllocatedMt.toFixed(2),
            icon:  Package,
            color: "text-primary-600",
            bg:    "bg-primary-50",
          },
          {
            label: "Total Sales Value",
            value: totalSalesValue.toLocaleString("en-EU", {
              style: "currency", currency: "EUR", maximumFractionDigits: 0,
            }),
            icon:  DollarSign,
            color: "text-green-600",
            bg:    "bg-green-50",
          },
          {
            label: "Pending Settlement",
            value: pendingSettlement,
            icon:  TrendingUp,
            color: "text-amber-600",
            bg:    "bg-amber-50",
          },
          {
            label: "Settled",
            value: settledCount,
            icon:  CheckCircle2,
            color: "text-primary-600",
            bg:    "bg-primary-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="font-display font-bold text-xl text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Sales table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Allocation History ({sales.length})
          </h2>
        </div>

        {sales.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-medium">No allocations yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              When Azuretti selects your stock to fulfil a buyer order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  {[
                    "Date",
                    "Commodity",
                    "Your Qty (MT)",
                    "Your Amount",
                    "Dispatch",
                    "Settlement",
                    "Settled On",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {sales.map((row) => {
                  const dMeta = allocationStatusMeta[row.status] ?? allocationStatusMeta.pending;
                  const sMeta = SETTLEMENT_STATUS_META[row.settlementStatus ?? "pending"];
                  return (
                    <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">{row.commodityName ?? "—"}</p>
                        <p className="text-xs text-neutral-400 capitalize">{row.commodityCategory}</p>
                      </td>
                      {/* Only this exporter's quantity */}
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-neutral-900">
                        {parseFloat(row.allocatedMt || "0").toFixed(3)}
                      </td>
                      {/* Only this exporter's amount */}
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        {row.allocationAmount
                          ? parseFloat(row.allocationAmount).toLocaleString("en-EU", {
                              style: "currency", currency: row.currency ?? "EUR",
                              maximumFractionDigits: 2,
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: dMeta.bg, color: dMeta.text }}
                        >
                          {dMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: sMeta.bg, color: sMeta.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sMeta.dot }} />
                          {sMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400">
                        {row.settledAt ? formatDate(row.settledAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
