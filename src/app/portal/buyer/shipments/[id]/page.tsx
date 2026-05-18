/**
 * src/app/portal/buyer/shipments/[id]/page.tsx
 *
 * Buyer view of a single shipment — shows status timeline
 * and all shipping documents available for download.
 */

import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import {
  shipments, shipmentDocuments, demandRequests,
  buyerProfiles, commodities,
} from "@/db/schema";

import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, FileText, Download,
  CheckCircle2, Clock, Truck, Anchor, Ship,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SHIPMENT_DOC_TYPES } from "@/lib/payments";

const db = getDb();

export const metadata: Metadata = { title: "Shipment – Buyer Portal" };

interface Props { params: { id: string } }

const SHIPMENT_STEPS = [
  { key: "booked",     label: "Booked",     icon: CheckCircle2 },
  { key: "loaded",     label: "Loaded",     icon: Package },
  { key: "in_transit", label: "In Transit", icon: Ship },
  { key: "delivered",  label: "Delivered",  icon: Anchor },
];

const STATUS_ORDER = ["booked", "loaded", "in_transit", "delivered"];

export default async function BuyerShipmentDetailPage({ params }: Props) {
  const user = await requireRole(["buyer", "admin"]);

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, user.id))
    .limit(1);

  // Load shipment — restrict to buyer's own shipments unless admin
  const conditions = [eq(shipments.id, params.id)];
  if (user.role === "buyer" && profile) {
    conditions.push(eq(shipments.buyerId, profile.id));
  }

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
      commodityName:    commodities.name,
      demandRef:        demandRequests.demandRef,
      demandId:         (shipments as any).demandId,
    })
    .from(shipments)
    .leftJoin(demandRequests, eq((shipments as any).demandId, demandRequests.id))
    .leftJoin(commodities, eq(shipments.commodityId, commodities.id))
    .where(and(...conditions))
    .limit(1);

  if (!shipment) notFound();

  // Load all documents — buyer can download any uploaded doc
  const docs = await db
    .select()
    .from(shipmentDocuments)
    .where(eq(shipmentDocuments.shipmentId, params.id))
    .orderBy(shipmentDocuments.docType, shipmentDocuments.createdAt);

  const currentStepIdx = STATUS_ORDER.indexOf(shipment.status);

  function fmtBytes(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="max-w-full space-y-6">
      <Link
        href="/portal/buyer/shipments"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shipments
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="font-mono font-bold text-2xl text-neutral-900">
              {shipment.shipmentRef}
            </span>
            {shipment.commodityName && (
              <p className="text-sm text-neutral-500 mt-1">
                {shipment.commodityName}
                {shipment.demandRef && (
                  <> · <Link href={`/portal/buyer/demands/${shipment.demandId}`} className="text-primary-600">{shipment.demandRef}</Link></>
                )}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-2xl text-neutral-900">
              {parseFloat(String(shipment.quantityMt)).toFixed(3)} MT
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50 border border-border text-sm text-neutral-600">
          <Anchor className="h-4 w-4 text-primary-500 shrink-0" />
          <span className="font-medium">{shipment.originPort ?? "—"}</span>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 h-0.5 bg-neutral-200" />
            <Ship className="h-4 w-4 text-neutral-300" />
            <div className="flex-1 h-0.5 bg-neutral-200" />
          </div>
          <span className="font-medium">{shipment.destinationPort ?? "—"}</span>
          <Anchor className="h-4 w-4 text-primary-500 shrink-0" />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          {[
            { label: "Departure", value: shipment.departureDate    ? formatDate(shipment.departureDate)    : "TBC" },
            { label: "Est. Arrival", value: shipment.estimatedArrival ? formatDate(shipment.estimatedArrival) : "TBC" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</p>
              <p className="text-neutral-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status timeline */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-neutral-900 mb-5">
          Shipment Status
        </h2>
        <div className="flex items-center gap-0">
          {SHIPMENT_STEPS.map(({ key, label, icon: Icon }, i) => {
            const isDone    = STATUS_ORDER.indexOf(key) <= currentStepIdx;
            const isCurrent = key === shipment.status;
            const isLast    = i === SHIPMENT_STEPS.length - 1;
            return (
              <div key={key} className="flex-1 flex flex-col items-center relative">
                {/* Connector line before */}
                {i > 0 && (
                  <div className={`absolute left-0 top-5 w-1/2 h-0.5 -translate-y-px ${isDone ? "bg-primary-500" : "bg-neutral-200"}`} />
                )}
                {/* Connector line after */}
                {!isLast && (
                  <div className={`absolute right-0 top-5 w-1/2 h-0.5 -translate-y-px ${STATUS_ORDER.indexOf(key) < currentStepIdx ? "bg-primary-500" : "bg-neutral-200"}`} />
                )}
                {/* Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  isCurrent
                    ? "bg-primary-600 ring-4 ring-primary-100"
                    : isDone
                    ? "bg-primary-600"
                    : "bg-neutral-100 border border-border"
                }`}>
                  <Icon className={`h-4 w-4 ${isDone ? "text-white" : "text-neutral-400"}`} />
                </div>
                <p className={`mt-2 text-xs font-medium text-center ${isDone ? "text-neutral-900" : "text-neutral-400"}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <FileText className="h-5 w-5 text-primary-600" />
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Shipping Documents
          </h2>
        </div>

        {docs.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-neutral-50">
            <FileText className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-medium">No documents yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Documents will appear here as they are uploaded by the Azuretti trade team.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => {
              const typeInfo = SHIPMENT_DOC_TYPES[doc.docType];
              const label    = doc.docType === "other"
                ? (doc.customLabel ?? "Other Document")
                : (typeInfo?.label ?? doc.docType);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">{label}</p>
                    <p className="text-xs text-neutral-400 truncate">
                      {doc.fileName}
                      {doc.fileSizeBytes ? ` · ${fmtBytes(doc.fileSizeBytes)}` : ""}
                      {doc.versionNote ? ` · ${doc.versionNote}` : ""}
                    </p>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.fileName}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
