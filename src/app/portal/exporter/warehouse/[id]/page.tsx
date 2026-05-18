import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import { getDb } from "@/db";
import {
  warehouseReceipts, warehouseReceiptItems,
  users, commodities, receiptItemDocuments,
} from "@/db/schema";

import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, User, FileText, Download,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  RECEIPT_STATUS_META, WAREHOUSE_LOCATION_LABELS,
  formatRawQty, type ReceiptStatus,
} from "@/lib/warehouse";
import { ReceiptItemCertBadge, ReceiptItemCertPill } from "@/components/shared/ReceiptItemCertBadge";

const db = getDb();

export const metadata: Metadata = { title: "Receipt Details – My Warehouse" };

interface Props { params: { id: string } }

const DOC_TYPE_LABELS: Record<string, string> = {
  test_result:              "Test Result",
  certificate_of_analysis:  "Certificate of Analysis",
  phytosanitary:            "Phytosanitary Certificate",
  certificate_of_origin:    "Certificate of Origin",
  moisture_report:          "Moisture Report",
  other:                    "Document",
};

function fmtBytes(b: number | null) {
  if (!b) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ExporterReceiptDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

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
      ownerName:         users.name,
      ownerEmail:        users.email,
    })
    .from(warehouseReceipts)
    .leftJoin(users, eq(warehouseReceipts.ownerId, users.id))
    .where(
      and(
        eq(warehouseReceipts.id, params.id),
        eq(warehouseReceipts.ownerId, user.id),  // must own this receipt
      )
    )
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

  // Only buyer-visible documents
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

  const docsByItem = allDocs.reduce<Record<string, typeof allDocs>>((acc, d) => {
    (acc[d.receiptItemId] ??= []).push(d);
    return acc;
  }, {});

  const meta    = RECEIPT_STATUS_META[receipt.status as ReceiptStatus];
  const totalMt = items.reduce((s, i) => s + parseFloat(i.quantityMt || "0"), 0);

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/portal/exporter/warehouse"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Warehouse
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="font-mono font-bold text-2xl text-neutral-900">{receipt.receiptRef}</h1>
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
                <MapPin className="h-4 w-4" />
                {WAREHOUSE_LOCATION_LABELS[receipt.warehouseLocation] ?? receipt.warehouseLocation}
                {receipt.warehouseName && ` — ${receipt.warehouseName}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />Arrived {formatDate(receipt.arrivedAt)}
              </span>
              {receipt.inspectedAt && (
                <span className="flex items-center gap-1.5 text-blue-600">
                  <Calendar className="h-4 w-4" />Inspected {formatDate(receipt.inspectedAt)}
                </span>
              )}
              {receipt.approvedAt && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <Calendar className="h-4 w-4" />Approved {formatDate(receipt.approvedAt)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display font-bold text-2xl text-neutral-900">
              {totalMt.toFixed(3)} MT
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">total</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-neutral-900">
          Commodity Items ({items.length})
        </h2>

        {items.map((item) => {
          const itemDocs  = docsByItem[item.id] ?? [];
          const remaining = parseFloat(item.quantityMt || "0") - parseFloat(item.quantityDispatchedMt || "0");

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
                  {/* Cert badge — shows buyer-visible count only */}
                  <ReceiptItemCertBadge
                    docCount={itemDocs.length}
                    visible={itemDocs.length}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono text-neutral-700">
                    {parseFloat(item.quantityMt || "0").toFixed(4)} MT
                  </span>
                  <span className={`font-mono font-semibold ${remaining > 0 ? "text-green-700" : "text-neutral-400"}`}>
                    {remaining.toFixed(4)} MT remaining
                  </span>
                </div>
              </div>

              {/* Item body */}
              <div className="p-6 space-y-4">
                {/* Inspection details */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-4">
                  {[
                    { label: "As Received", value: formatRawQty(item.rawQuantity, item.rawUnit, item.sacksCount) },
                    { label: "Converted",   value: `${parseFloat(item.quantityMt).toFixed(4)} MT` },
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

                {/* Test results & certs — buyer-visible only */}
                {itemDocs.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <ReceiptItemCertPill
                      docCount={itemDocs.length}
                      visible={itemDocs.length}
                    />
                    <div className="space-y-2">
                      {itemDocs.map((doc) => {
                        const label = doc.docType === "other"
                          ? (doc.customLabel ?? "Document")
                          : (DOC_TYPE_LABELS[doc.docType] ?? doc.docType);
                        return (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50"
                          >
                            <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-emerald-900 truncate">{label}</p>
                              <p className="text-xs text-emerald-700 truncate">
                                {doc.fileName}
                                {doc.fileSizeBytes ? ` · ${fmtBytes(doc.fileSizeBytes)}` : ""}
                              </p>
                            </div>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={doc.fileName}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shrink-0"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}