import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  shipments, demandAllocations, demandRequests,
  commodities,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import {
  ShipmentStatusBadge,
} from "@/components/shared/ShipmentStatusTracker";
import type { ShipmentStatus } from "@/components/shared/ShipmentStatusTracker";
import { Ship } from "lucide-react";

export const metadata: Metadata = { title: "My Shipments – Exporter Portal" };
const db = getDb();

export default async function ExporterShipmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const rows = await db
    .selectDistinctOn([shipments.id], {
      id:               shipments.id,
      shipmentRef:      shipments.shipmentRef,
      status:           shipments.status,
      quantityMt:       shipments.quantityMt,
      originPort:       shipments.originPort,
      destinationPort:  shipments.destinationPort,
      departureDate:    shipments.departureDate,
      estimatedArrival: shipments.estimatedArrival,
      actualArrival:    shipments.actualArrival,
      createdAt:        shipments.createdAt,
      commodityName:    commodities.name,
      demandRef:        demandRequests.demandRef,
    })
    .from(shipments)
    .innerJoin(demandRequests,    eq((shipments as any).demandId, demandRequests.id))
    .innerJoin(demandAllocations, eq(demandAllocations.demandId, demandRequests.id))
    .leftJoin(commodities,        eq(demandRequests.commodityId, commodities.id))
    .where(eq(demandAllocations.exporterUserId, user.id))
    .orderBy(shipments.id, desc(shipments.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">My Shipments</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          All shipments containing your allocated stock —{" "}
          {rows.length} shipment{rows.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Ref", "Demand", "Commodity", "Qty (MT)", "Route", "Departure", "Est. Arrival", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Ship className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-neutral-500">No shipments yet</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Shipments will appear here once your warehouse stock has been
                      allocated to a fulfilled demand and dispatched.
                    </p>
                  </td>
                </tr>
              ) : rows.map(s => (
                <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-neutral-800">
                      {s.shipmentRef}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {s.demandRef ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-700">
                    {s.commodityName ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                    {parseFloat(String(s.quantityMt)).toFixed(3)}
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
    </div>
  );
}