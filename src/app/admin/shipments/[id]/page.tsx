import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import {
  shipments, shipmentDocuments, shipmentStatusEvents,
  demandRequests, buyerProfiles, commodities, users,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SHIPMENT_DOC_TYPES } from "@/lib/payments";
import {
  ShipmentStatusTracker,
  ShipmentStatusBadge,
} from "@/components/shared/ShipmentStatusTracker";
import type { 
  ShipmentStatus, 
  StatusEvent 
} from "@/components/shared/ShipmentStatusTracker";
import { ShipmentStatusLogger }    from "@/components/admin/ShipmentStatusLogger";
import { ShipmentDocumentsPanel }  from "@/components/admin/ShipmentDocumentsPanel";

export const metadata: Metadata = { title: "Shipment – Admin" };

interface Props { params: { id: string } }

export default async function AdminShipmentDetailPage({ params }: Props) {
  await requireRole(["admin"]);

  const [shipment] = await db
    .select({
      id:               shipments.id,
      shipmentRef:      shipments.shipmentRef,
      status:           shipments.status,
      quantityMt:       shipments.quantityMt,
      originPort:       shipments.originPort,
      destinationPort:  shipments.destinationPort,
      departureDate:    shipments.departureDate,
      estimatedArrival: shipments.estimatedArrival,
      actualArrival:    shipments.actualArrival,
      notes:            shipments.notes,
      createdAt:        shipments.createdAt,
      demandRef:        demandRequests.demandRef,
      demandId:         (shipments as any).demandId,
      commodityName:    commodities.name,
      buyerName:        users.name,
      buyerEmail:       users.email,
    })
    .from(shipments)
    .leftJoin(demandRequests, eq((shipments as any).demandId, demandRequests.id))
    .leftJoin(buyerProfiles,  eq(demandRequests.buyerId,      buyerProfiles.id))
    .leftJoin(users,          eq(buyerProfiles.userId,        users.id))
    .leftJoin(commodities,    eq(shipments.commodityId,       commodities.id))
    .where(eq(shipments.id, params.id))
    .limit(1);

  if (!shipment) notFound();

  // Status event log
  const statusEvents = await db
    .select({
      id:        shipmentStatusEvents.id,
      status:    shipmentStatusEvents.status,
      note:      shipmentStatusEvents.note,
      eventDate: shipmentStatusEvents.eventDate,
    })
    .from(shipmentStatusEvents)
    .where(eq(shipmentStatusEvents.shipmentId, params.id))
    .orderBy(shipmentStatusEvents.eventDate);

  // Documents
  const docs = await db
    .select()
    .from(shipmentDocuments)
    .where(eq(shipmentDocuments.shipmentId, params.id))
    .orderBy(shipmentDocuments.docType, shipmentDocuments.createdAt);

  return (
    <div className="max-w-full space-y-6">
      {/* Back */}
      <Link
        href="/admin/shipments"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shipments
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-mono font-bold text-2xl text-neutral-900">
                {shipment.shipmentRef}
              </h1>
              <ShipmentStatusBadge status={shipment.status as ShipmentStatus} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
              {shipment.commodityName && (
                <span className="flex items-center gap-1.5">
                  <Package className="h-4 w-4" />{shipment.commodityName}
                </span>
              )}
              {shipment.buyerName && <span>{shipment.buyerName}</span>}
              {shipment.demandRef && (
                <Link
                  href={`/admin/demands/${shipment.demandId}`}
                  className="text-primary-600 hover:text-primary-800 font-medium text-xs"
                >
                  {shipment.demandRef} →
                </Link>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display font-bold text-2xl text-neutral-900">
              {parseFloat(String(shipment.quantityMt)).toFixed(3)} MT
            </p>
          </div>
        </div>

        {/* Details grid */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-5 pt-5 border-t border-border sm:grid-cols-4">
          {[
            { label: "Origin Port",   value: shipment.originPort       || "—" },
            { label: "Dest. Port",    value: shipment.destinationPort  || "—" },
            { label: "Departure",     value: shipment.departureDate    ? formatDate(shipment.departureDate)    : "—" },
            { label: "Est. Arrival",  value: shipment.estimatedArrival ? formatDate(shipment.estimatedArrival) : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</dt>
              <dd className="text-neutral-800 mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Status tracker + logger — left 3 cols */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg text-neutral-900">
                Shipment Status
              </h2>
              <ShipmentStatusLogger
                shipmentId={params.id}
                currentStatus={shipment.status}
              />
            </div>
            <ShipmentStatusTracker
              currentStatus={shipment.status as ShipmentStatus}
              originPort={shipment.originPort}
              destinationPort={shipment.destinationPort}
              events={statusEvents as StatusEvent[]}
            />
          </div>
        </div>

        {/* Right 2 cols — notes */}
        <div className="lg:col-span-2">
          {shipment.notes && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                Notes
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">{shipment.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents panel */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <FileText className="h-5 w-5 text-primary-600" />
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Shipping Documents
          </h2>
        </div>
        <ShipmentDocumentsPanel
          shipmentId={params.id}
          initialDocs={docs.map((d) => ({
            id:            d.id,
            docType:       d.docType,
            customLabel:   d.customLabel,
            fileUrl:       d.fileUrl,
            fileName:      d.fileName,
            fileSizeBytes: d.fileSizeBytes,
            versionNote:   d.versionNote,
            createdAt:     d.createdAt,
          }))}
        />
      </div>
    </div>
  );
}