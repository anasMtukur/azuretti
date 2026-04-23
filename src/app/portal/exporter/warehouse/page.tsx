import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import { warehouseReceipts, warehouseReceiptItems, commodities } from "@/db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/helpers";
import { RECEIPT_STATUS_META, WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";
import { formatDate } from "@/lib/utils";
import { Warehouse, Package, TrendingUp, Clock } from "lucide-react";

export const metadata: Metadata = { title: "My Warehouse – Exporter Portal" };

export default async function ExporterWarehousePage() {
  const user = await requireUser();

  // Their receipts
  const receipts = await db
    .select({
      id:                warehouseReceipts.id,
      receiptRef:        warehouseReceipts.receiptRef,
      status:            warehouseReceipts.status,
      warehouseLocation: warehouseReceipts.warehouseLocation,
      arrivedAt:         warehouseReceipts.arrivedAt,
      inspectedAt:       warehouseReceipts.inspectedAt,
      totalMt: sql<string>`(
        SELECT COALESCE(SUM(quantity_mt), 0)
        FROM warehouse_receipt_items
        WHERE receipt_id = ${warehouseReceipts.id}
      )`,
      itemCount: sql<string>`(
        SELECT COUNT(*)
        FROM warehouse_receipt_items
        WHERE receipt_id = ${warehouseReceipts.id}
      )`,
    })
    .from(warehouseReceipts)
    .where(eq(warehouseReceipts.ownerId, user.id))
    .orderBy(desc(warehouseReceipts.arrivedAt))
    .limit(50);

  // Aggregated stock (approved receipts only)
  const stock = await db
    .select({
      commodityName:     commodities.name,
      commodityCategory: commodities.category,
      warehouseLocation: warehouseReceipts.warehouseLocation,
      totalMt:           sql<string>`SUM(${warehouseReceiptItems.quantityMt})`,
      remainingMt:       sql<string>`SUM(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt})`,
    })
    .from(warehouseReceiptItems)
    .innerJoin(warehouseReceipts, eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
    .leftJoin(commodities, eq(warehouseReceiptItems.commodityId, commodities.id))
    .where(and(
      eq(warehouseReceipts.ownerId, user.id),
      eq(warehouseReceipts.status, "approved"),
    ))
    .groupBy(commodities.name, commodities.category, warehouseReceipts.warehouseLocation)
    .orderBy(commodities.name);

  // Summary counts
  const pending   = receipts.filter(r => r.status === "pending_inspection").length;
  const inStock   = receipts.filter(r => r.status === "approved" || r.status === "partial_dispatch").length;
  const totalInMt = stock.reduce((sum, s) => sum + parseFloat(s.totalMt || "0"), 0);
  const totalRemMt = stock.reduce((sum, s) => sum + parseFloat(s.remainingMt || "0"), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">My Warehouse</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track your commodity receipts, grading results and current stock levels.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Receipts",      value: receipts.length,            icon: Package,    color: "text-primary-600", bg: "bg-primary-50" },
          { label: "Pending Inspection",  value: pending,                    icon: Clock,      color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Batches In Stock",    value: inStock,                    icon: Warehouse,  color: "text-green-600",   bg: "bg-green-50" },
          { label: "Total Approved (MT)", value: `${totalInMt.toFixed(2)} MT`, icon: TrendingUp, color: "text-blue-600",    bg: "bg-blue-50" },
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

      {/* Current stock */}
      {stock.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-neutral-900 mb-5">Current Stock Balance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Commodity</th>
                  <th className="pb-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Warehouse</th>
                  <th className="pb-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total In (MT)</th>
                  <th className="pb-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Remaining (MT)</th>
                  <th className="pb-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Dispatched (MT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stock.map((s, i) => {
                  const total     = parseFloat(s.totalMt     || "0");
                  const remaining = parseFloat(s.remainingMt || "0");
                  const dispatched = total - remaining;
                  const pctRemaining = total > 0 ? (remaining / total) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="py-3">
                        <p className="font-medium text-neutral-900">{s.commodityName}</p>
                        <p className="text-xs text-neutral-400 capitalize">{s.commodityCategory}</p>
                      </td>
                      <td className="py-3 text-xs text-neutral-600">
                        {WAREHOUSE_LOCATION_LABELS[s.warehouseLocation] ?? s.warehouseLocation}
                      </td>
                      <td className="py-3 text-right font-mono text-xs text-neutral-700">{total.toFixed(3)}</td>
                      <td className="py-3 text-right">
                        <span className={`font-mono text-xs font-semibold ${remaining > 0 ? "text-green-700" : "text-neutral-400"}`}>
                          {remaining.toFixed(3)}
                        </span>
                        {/* Progress bar */}
                        <div className="mt-1 h-1 w-20 bg-neutral-100 rounded-full ml-auto">
                          <div className="h-1 rounded-full bg-green-500" style={{ width: `${pctRemaining}%` }} />
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-xs text-neutral-500">{dispatched.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipts history */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-neutral-900 mb-5">Receipt History</h2>

        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <Warehouse className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">No receipts yet.</p>
            <p className="text-xs text-neutral-400 mt-1">
              When you bring commodities to the warehouse, your receipts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Receipt Ref", "Location", "Items / MT", "Arrived", "Status", ""].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {receipts.map((r) => {
                  const meta = RECEIPT_STATUS_META[r.status as keyof typeof RECEIPT_STATUS_META];
                  return (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3">
                        <span className="font-mono text-xs font-semibold text-neutral-800">{r.receiptRef}</span>
                      </td>
                      <td className="py-3 text-xs text-neutral-600">
                        {WAREHOUSE_LOCATION_LABELS[r.warehouseLocation] ?? r.warehouseLocation}
                      </td>
                      <td className="py-3 text-xs text-neutral-600">
                        {r.itemCount} items · <span className="font-semibold">{parseFloat(r.totalMt || "0").toFixed(3)} MT</span>
                      </td>
                      <td className="py-3 text-xs text-neutral-400">{formatDate(r.arrivedAt)}</td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: meta.bg, color: meta.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link href={`/portal/exporter/warehouse/${r.id}`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-800">
                          View →
                        </Link>
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

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}