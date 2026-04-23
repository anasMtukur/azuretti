import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import {
  warehouseReceipts, warehouseReceiptItems,
  users, commodities, receiptItemDocuments,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, User, FileText,
  FlaskConical,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  RECEIPT_STATUS_META, WAREHOUSE_LOCATION_LABELS,
  formatRawQty, type ReceiptStatus,
} from "@/lib/warehouse";
import { InspectionPanel }              from "@/components/warehouse/InspectionPanel";
import { ReceiptItemDocumentsPanel }     from "@/components/admin/ReceiptItemDocumentsPanel";
import { ReceiptItemCertBadge, ReceiptItemCertPill } from "@/components/shared/ReceiptItemCertBadge";

export const metadata: Metadata = { title: "Receipt Detail – Warehouse Admin" };

interface Props { params: { id: string } }

export default async function AdminReceiptDetailPage({ params }: Props) {
  await requireRole(["admin"]);

  const [receipt] = await db
    .select({
      id:                warehouseReceipts.id,
      receiptRef:        warehouseReceipts.receiptRef,
      status:            warehouseReceipts.status,
      warehouseLocation: warehouseReceipts.warehouseLocation,
      warehouseName:     warehouseReceipts.warehouseName,
      arrivedAt:         warehouseReceipts.arrivedAt,
      inspectedAt:       warehouseReceipts.inspectedAt,
      approvedAt:        warehouseReceipts.approvedAt,
      notes:             warehouseReceipts.notes,
      createdAt:         warehouseReceipts.createdAt,
      ownerId:           warehouseReceipts.ownerId,
      agentId:           warehouseReceipts.agentId,
      ownerName:         users.name,
      ownerEmail:        users.email,
    })
    .from(warehouseReceipts)
    .leftJoin(users, eq(warehouseReceipts.ownerId, users.id))
    .where(eq(warehouseReceipts.id, params.id))
    .limit(1);

  if (!receipt) notFound();

  const items = await db
    .select({
      id:                   warehouseReceiptItems.id,
      commodityId:          warehouseReceiptItems.commodityId,
      commodityName:        commodities.name,
      commodityCategory:    commodities.category,
      rawQuantity:          warehouseReceiptItems.rawQuantity,
      rawUnit:              warehouseReceiptItems.rawUnit,
      sacksCount:           warehouseReceiptItems.sacksCount,
      avgSackWeightKg:      warehouseReceiptItems.avgSackWeightKg,
      quantityMt:           warehouseReceiptItems.quantityMt,
      quantityDispatchedMt: warehouseReceiptItems.quantityDispatchedMt,
      grade:                warehouseReceiptItems.grade,
      moistureContent:      warehouseReceiptItems.moistureContent,
      impurityLevel:        warehouseReceiptItems.impurityLevel,
      inspectionNotes:      warehouseReceiptItems.inspectionNotes,
    })
    .from(warehouseReceiptItems)
    .leftJoin(commodities, eq(warehouseReceiptItems.commodityId, commodities.id))
    .where(eq(warehouseReceiptItems.receiptId, params.id));

  // Fetch all documents for all items in one query
  const itemIds = items.map(i => i.id);
  const allDocs = itemIds.length > 0
    ? await db
        .select()
        .from(receiptItemDocuments)
        .where(
          itemIds.length === 1
            ? eq(receiptItemDocuments.receiptItemId, itemIds[0])
            : inArray(receiptItemDocuments.receiptItemId, itemIds)
        )
        .orderBy(receiptItemDocuments.createdAt)
    : [];

  // Group docs by item id
  const docsByItem = allDocs.reduce<Record<string, typeof allDocs>>((acc, d) => {
    (acc[d.receiptItemId] ??= []).push(d);
    return acc;
  }, {});

  const meta       = RECEIPT_STATUS_META[receipt.status as ReceiptStatus];
  const totalMt    = items.reduce((s, i) => s + parseFloat(i.quantityMt || "0"), 0);
  const dispatchMt = items.reduce((s, i) => s + parseFloat(i.quantityDispatchedMt || "0"), 0);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/admin/warehouse/receipts"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to receipts
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-mono font-bold text-2xl text-neutral-900">
                {receipt.receiptRef}
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: meta.bg, color: meta.text }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: meta.dot }} />
                {meta.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />{receipt.ownerName ?? receipt.ownerEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {WAREHOUSE_LOCATION_LABELS[receipt.warehouseLocation] ?? receipt.warehouseLocation}
                {receipt.warehouseName && ` — ${receipt.warehouseName}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />Arrived {formatDate(receipt.arrivedAt)}
              </span>
            </div>
            {receipt.notes && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-neutral-50 text-sm text-neutral-600">
                <FileText className="h-4 w-4 shrink-0 mt-0.5 text-neutral-400" />
                {receipt.notes}
              </div>
            )}
          </div>
          <div className="flex gap-5 shrink-0">
            {[
              { label: "Total In",   value: `${totalMt.toFixed(3)} MT`,   color: "text-neutral-900" },
              { label: "Dispatched", value: `${dispatchMt.toFixed(3)} MT`, color: "text-neutral-400" },
              { label: "Remaining",  value: `${(totalMt - dispatchMt).toFixed(3)} MT`,
                color: totalMt - dispatchMt > 0 ? "text-green-600" : "text-neutral-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
                <p className="text-xs text-neutral-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspection action panel */}
      <InspectionPanel receipt={receipt} items={items} />

      {/* Items — each with document upload panel */}
      <div className="space-y-5">
        <h2 className="font-display font-semibold text-lg text-neutral-900">
          Commodity Items ({items.length})
        </h2>

        {items.map((item) => {
          const itemDocs     = docsByItem[item.id] ?? [];
          const visibleCount = itemDocs.filter(d => d.visibleToBuyer).length;
          const remaining    = parseFloat(item.quantityMt || "0") - parseFloat(item.quantityDispatchedMt || "0");

          return (
            <div key={item.id} className="card overflow-hidden">
              {/* Item header */}
              <div className="px-6 py-4 border-b border-border bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-neutral-900">{item.commodityName ?? "—"}</span>
                  {item.grade && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                      {item.grade}
                    </span>
                  )}
                  {/* Cert badge — shows total doc count for admin */}
                  <ReceiptItemCertBadge
                    docCount={itemDocs.length}
                    visible={visibleCount}
                    adminView
                  />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono text-neutral-700">
                    {parseFloat(item.quantityMt || "0").toFixed(4)} MT total
                  </span>
                  <span className={`font-mono font-semibold ${remaining > 0 ? "text-green-700" : "text-neutral-400"}`}>
                    {remaining.toFixed(4)} MT remaining
                  </span>
                </div>
              </div>

              {/* Item body */}
              <div className="p-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Measurement + inspection */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                    Measurement & Inspection
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                    {[
                      { label: "As Received", value: formatRawQty(item.rawQuantity, item.rawUnit, item.sacksCount) },
                      { label: "Converted",   value: `${parseFloat(item.quantityMt).toFixed(6)} MT` },
                      { label: "Moisture",    value: item.moistureContent ? `${parseFloat(item.moistureContent).toFixed(1)}%` : "—" },
                      { label: "Impurity",    value: item.impurityLevel   ? `${parseFloat(item.impurityLevel).toFixed(1)}%`   : "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <dt className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</dt>
                        <dd className="text-neutral-800 font-mono mt-0.5">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {item.inspectionNotes && (
                    <p className="text-xs text-neutral-500 p-2.5 rounded-lg bg-neutral-50 border border-border">
                      {item.inspectionNotes}
                    </p>
                  )}
                </div>

                {/* Test results & certifications upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      Test Results & Certifications
                    </p>
                  </div>

                  {/* Cert pill if any are buyer-visible */}
                  {visibleCount > 0 && (
                    <ReceiptItemCertPill
                      docCount={itemDocs.length}
                      visible={visibleCount}
                      adminView
                    />
                  )}

                  <ReceiptItemDocumentsPanel
                    receiptItemId={item.id}
                    initialDocs={itemDocs.map(d => ({
                      id:             d.id,
                      docType:        d.docType,
                      customLabel:    d.customLabel,
                      fileUrl:        d.fileUrl,
                      fileName:       d.fileName,
                      fileSizeBytes:  d.fileSizeBytes,
                      visibleToBuyer: d.visibleToBuyer,
                      createdAt:      d.createdAt,
                    }))}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}