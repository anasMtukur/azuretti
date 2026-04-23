import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import {
  shipments, demandRequests, buyerProfiles,
  commodities, users,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { ShipmentStatusBadge } from "@/components/shared/ShipmentStatusTracker";
import type { ShipmentStatus } from "@/components/shared/ShipmentStatusTracker";
import { Ship, Plus } from "lucide-react";

export const metadata: Metadata = { title: "Shipments – Admin" };

export default async function AdminShipmentsPage() {
  await requireRole(["admin"]);

  const rows = await db
    .select({
      id:               shipments.id,
      shipmentRef:      shipments.shipmentRef,
      status:           shipments.status,
      quantityMt:       shipments.quantityMt,
      originPort:       shipments.originPort,
      destinationPort:  shipments.destinationPort,
      departureDate:    shipments.departureDate,
      estimatedArrival: shipments.estimatedArrival,
      createdAt:        shipments.createdAt,
      demandRef:        demandRequests.demandRef,
      commodityName:    commodities.name,
      buyerName:        users.name,
      buyerEmail:       users.email,
    })
    .from(shipments)
    .leftJoin(demandRequests, eq((shipments as any).demandId,  demandRequests.id))
    .leftJoin(buyerProfiles,  eq(demandRequests.buyerId,       buyerProfiles.id))
    .leftJoin(users,          eq(buyerProfiles.userId,         users.id))
    .leftJoin(commodities,    eq(shipments.commodityId,        commodities.id))
    .orderBy(desc(shipments.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Shipments</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{rows.length} total</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Ref", "Buyer", "Commodity", "Qty (MT)", "Route", "Departure", "Est. Arrival", "Status", ""].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Ship className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">No shipments yet.</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Shipments are created from fulfilled demand records.
                    </p>
                  </td>
                </tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-3">
                    <span className="font-mono text-xs font-semibold text-neutral-800">{r.shipmentRef}</span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs font-medium text-neutral-900">{r.buyerName ?? "—"}</p>
                    <p className="text-[11px] text-neutral-400 truncate max-w-[130px]">{r.buyerEmail}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-700">{r.commodityName ?? "—"}</td>
                  <td className="px-3 py-3 font-mono text-xs text-neutral-700">
                    {parseFloat(String(r.quantityMt)).toFixed(3)}
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-500 whitespace-nowrap">
                    {r.originPort ?? "—"} → {r.destinationPort ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-400 whitespace-nowrap">
                    {r.departureDate ? formatDate(r.departureDate) : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-neutral-400 whitespace-nowrap">
                    {r.estimatedArrival ? formatDate(r.estimatedArrival) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <ShipmentStatusBadge status={r.status as ShipmentStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/shipments/${r.id}`}
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
    </div>
  );
}