import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import {
  commodities, warehouseReceipts, warehouseReceiptItems,
  receiptItemDocuments,
} from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Package, FileText,
  MapPin, AlertCircle, ArrowRight, Download,
} from "lucide-react";
import { theme } from "@/config/theme";
import { WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";
import { ReceiptItemCertBadge } from "@/components/shared/ReceiptItemCertBadge";

type Category = keyof typeof theme.commodityColors;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [c] = await db
    .select({ name: commodities.name })
    .from(commodities).where(eq(commodities.slug, params.slug)).limit(1);
  return { title: c ? `${c.name} – Buyer Portal` : "Commodity" };
}

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

export default async function BuyerCommodityDetailPage({ params }: Props) {
  await requireRole(["buyer", "admin"]);

  const [commodity] = await db
    .select()
    .from(commodities)
    .where(and(eq(commodities.slug, params.slug), eq(commodities.isActive, true)))
    .limit(1);

  if (!commodity) notFound();

  // Approved stock batches for this commodity
  const stockBatches = await db
    .select({
      itemId:               warehouseReceiptItems.id,
      warehouseLocation:    warehouseReceipts.warehouseLocation,
      grade:                warehouseReceiptItems.grade,
      moistureContent:      warehouseReceiptItems.moistureContent,
      impurityLevel:        warehouseReceiptItems.impurityLevel,
      remainingMt:          sql<number>`(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt})`.mapWith(Number),
    })
    .from(warehouseReceiptItems)
    .innerJoin(warehouseReceipts, eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
    .where(
      and(
        eq(warehouseReceipts.status, "approved"),
        eq(warehouseReceiptItems.commodityId, commodity.id),
        sql`(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt}) > 0`,
      )
    )
    .orderBy(warehouseReceipts.warehouseLocation);

  // Documents visible to buyers, per item
  const batchItemIds = stockBatches.map(b => b.itemId);
  const batchDocs = batchItemIds.length > 0
    ? await db
        .select({
          id:            receiptItemDocuments.id,
          receiptItemId: receiptItemDocuments.receiptItemId,
          docType:       receiptItemDocuments.docType,
          customLabel:   receiptItemDocuments.customLabel,
          fileUrl:       receiptItemDocuments.fileUrl,
          fileName:      receiptItemDocuments.fileName,
          fileSizeBytes: receiptItemDocuments.fileSizeBytes,
        })
        .from(receiptItemDocuments)
        .where(
          and(
            inArray(receiptItemDocuments.receiptItemId, batchItemIds),
            eq(receiptItemDocuments.visibleToBuyer, true),
          )
        )
    : [];

  const docsByBatch = batchDocs.reduce<Record<string, typeof batchDocs>>((acc, d) => {
    (acc[d.receiptItemId] ??= []).push(d);
    return acc;
  }, {});

  const totalStock = stockBatches.reduce((s, b) => s + (b.remainingMt ?? 0), 0);
  const hasStock   = totalStock > 0;

  const colors      = theme.commodityColors[commodity.category as Category] ?? theme.commodityColors.default;
  const grades      = Array.isArray(commodity.grades)           ? commodity.grades           as string[] : [];
  const packaging   = Array.isArray(commodity.packagingOptions) ? commodity.packagingOptions as string[] : [];
  const certs       = Array.isArray(commodity.certifications)   ? commodity.certifications   as string[] : [];

  return (
    <div className="max-w-full space-y-6">
      <Link
        href="/portal/buyer/search"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      {/* Header */}
      <div className="card p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: colors.bg, color: colors.text }}
              >
                {commodity.category}
              </span>
              {hasStock ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> In Stock
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                  <AlertCircle className="h-3.5 w-3.5" /> Quote Basis
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-3xl text-neutral-900 mb-2">{commodity.name}</h1>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-xl">{commodity.description}</p>
          </div>
          <div className="flex flex-col gap-2.5 shrink-0 sm:w-48">
            <Link
              href={`/portal/buyer/demands/new?commodity=${commodity.id}`}
              className="btn-primary text-sm justify-center"
            >
              Place Demand <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-outline text-sm justify-center">
              Request a Quote
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Stock batches */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-neutral-900 mb-4">
            Live Warehouse Stock
          </h2>

          {!hasStock ? (
            <div className="p-5 rounded-xl bg-neutral-50 border border-border text-center">
              <AlertCircle className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-600 mb-1">No stock currently available</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Place a demand and our trade team will source this commodity to your specification.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stockBatches.map((batch, i) => {
                const batchDocsList = docsByBatch[batch.itemId] ?? [];
                return (
                  <div key={batch.itemId} className="p-4 rounded-xl border border-border">
                    {/* Batch header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-neutral-500">Batch {i + 1}</span>
                        {batch.grade && (
                          <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                            {batch.grade}
                          </span>
                        )}
                        {/* Cert badge — only shown if docs are available */}
                        <ReceiptItemCertBadge
                          docCount={batchDocsList.length}
                          visible={batchDocsList.length}
                        />
                      </div>
                      <span className="font-mono font-bold text-green-700 text-sm shrink-0">
                        {(batch.remainingMt ?? 0).toFixed(3)} MT
                      </span>
                    </div>

                    {/* Batch meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {WAREHOUSE_LOCATION_LABELS[batch.warehouseLocation] ?? batch.warehouseLocation}
                      </span>
                      {batch.moistureContent && (
                        <span>Moisture: {parseFloat(batch.moistureContent).toFixed(1)}%</span>
                      )}
                      {batch.impurityLevel && (
                        <span>Impurity: {parseFloat(batch.impurityLevel).toFixed(1)}%</span>
                      )}
                    </div>

                    {/* Cert documents */}
                    {batchDocsList.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                          Available Documents
                        </p>
                        {batchDocsList.map(doc => {
                          const label = doc.docType === "other"
                            ? (doc.customLabel ?? "Document")
                            : (DOC_TYPE_LABELS[doc.docType] ?? doc.docType);
                          return (
                            <div key={doc.id} className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="flex-1 text-xs text-neutral-700 truncate">{label}</span>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={doc.fileName}
                                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                              >
                                <Download className="h-3 w-3" />Download
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-semibold text-neutral-700">Total available</span>
                <span className="font-mono font-bold text-xl text-primary-700">
                  {totalStock.toFixed(3)} MT
                </span>
              </div>

              {commodity.minOrderQtyMt && (
                <p className="text-xs text-neutral-400 flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  Minimum order: <strong>{commodity.minOrderQtyMt} MT</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Grades, packaging, certifications */}
        <div className="space-y-5">
          {grades.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-base text-neutral-900 mb-3">Available Grades</h2>
              <div className="space-y-2">
                {grades.map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                    <span className="text-sm text-neutral-700">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {packaging.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-base text-neutral-900 mb-3">Packaging Options</h2>
              <div className="space-y-2">
                {packaging.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Package className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span className="text-sm text-neutral-700">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certs.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-base text-neutral-900 mb-3">Documentation Provided</h2>
              <div className="space-y-2">
                {certs.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <FileText className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                    <span className="text-sm text-neutral-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance footer */}
      <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
        <p className="text-xs text-primary-800 leading-relaxed">
          All products available through the Azuretti Trade House are EU-compliant, traceable and
          independently tested. Test results and certifications are uploaded per batch and available
          for download once the batch has been approved and released.
        </p>
      </div>
    </div>
  );
}