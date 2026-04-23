import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { warehouseReceipts, warehouseReceiptItems, users } from "@/db/schema";
import { eq, desc, count, and, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/helpers";
import { formatDate, formatWeight } from "@/lib/utils";
import { RECEIPT_STATUS_META, WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";
import { Plus, Warehouse, Package } from "lucide-react";

export const metadata: Metadata = { title: "Warehouse Receipts – Admin" };

const STATUSES = [
  { key: "all",                label: "All" },
  { key: "pending_inspection", label: "Pending" },
  { key: "inspected",          label: "Inspected" },
  { key: "approved",           label: "In Stock" },
  { key: "rejected",           label: "Rejected" },
  { key: "dispatched",         label: "Dispatched" },
];

interface Props { searchParams: { status?: string; location?: string; page?: string } }

export default async function AdminWarehouseReceiptsPage({ searchParams }: Props) {
  await requireRole(["admin"]);

  const statusFilter   = searchParams.status   && searchParams.status   !== "all" ? searchParams.status   : undefined;
  const locationFilter = searchParams.location && searchParams.location !== "all" ? searchParams.location : undefined;
  const page     = Math.max(1, parseInt(searchParams.page ?? "1"));
  const pageSize = 25;
  const offset   = (page - 1) * pageSize;

  const conditions = [];
  if (statusFilter)   conditions.push(eq(warehouseReceipts.status,            statusFilter as any));
  if (locationFilter) conditions.push(eq(warehouseReceipts.warehouseLocation, locationFilter as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [receipts, [{ total }], stats] = await Promise.all([
    db
      .select({
        id:                warehouseReceipts.id,
        receiptRef:        warehouseReceipts.receiptRef,
        status:            warehouseReceipts.status,
        warehouseLocation: warehouseReceipts.warehouseLocation,
        arrivedAt:         warehouseReceipts.arrivedAt,
        ownerName:         users.name,
        ownerEmail:        users.email,
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
      .leftJoin(users, eq(warehouseReceipts.ownerId, users.id))
      .where(where)
      .orderBy(desc(warehouseReceipts.arrivedAt))
      .limit(pageSize)
      .offset(offset),

    db.select({ total: count() }).from(warehouseReceipts).where(where),

    // Summary stats
    db.select({
      status: warehouseReceipts.status,
      cnt:    count(),
    }).from(warehouseReceipts).groupBy(warehouseReceipts.status),
  ]);

  const statMap = Object.fromEntries(stats.map((s) => [s.status, s.cnt]));
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Warehouse Receipts</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total} total receipts</p>
        </div>
        <Link href="/admin/warehouse/receipts/new" className="btn-primary text-sm px-4 py-2">
          <Plus className="h-4 w-4" />
          Log New Receipt
        </Link>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.filter(s => s.key !== "all").map(({ key, label }) => {
          const meta = RECEIPT_STATUS_META[key as keyof typeof RECEIPT_STATUS_META];
          return (
            <Link
              key={key}
              href={`/admin/warehouse/receipts?status=${key}`}
              className={`p-3 rounded-xl border transition-all hover:shadow-sm ${
                statusFilter === key ? "border-primary-300 shadow-sm" : "border-border"
              }`}
              style={{ background: meta.bg }}
            >
              <p className="text-xl font-display font-bold" style={{ color: meta.text }}>
                {statMap[key] ?? 0}
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: meta.text }}>{label}</p>
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-neutral-500 font-medium">Status:</span>
        {STATUSES.map(({ key, label }) => (
          <Link
            key={key}
            href={`/admin/warehouse/receipts?status=${key}${locationFilter ? `&location=${locationFilter}` : ""}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              (key === "all" && !statusFilter) || key === statusFilter
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-border hover:border-neutral-300"
            }`}
          >
            {label}
          </Link>
        ))}

        <span className="text-xs text-neutral-500 font-medium ml-4">Location:</span>
        {[{ key: "all", label: "All" }, { key: "kano", label: "Kano" }, { key: "abuja", label: "Abuja" }, { key: "france", label: "France" }].map(({ key, label }) => (
          <Link
            key={key}
            href={`/admin/warehouse/receipts?${statusFilter ? `status=${statusFilter}&` : ""}location=${key}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              (key === "all" && !locationFilter) || key === locationFilter
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-border hover:border-neutral-300"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Receipt Ref", "Owner", "Location", "Items / Total MT", "Status", "Arrived", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Warehouse className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">No receipts found.</p>
                    <Link href="/admin/warehouse/receipts/new" className="text-xs text-primary-600 hover:text-primary-800 font-medium mt-2 inline-block">
                      Log the first receipt →
                    </Link>
                  </td>
                </tr>
              ) : receipts.map((r) => {
                const meta = RECEIPT_STATUS_META[r.status as keyof typeof RECEIPT_STATUS_META];
                return (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-neutral-800">{r.receiptRef}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900 text-xs">{r.ownerName ?? "—"}</p>
                      <p className="text-neutral-400 text-xs">{r.ownerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600 whitespace-nowrap">
                      {WAREHOUSE_LOCATION_LABELS[r.warehouseLocation] ?? r.warehouseLocation}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-600">{r.itemCount} items</span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-xs font-semibold text-neutral-800">{parseFloat(r.totalMt || "0").toFixed(3)} MT</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {formatDate(r.arrivedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/warehouse/receipts/${r.id}`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-neutral-50">
            <p className="text-xs text-neutral-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/warehouse/receipts?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}${locationFilter ? `&location=${locationFilter}` : ""}`}
                  className="px-3 py-1.5 text-xs rounded border border-border bg-white hover:bg-neutral-50">← Prev</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/warehouse/receipts?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}${locationFilter ? `&location=${locationFilter}` : ""}`}
                  className="px-3 py-1.5 text-xs rounded border border-border bg-white hover:bg-neutral-50">Next →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}