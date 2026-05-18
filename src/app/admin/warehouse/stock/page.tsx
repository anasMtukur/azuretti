import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { warehouseReceipts, warehouseReceiptItems, commodities, users } from "@/db/schema";

import { eq, and, sql } from "drizzle-orm";
import { WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";
import { theme } from "@/config/theme";

const db = getDb();

export const metadata: Metadata = { title: "Stock Overview – Warehouse" };

type Category = keyof typeof theme.commodityColors;

export default async function AdminWarehouseStockPage() {
  await requireRole(["admin"]);

  // All approved stock, grouped by commodity + location + owner
  const stockRows = await db
    .select({
      commodityId:       warehouseReceiptItems.commodityId,
      commodityName:     commodities.name,
      commodityCategory: commodities.category,
      warehouseLocation: warehouseReceipts.warehouseLocation,
      ownerName:         users.name,
      ownerEmail:        users.email,
      ownerId:           warehouseReceipts.ownerId,
      totalMt:           sql<string>`SUM(${warehouseReceiptItems.quantityMt})`,
      remainingMt:       sql<string>`SUM(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt})`,
      batchCount:        sql<string>`COUNT(DISTINCT ${warehouseReceiptItems.receiptId})`,
    })
    .from(warehouseReceiptItems)
    .innerJoin(warehouseReceipts, eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
    .leftJoin(commodities, eq(warehouseReceiptItems.commodityId, commodities.id))
    .leftJoin(users, eq(warehouseReceipts.ownerId, users.id))
    .where(eq(warehouseReceipts.status, "approved"))
    .groupBy(
      warehouseReceiptItems.commodityId,
      commodities.name,
      commodities.category,
      warehouseReceipts.warehouseLocation,
      warehouseReceipts.ownerId,
      users.name,
      users.email,
    )
    .orderBy(commodities.name, warehouseReceipts.warehouseLocation);

  // Summary totals
  const totalInMt    = stockRows.reduce((s, r) => s + parseFloat(r.totalMt     || "0"), 0);
  const totalRemMt   = stockRows.reduce((s, r) => s + parseFloat(r.remainingMt || "0"), 0);
  const totalDisMt   = totalInMt - totalRemMt;

  // Group by location for location summary
  const byLocation = stockRows.reduce<Record<string, number>>((acc, r) => {
    const loc = r.warehouseLocation;
    acc[loc] = (acc[loc] || 0) + parseFloat(r.remainingMt || "0");
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Stock Overview</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            All approved commodity stock across warehouses
          </p>
        </div>
        <Link href="/admin/warehouse/receipts" className="btn-outline text-sm px-4 py-2">
          View Receipts
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Received (MT)", value: totalInMt.toFixed(3),  color: "text-neutral-900" },
          { label: "Currently In Stock",  value: totalRemMt.toFixed(3), color: "text-green-700" },
          { label: "Total Dispatched",    value: totalDisMt.toFixed(3), color: "text-neutral-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className={`font-display font-bold text-2xl ${color}`}>{value} MT</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* By location */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-base text-neutral-900 mb-4">Remaining Stock by Location</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(WAREHOUSE_LOCATION_LABELS).map(([key, label]) => {
            const mt = byLocation[key] ?? 0;
            return (
              <div key={key} className="p-4 rounded-xl border border-border text-center">
                <p className="font-display font-bold text-xl text-neutral-900">{mt.toFixed(2)}</p>
                <p className="text-xs text-neutral-500 mt-0.5">MT</p>
                <p className="text-xs font-medium text-neutral-600 mt-1">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full stock table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Detailed Stock — {stockRows.length} rows
          </h2>
        </div>

        {stockRows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-neutral-400">
            No approved stock yet. Approve receipts to see stock here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  {["Commodity", "Owner", "Warehouse", "Batches", "Total In (MT)", "Dispatched (MT)", "Remaining (MT)", "% Left"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {stockRows.map((row, i) => {
                  const total     = parseFloat(row.totalMt     || "0");
                  const remaining = parseFloat(row.remainingMt || "0");
                  const dispatched = total - remaining;
                  const pct       = total > 0 ? (remaining / total) * 100 : 0;
                  const colors    = theme.commodityColors[row.commodityCategory as Category] ?? theme.commodityColors.default;

                  return (
                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900">{row.commodityName}</p>
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {row.commodityCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-neutral-800">{row.ownerName ?? "—"}</p>
                        <p className="text-xs text-neutral-400">{row.ownerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600 whitespace-nowrap">
                        {WAREHOUSE_LOCATION_LABELS[row.warehouseLocation] ?? row.warehouseLocation}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600 text-center">
                        {row.batchCount}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">{total.toFixed(3)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-400">{dispatched.toFixed(3)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs font-semibold ${remaining > 0 ? "text-green-700" : "text-neutral-400"}`}>
                          {remaining.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full min-w-[60px]">
                            <div
                              className="h-1.5 rounded-full bg-green-500 transition-all"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-neutral-500 shrink-0">{pct.toFixed(0)}%</span>
                        </div>
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