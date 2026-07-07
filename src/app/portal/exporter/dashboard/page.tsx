import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  shipments, demandAllocations, demandRequests,
  commodities, warehouseReceipts, warehouseReceiptItems,
} from "@/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import {
  ShipmentStatusBadge,
} from "@/components/shared/ShipmentStatusTracker";
import type { ShipmentStatus } from "@/components/shared/ShipmentStatusTracker";
import {
  Warehouse, TrendingUp, Ship, ArrowRight,
  Package, DollarSign,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard – Exporter Portal" };

const db = getDb();

export default async function ExporterDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [stockRow] = await db
    .select({
      totalMtInStock: sql<number>`
        COALESCE(SUM(wri.quantity_mt - wri.quantity_dispatched_mt), 0)
      `.mapWith(Number),
    })
    .from(warehouseReceiptItems)
    .innerJoin(warehouseReceipts, eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
    .where(
      sql`${warehouseReceipts.ownerId} = ${user.id}
      AND ${warehouseReceipts.status} = 'approved'`
    );

  const [salesRow] = await db
    .select({
      totalRevenue:   sql<number>`COALESCE(SUM(allocation_amount), 0)`.mapWith(Number),
      pendingSettl:   sql<number>`SUM(CASE WHEN settlement_status = 'pending' THEN 1 ELSE 0 END)`.mapWith(Number),
    })
    .from(demandAllocations)
    .where(eq(demandAllocations.exporterUserId, user.id));

  const [receiptCount] = await db
    .select({ count: count() })
    .from(warehouseReceipts)
    .where(eq(warehouseReceipts.ownerId, user.id));

  const recentShipments = await db
    .selectDistinctOn([shipments.id], {
      id:               shipments.id,
      shipmentRef:      shipments.shipmentRef,
      status:           shipments.status,
      quantityMt:       shipments.quantityMt,
      originPort:       shipments.originPort,
      destinationPort:  shipments.destinationPort,
      departureDate:    shipments.departureDate,
      estimatedArrival: shipments.estimatedArrival,
      createdAt:        shipments.createdAt,
      commodityName:    commodities.name,
    })
    .from(shipments)
    .innerJoin(demandRequests,   eq((shipments as any).demandId,  demandRequests.id))
    .innerJoin(demandAllocations,eq(demandAllocations.demandId,   demandRequests.id))
    .leftJoin(commodities,       eq(demandRequests.commodityId,   commodities.id))
    .where(eq(demandAllocations.exporterUserId, user.id))
    .orderBy(shipments.id, desc(shipments.createdAt))
    .limit(5);

  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Here's a summary of your activity on the Azuretti Trade House.
        </p>
      </div>

      // ── Summary stats ──
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Current Stock",
            value: `${(stockRow?.totalMtInStock ?? 0).toFixed(2)} MT`,
            icon: Warehouse,
            color: "text-primary-600",
            bg:    "bg-primary-50",
            href:  "/portal/exporter/warehouse",
          },
          {
            label: "Warehouse Receipts",
            value: receiptCount.count,
            icon: Package,
            color: "text-blue-600",
            bg:    "bg-blue-50",
            href:  "/portal/exporter/warehouse",
          },
          {
            label: "Total Revenue",
            value: (salesRow?.totalRevenue ?? 0).toLocaleString("en-EU", {
              style: "currency", currency: "EUR", maximumFractionDigits: 0,
            }),
            icon: DollarSign,
            color: "text-green-600",
            bg:    "bg-green-50",
            href:  "/portal/exporter/sales",
          },
          {
            label: "Pending Settlement",
            value: salesRow?.pendingSettl ?? 0,
            icon: TrendingUp,
            color: "text-amber-600",
            bg:    "bg-amber-50",
            href:  "/portal/exporter/sales",
          },
        ].map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2.5`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="font-display font-bold text-xl text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-neutral-900">
              Recent Shipments
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Shipments containing your allocated stock
            </p>
          </div>
          <Link
            href="/portal/exporter/shipments"
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentShipments.length === 0 ? (
          <div className="card p-10 text-center">
            <Ship className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-500">No shipments yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Shipments will appear here once your stock is allocated and dispatched.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    {["Ref", "Commodity", "Route", "Departure", "Est. Arrival", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {recentShipments.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-neutral-800">
                          {s.shipmentRef}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-700">
                        {s.commodityName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                        {s.originPort ?? "—"} → {s.destinationPort ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                        {s.departureDate ? formatDate(s.departureDate) : "TBC"}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                        {s.estimatedArrival ? formatDate(s.estimatedArrival) : "TBC"}
                      </td>
                      <td className="px-4 py-3">
                        <ShipmentStatusBadge status={s.status as ShipmentStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/portal/exporter/shipments/${s.id}`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}