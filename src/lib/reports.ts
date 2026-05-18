/**
 * src/lib/reports.ts
 * ══════════════════════════════════════════════════════════════
 * Shared query builders for all report types.
 * All functions accept a ReportPeriod and return plain objects
 * safe to serialise as JSON or flatten to CSV.
 * ══════════════════════════════════════════════════════════════
 */

import { getDb } from "@/db";
import {
  users, exporterProfiles, buyerProfiles,
  commodities, warehouseReceipts, warehouseReceiptItems,
  demandRequests, demandQuotes, demandAllocations,
  payments, shipments, commodityPrices,
} from "@/db/schema";

import {
  eq, and, gte, lte, lt, sql, count,
  sum, avg, desc, inArray, isNotNull,
} from "drizzle-orm";

const db = getDb();
// ── Period ─────────────────────────────────────────────────────────────────

export type PeriodMode = "monthly" | "range" | "annual" | "all";

export interface ReportPeriod {
  mode:    PeriodMode;
  from:    Date;      // always set — start of window
  to:      Date;      // always set — end of window (exclusive)
  label:   string;   // human-readable e.g. "April 2026" / "2026" / "All time"
}

export function buildPeriod(params: {
  mode:  PeriodMode;
  year?: number;
  month?: number;  // 1-12
  from?: string;
  to?:   string;
}): ReportPeriod {
  const now = new Date();

  switch (params.mode) {
    case "monthly": {
      const y = params.year  ?? now.getFullYear();
      const m = params.month ?? now.getMonth() + 1;
      const from = new Date(y, m - 1, 1);
      const to   = new Date(y, m, 1);
      return {
        mode: "monthly", from, to,
        label: from.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      };
    }
    case "annual": {
      const y    = params.year ?? now.getFullYear();
      const from = new Date(y, 0, 1);
      const to   = new Date(y + 1, 0, 1);
      return { mode: "annual", from, to, label: String(y) };
    }
    case "range": {
      const from = params.from ? new Date(params.from) : new Date(now.getFullYear(), 0, 1);
      const to   = params.to   ? new Date(params.to)   : new Date(now.getFullYear() + 1, 0, 1);
      return {
        mode: "range", from, to,
        label: `${from.toLocaleDateString("en-GB")} – ${to.toLocaleDateString("en-GB")}`,
      };
    }
    case "all":
    default: {
      return {
        mode: "all",
        from: new Date(2000, 0, 1),
        to:   new Date(2100, 0, 1),
        label: "All time",
      };
    }
  }
}

function periodWhere(col: any, period: ReportPeriod) {
  return and(gte(col, period.from), lt(col, period.to));
}

// ── Types returned by query builders ──────────────────────────────────────

export interface SystemReport {
  meta:       { period: string; generatedAt: string };
  overview:   OverviewKpis;
  warehouse:  WarehouseStats;
  demands:    DemandStats;
  payments:   PaymentStats;
  shipments:  ShipmentStats;
  commodities:CommodityStats[];
  topExporters:ExporterSummary[];
  topBuyers:  BuyerSummary[];
}

export interface ExporterReport {
  meta:      { period: string; generatedAt: string; exporterName: string; exporterEmail: string };
  warehouse: ExporterWarehouseStats;
  sales:     ExporterSalesStats;
  commodities: ExporterCommodityBreakdown[];
}

export interface BuyerReport {
  meta:      { period: string; generatedAt: string; buyerName: string; buyerEmail: string };
  demands:   BuyerDemandStats;
  spend:     BuyerSpendStats;
  shipments: BuyerShipmentStats;
  commodities: BuyerCommodityBreakdown[];
}

// ── Sub-types ──────────────────────────────────────────────────────────────

export interface OverviewKpis {
  totalDemands:      number;
  fulfilledDemands:  number;
  fulfilmentRate:    string;
  totalGmvEur:       number;
  totalMtTraded:     number;
  activeExporters:   number;
  activeBuyers:      number;
  totalReceipts:     number;
  totalPayments:     number;
}

export interface WarehouseStats {
  totalReceipts:     number;
  totalMtReceived:   number;
  totalMtApproved:   number;
  totalMtDispatched: number;
  totalMtInStock:    number;
  byLocation:        { location: string; mt: number }[];
  byCommodity:       { commodity: string; mt: number }[];
}

export interface DemandStats {
  total:        number;
  byStatus:     { status: string; count: number }[];
  rfqCount:     number;
  rfqConverted: number;
  rfqConversionRate: string;
}

export interface PaymentStats {
  totalConfirmed:    number;
  totalValueEur:     number;
  pendingSettlement: number;
  settledCount:      number;
  settledValueEur:   number;
}

export interface ShipmentStats {
  total:     number;
  byStatus:  { status: string; count: number }[];
  delivered: number;
  topDestinationPorts: { port: string; count: number }[];
}

export interface CommodityStats {
  commodityName: string;
  category:      string;
  mtReceived:    number;
  mtTraded:      number;
  demandCount:   number;
}

export interface ExporterSummary {
  exporterName:  string;
  exporterEmail: string;
  mtSupplied:    number;
  revenueEur:    number;
  receiptCount:  number;
}

export interface BuyerSummary {
  buyerName:  string;
  buyerEmail: string;
  mtPurchased: number;
  spendEur:    number;
  demandCount: number;
}

export interface ExporterWarehouseStats {
  receiptCount:      number;
  totalMtReceived:   number;
  totalMtInStock:    number;
  totalMtDispatched: number;
  pendingInspection: number;
  approved:          number;
}

export interface ExporterSalesStats {
  totalAllocations:  number;
  totalMtAllocated:  number;
  totalRevenueEur:   number;
  pendingSettlement: number;
  settledCount:      number;
  settledValueEur:   number;
}

export interface ExporterCommodityBreakdown {
  commodityName: string;
  mtReceived:    number;
  mtSold:        number;
  revenueEur:    number;
}

export interface BuyerDemandStats {
  total:        number;
  fulfilled:    number;
  pending:      number;
  cancelled:    number;
  rfqCount:     number;
}

export interface BuyerSpendStats {
  totalPayments:  number;
  totalSpendEur:  number;
  totalMtOrdered: number;
}

export interface BuyerShipmentStats {
  total:     number;
  delivered: number;
  inTransit: number;
  booked:    number;
}

export interface BuyerCommodityBreakdown {
  commodityName: string;
  mtOrdered:     number;
  spendEur:      number;
  demandCount:   number;
}

// ══════════════════════════════════════════════════════════════
// SYSTEM REPORT
// ══════════════════════════════════════════════════════════════
export async function buildSystemReport(
  period: ReportPeriod
): Promise<SystemReport> {
  const pw = (col: any) => periodWhere(col, period);

  // ── Overview ─────────────────────────────────────────────

  const [demandCounts] = await db
    .select({
      total: count(),

      fulfilled: sql<number>`
        SUM(
          CASE
            WHEN ${demandRequests.status} = 'fulfilled'
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),
    })
    .from(demandRequests)
    .where(pw(demandRequests.createdAt));

  const [gmvRow] = await db
    .select({
      total: sql<number>`
        COALESCE(SUM(${payments.amountPaid}), 0)
      `.mapWith(Number),
    })
    .from(payments)
    .where(pw(payments.createdAt));

  const [mtRow] = await db
    .select({
      total: sql<number>`
        COALESCE(SUM(${demandAllocations.allocatedMt}), 0)
      `.mapWith(Number),
    })
    .from(demandAllocations)
    .where(pw(demandAllocations.createdAt));

  const [exporterCount] = await db
    .select({
      count: sql<number>`
        COUNT(DISTINCT ${warehouseReceipts.ownerId})
      `.mapWith(Number),
    })
    .from(warehouseReceipts)
    .where(pw(warehouseReceipts.createdAt));

  const [buyerCount] = await db
    .select({
      count: sql<number>`
        COUNT(DISTINCT ${demandRequests.buyerId})
      `.mapWith(Number),
    })
    .from(demandRequests)
    .where(pw(demandRequests.createdAt));

  const [receiptCount] = await db
    .select({ count: count() })
    .from(warehouseReceipts)
    .where(pw(warehouseReceipts.createdAt));

  const [paymentCount] = await db
    .select({ count: count() })
    .from(payments)
    .where(pw(payments.createdAt));

  const total = demandCounts.total ?? 0;
  const fulfilled = demandCounts.fulfilled ?? 0;

  // ── Warehouse ─────────────────────────────────────────────

  const warehouseRows = await db
    .select({
      status: warehouseReceipts.status,

      location: warehouseReceipts.warehouseLocation,

      totalMt: sql<number>`
        COALESCE(SUM(${warehouseReceiptItems.quantityMt}), 0)
      `.mapWith(Number),

      dispatchMt: sql<number>`
        COALESCE(SUM(${warehouseReceiptItems.quantityDispatchedMt}), 0)
      `.mapWith(Number),
    })
    .from(warehouseReceipts)
    .leftJoin(
      warehouseReceiptItems,
      eq(warehouseReceiptItems.receiptId, warehouseReceipts.id)
    )
    .where(pw(warehouseReceipts.createdAt))
    .groupBy(
      warehouseReceipts.status,
      warehouseReceipts.warehouseLocation
    );

  const totalMtReceived = warehouseRows.reduce(
    (s, r) => s + r.totalMt,
    0
  );

  const totalMtApproved = warehouseRows
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + r.totalMt, 0);

  const totalMtDispatched = warehouseRows.reduce(
    (s, r) => s + r.dispatchMt,
    0
  );

  const byLocationMap: Record<string, number> = {};

  for (const r of warehouseRows) {
    byLocationMap[r.location] =
      (byLocationMap[r.location] ?? 0) + r.totalMt;
  }

  const commodityMtRows = await db
    .select({
      name: commodities.name,

      totalMt: sql<number>`
        COALESCE(SUM(${warehouseReceiptItems.quantityMt}), 0)
      `.mapWith(Number),
    })
    .from(warehouseReceiptItems)
    .leftJoin(
      warehouseReceipts,
      eq(warehouseReceiptItems.receiptId, warehouseReceipts.id)
    )
    .leftJoin(
      commodities,
      eq(warehouseReceiptItems.commodityId, commodities.id)
    )
    .where(pw(warehouseReceipts.createdAt))
    .groupBy(commodities.name)
    .orderBy(
      desc(sql`SUM(${warehouseReceiptItems.quantityMt})`)
    );

  // ── Demands ───────────────────────────────────────────────

  const demandByStatus = await db
    .select({
      status: demandRequests.status,
      cnt: count(),
    })
    .from(demandRequests)
    .where(pw(demandRequests.createdAt))
    .groupBy(demandRequests.status);

  const [rfqStats] = await db
    .select({
      total: sql<number>`
        COUNT(*)
      `.mapWith(Number),

      converted: sql<number>`
        SUM(
          CASE
            WHEN ${demandRequests.status}
              IN ('accepted', 'allocated', 'fulfilled')
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),
    })
    .from(demandRequests)
    .where(
      and(
        pw(demandRequests.createdAt),
        eq(demandRequests.isRfq, true)
      )
    );

  // ── Payments / Settlement ─────────────────────────────────

  const [settlementStats] = await db
    .select({
      totalConfirmed: sql<number>`
        COUNT(DISTINCT ${payments.id})
      `.mapWith(Number),

      totalValueEur: sql<number>`
        COALESCE(SUM(${payments.amountPaid}), 0)
      `.mapWith(Number),

      pendingSettlement: sql<number>`
        SUM(
          CASE
            WHEN ${demandAllocations.settlementStatus} = 'pending'
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),

      settledCount: sql<number>`
        SUM(
          CASE
            WHEN ${demandAllocations.settlementStatus} = 'settled'
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),

      settledValue: sql<number>`
        COALESCE(
          SUM(
            CASE
              WHEN ${demandAllocations.settlementStatus} = 'settled'
              THEN ${demandAllocations.allocationAmount}
              ELSE 0
            END
          ),
          0
        )
      `.mapWith(Number),
    })
    .from(payments)
    .leftJoin(
      demandAllocations,
      eq(demandAllocations.demandId, payments.demandId)
    )
    .where(pw(payments.createdAt));

  // ── Shipments ─────────────────────────────────────────────

  const shipmentByStatus = await db
    .select({
      status: shipments.status,
      cnt: count(),
    })
    .from(shipments)
    .where(pw(shipments.createdAt))
    .groupBy(shipments.status);

  const destPortRows = await db
    .select({
      port: shipments.destinationPort,
      cnt: count(),
    })
    .from(shipments)
    .where(
      and(
        pw(shipments.createdAt),
        isNotNull(shipments.destinationPort)
      )
    )
    .groupBy(shipments.destinationPort)
    .orderBy(desc(count()))
    .limit(5);

  // ── Commodity stats ───────────────────────────────────────

  const commodityStats = await db
    .select({
      name: commodities.name,

      category: commodities.category,

      mtReceived: sql<number>`
        COALESCE(SUM(${warehouseReceiptItems.quantityMt}), 0)
      `.mapWith(Number),

      demandCount: sql<number>`
        COUNT(DISTINCT ${demandRequests.id})
      `.mapWith(Number),

      mtTraded: sql<number>`
        COALESCE(SUM(${demandAllocations.allocatedMt}), 0)
      `.mapWith(Number),
    })
    .from(commodities)
    .leftJoin(
      warehouseReceiptItems,
      eq(warehouseReceiptItems.commodityId, commodities.id)
    )
    .leftJoin(
      demandRequests,
      eq(demandRequests.commodityId, commodities.id)
    )
    .leftJoin(
      demandAllocations,
      eq(demandAllocations.demandId, demandRequests.id)
    )
    .where(eq(commodities.isActive, true))
    .groupBy(
      commodities.name,
      commodities.category
    )
    .orderBy(
      desc(sql`SUM(${demandAllocations.allocatedMt})`)
    );

  // ── Top exporters ─────────────────────────────────────────

  const topExporters = await db
    .select({
      name: users.name,

      email: users.email,

      mtSupplied: sql<number>`
        COALESCE(SUM(${demandAllocations.allocatedMt}), 0)
      `.mapWith(Number),

      revenue: sql<number>`
        COALESCE(SUM(${demandAllocations.allocationAmount}), 0)
      `.mapWith(Number),

      receipts: sql<number>`
        COUNT(DISTINCT ${warehouseReceipts.id})
      `.mapWith(Number),
    })
    .from(users)
    .leftJoin(
      warehouseReceipts,
      eq(warehouseReceipts.ownerId, users.id)
    )
    .leftJoin(
      demandAllocations,
      eq(demandAllocations.exporterUserId, users.id)
    )
    .where(
      and(
        inArray(users.role, ["exporter", "farmer"]),
        pw(demandAllocations.createdAt)
      )
    )
    .groupBy(users.name, users.email)
    .orderBy(
      desc(sql`SUM(${demandAllocations.allocatedMt})`)
    )
    .limit(10);

  // ── Top buyers ────────────────────────────────────────────

  const topBuyers = await db
    .select({
      name: users.name,

      email: users.email,

      mtPurchased: sql<number>`
        COALESCE(SUM(${demandRequests.quantityMt}::numeric), 0)
      `.mapWith(Number),

      spend: sql<number>`
        COALESCE(SUM(${payments.amountPaid}), 0)
      `.mapWith(Number),

      demands: sql<number>`
        COUNT(DISTINCT ${demandRequests.id})
      `.mapWith(Number),
    })
    .from(users)
    .leftJoin(
      buyerProfiles,
      eq(buyerProfiles.userId, users.id)
    )
    .leftJoin(
      demandRequests,
      eq(demandRequests.buyerId, buyerProfiles.id)
    )
    .leftJoin(
      payments,
      eq(payments.demandId, demandRequests.id)
    )
    .where(
      and(
        eq(users.role, "buyer"),
        pw(demandRequests.createdAt)
      )
    )
    .groupBy(users.name, users.email)
    .orderBy(
      desc(sql`SUM(${payments.amountPaid})`)
    )
    .limit(10);

  return {
    meta: {
      period: period.label,
      generatedAt: new Date().toISOString(),
    },

    overview: {
      totalDemands: total,

      fulfilledDemands: fulfilled,

      fulfilmentRate:
        total > 0
          ? `${((fulfilled / total) * 100).toFixed(1)}%`
          : "0%",

      totalGmvEur: gmvRow.total,

      totalMtTraded: mtRow.total,

      activeExporters: exporterCount.count,

      activeBuyers: buyerCount.count,

      totalReceipts: receiptCount.count,

      totalPayments: paymentCount.count,
    },

    warehouse: {
      totalReceipts: receiptCount.count,

      totalMtReceived,

      totalMtApproved,

      totalMtDispatched,

      totalMtInStock:
        totalMtApproved - totalMtDispatched,

      byLocation: Object.entries(byLocationMap).map(
        ([location, mt]) => ({
          location,
          mt,
        })
      ),

      byCommodity: commodityMtRows.map((r) => ({
        commodity: r.name ?? "—",
        mt: r.totalMt,
      })),
    },

    demands: {
      total,

      byStatus: demandByStatus.map((r) => ({
        status: r.status,
        count: r.cnt,
      })),

      rfqCount: rfqStats?.total ?? 0,

      rfqConverted: rfqStats?.converted ?? 0,

      rfqConversionRate:
        rfqStats?.total > 0
          ? `${(
              (((rfqStats.converted ?? 0) /
                rfqStats.total) *
                100)
            ).toFixed(1)}%`
          : "0%",
    },

    payments: {
      totalConfirmed:
        settlementStats?.totalConfirmed ?? 0,

      totalValueEur:
        settlementStats?.totalValueEur ?? 0,

      pendingSettlement:
        settlementStats?.pendingSettlement ?? 0,

      settledCount:
        settlementStats?.settledCount ?? 0,

      settledValueEur:
        settlementStats?.settledValue ?? 0,
    },

    shipments: {
      total: shipmentByStatus.reduce(
        (s, r) => s + r.cnt,
        0
      ),

      byStatus: shipmentByStatus.map((r) => ({
        status: r.status,
        count: r.cnt,
      })),

      delivered:
        shipmentByStatus.find(
          (r) => r.status === "delivered"
        )?.cnt ?? 0,

      topDestinationPorts: destPortRows.map((r) => ({
        port: r.port ?? "—",
        count: r.cnt,
      })),
    },

    commodities: commodityStats.map((r) => ({
      commodityName: r.name,

      category: r.category,

      mtReceived: r.mtReceived,

      mtTraded: r.mtTraded,

      demandCount: r.demandCount,
    })),

    topExporters: topExporters.map((r) => ({
      exporterName: r.name ?? "—",

      exporterEmail: r.email,

      mtSupplied: r.mtSupplied,

      revenueEur: r.revenue,

      receiptCount: r.receipts,
    })),

    topBuyers: topBuyers.map((r) => ({
      buyerName: r.name ?? "—",

      buyerEmail: r.email,

      mtPurchased: r.mtPurchased,

      spendEur: r.spend,

      demandCount: r.demands,
    })),
  };
}

// ══════════════════════════════════════════════════════════════
// SINGLE EXPORTER REPORT
// ══════════════════════════════════════════════════════════════

export async function buildExporterReport(
  exporterUserId: string,
  period: ReportPeriod
): Promise<ExporterReport> {
  const pw = (col: any) => periodWhere(col, period);

  const [exporter] = await db
    .select({
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, exporterUserId))
    .limit(1);

  // Warehouse
  const [warehouseStats] = await db
    .select({
      receiptCount: count(),

      totalMtReceived: sql<number>`
        COALESCE(SUM(${warehouseReceiptItems.quantityMt}), 0)
      `.mapWith(Number),

      totalMtDispatch: sql<number>`
        COALESCE(SUM(${warehouseReceiptItems.quantityDispatchedMt}), 0)
      `.mapWith(Number),

      pendingInspect: sql<number>`
        SUM(
          CASE
            WHEN ${warehouseReceipts.status} = 'pending_inspection'
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),

      approved: sql<number>`
        SUM(
          CASE
            WHEN ${warehouseReceipts.status} = 'approved'
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),
    })
    .from(warehouseReceipts)
    .leftJoin(
      warehouseReceiptItems,
      eq(warehouseReceiptItems.receiptId, warehouseReceipts.id)
    )
    .where(
      and(
        eq(warehouseReceipts.ownerId, exporterUserId),
        pw(warehouseReceipts.createdAt)
      )
    );

  // Sales
  const [salesStats] = await db
    .select({
      total: count(),

      totalMt: sql<number>`
        COALESCE(SUM(${demandAllocations.allocatedMt}), 0)
      `.mapWith(Number),

      totalRevenue: sql<number>`
        COALESCE(SUM(${demandAllocations.allocationAmount}), 0)
      `.mapWith(Number),

      pendingSettl: sql<number>`
        SUM(
          CASE
            WHEN ${demandAllocations.settlementStatus} = 'pending'
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),

      settledCount: sql<number>`
        SUM(
          CASE
            WHEN ${demandAllocations.settlementStatus} = 'settled'
            THEN 1
            ELSE 0
          END
        )
      `.mapWith(Number),

      settledValue: sql<number>`
        COALESCE(
          SUM(
            CASE
              WHEN ${demandAllocations.settlementStatus} = 'settled'
              THEN ${demandAllocations.allocationAmount}
              ELSE 0
            END
          ),
          0
        )
      `.mapWith(Number),
    })
    .from(demandAllocations)
    .where(
      and(
        eq(demandAllocations.exporterUserId, exporterUserId),
        pw(demandAllocations.createdAt)
      )
    );

  // Commodity breakdown
  const commodityBreakdown = await db
    .select({
      name: commodities.name,

      mtReceived: sql<number>`
        COALESCE(SUM(${warehouseReceiptItems.quantityMt}), 0)
      `.mapWith(Number),

      mtSold: sql<number>`
        COALESCE(SUM(${demandAllocations.allocatedMt}), 0)
      `.mapWith(Number),

      revenue: sql<number>`
        COALESCE(SUM(${demandAllocations.allocationAmount}), 0)
      `.mapWith(Number),
    })
    .from(commodities)
    .leftJoin(
      warehouseReceiptItems,
      eq(warehouseReceiptItems.commodityId, commodities.id)
    )
    .leftJoin(
      warehouseReceipts,
      and(
        eq(warehouseReceiptItems.receiptId, warehouseReceipts.id),
        eq(warehouseReceipts.ownerId, exporterUserId)
      )
    )
    .leftJoin(
      demandAllocations,
      and(
        eq(demandAllocations.receiptItemId, warehouseReceiptItems.id),
        eq(demandAllocations.exporterUserId, exporterUserId)
      )
    )
    .groupBy(commodities.name)
    .orderBy(
      desc(sql`SUM(${demandAllocations.allocatedMt})`)
    );

  return {
    meta: {
      period: period.label,
      generatedAt: new Date().toISOString(),
      exporterName: exporter?.name ?? "—",
      exporterEmail: exporter?.email ?? "—",
    },

    warehouse: {
      receiptCount: warehouseStats?.receiptCount ?? 0,

      totalMtReceived:
        warehouseStats?.totalMtReceived ?? 0,

      totalMtInStock:
        (warehouseStats?.totalMtReceived ?? 0) -
        (warehouseStats?.totalMtDispatch ?? 0),

      totalMtDispatched:
        warehouseStats?.totalMtDispatch ?? 0,

      pendingInspection:
        warehouseStats?.pendingInspect ?? 0,

      approved:
        warehouseStats?.approved ?? 0,
    },

    sales: {
      totalAllocations:
        salesStats?.total ?? 0,

      totalMtAllocated:
        salesStats?.totalMt ?? 0,

      totalRevenueEur:
        salesStats?.totalRevenue ?? 0,

      pendingSettlement:
        salesStats?.pendingSettl ?? 0,

      settledCount:
        salesStats?.settledCount ?? 0,

      settledValueEur:
        salesStats?.settledValue ?? 0,
    },

    commodities: commodityBreakdown.map((r) => ({
      commodityName: r.name,
      mtReceived: r.mtReceived,
      mtSold: r.mtSold,
      revenueEur: r.revenue,
    })),
  };
}

// ══════════════════════════════════════════════════════════════
// SINGLE BUYER REPORT
// ══════════════════════════════════════════════════════════════

export async function buildBuyerReport(
  buyerUserId: string,
  period: ReportPeriod
): Promise<BuyerReport> {
  const pw = (col: any) => periodWhere(col, period);

  const [buyer] = await db
    .select({ name: users.name, email: users.email, profileId: buyerProfiles.id })
    .from(users)
    .leftJoin(buyerProfiles, eq(buyerProfiles.userId, buyerUserId))
    .where(eq(users.id, buyerUserId))
    .limit(1);

  const profileId = buyer?.profileId;

  // Demands
  const [demandStats] = await db
    .select({
      total:     count(),
      fulfilled: sql<number>`SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END)`.mapWith(Number),
      pending:   sql<number>`SUM(CASE WHEN status IN ('submitted','under_review','quoted','accepted','allocated') THEN 1 ELSE 0 END)`.mapWith(Number),
      cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`.mapWith(Number),
      rfqCount:  sql<number>`SUM(CASE WHEN is_rfq THEN 1 ELSE 0 END)`.mapWith(Number),
    })
    .from(demandRequests)
    .where(profileId
      ? and(eq(demandRequests.buyerId, profileId), pw(demandRequests.createdAt))
      : sql`1=0`
    );

  // Spend
  /* const [spendStats] = await db
    .select({
      totalPayments: count(),
      totalSpend:    sql<number>`COALESCE(SUM(amount_paid), 0)`.mapWith(Number),
      totalMt:       sql<number>`COALESCE(SUM(dr.quantity_mt::numeric), 0)`.mapWith(Number),
    })
    .from(payments)
    .leftJoin(demandRequests, eq(payments.demandId, demandRequests.id))
    .where(profileId
      ? and(eq(demandRequests.buyerId, profileId), pw(payments.createdAt))
      : sql`1=0`
    ); */
  const [spendStats] = await db
    .select({
      totalPayments: count(),
      totalSpend: sql<number>`
        COALESCE(SUM(${payments.amountPaid}), 0)
      `.mapWith(Number),

      totalMt: sql<number>`
        COALESCE(SUM(${demandRequests.quantityMt}::numeric), 0)
      `.mapWith(Number),
    })
    .from(payments)
    .leftJoin(
      demandRequests,
      eq(payments.demandId, demandRequests.id)
    )
    .where(
      profileId
        ? and(
            eq(demandRequests.buyerId, profileId),
            pw(payments.createdAt)
          )
        : sql`1=0`
    );

  // Shipments
  const shipmentRows = await db
    .select({ status: shipments.status, cnt: count() })
    .from(shipments)
    .leftJoin(demandRequests, eq((shipments as any).demandId, demandRequests.id))
    .where(profileId
      ? and(eq(demandRequests.buyerId, profileId), pw(shipments.createdAt))
      : sql`1=0`
    )
    .groupBy(shipments.status);

  // Commodity breakdown
  /* const commodityBreakdown = await db
    .select({
      name:    commodities.name,
      mt:      sql<number>`COALESCE(SUM(demandRequests.quantity_mt::numeric), 0)`.mapWith(Number),
      spend:   sql<number>`COALESCE(SUM(p.amount_paid), 0)`.mapWith(Number),
      demands: sql<number>`COUNT(DISTINCT demandRequests.id)`.mapWith(Number),
    })
    .from(commodities)
    .leftJoin(demandRequests, and(
      eq(demandRequests.commodityId, commodities.id),
      profileId ? eq(demandRequests.buyerId, profileId) : sql`1=0`
    ))
    .leftJoin(payments, eq(payments.demandId, demandRequests.id))
    .groupBy(commodities.name)
    .having(sql`COUNT(DISTINCT demandRequests.id) > 0`)
    .orderBy(desc(sql`SUM(p.amount_paid)`)); */

  const commodityBreakdown = await db
    .select({
      name: commodities.name,

      mt: sql<number>`
        COALESCE(SUM(${demandRequests.quantityMt}::numeric), 0)
      `.mapWith(Number),

      spend: sql<number>`
        COALESCE(SUM(${payments.amountPaid}), 0)
      `.mapWith(Number),

      demands: sql<number>`
        COUNT(DISTINCT ${demandRequests.id})
      `.mapWith(Number),
    })
    .from(commodities)
    .leftJoin(
      demandRequests,
      and(
        eq(demandRequests.commodityId, commodities.id),
        profileId
          ? eq(demandRequests.buyerId, profileId)
          : sql`1=0`
      )
    )
    .leftJoin(
      payments,
      eq(payments.demandId, demandRequests.id)
    )
    .groupBy(commodities.name)
    .having(sql`COUNT(DISTINCT ${demandRequests.id}) > 0`)
    .orderBy(
      desc(sql`SUM(${payments.amountPaid})`)
    );

  const shipByStatus = (s: string) => shipmentRows.find(r => r.status === s)?.cnt ?? 0;

  return {
    meta: {
      period:      period.label,
      generatedAt: new Date().toISOString(),
      buyerName:   buyer?.name  ?? "—",
      buyerEmail:  buyer?.email ?? "—",
    },
    demands: {
      total:     demandStats?.total     ?? 0,
      fulfilled: demandStats?.fulfilled ?? 0,
      pending:   demandStats?.pending   ?? 0,
      cancelled: demandStats?.cancelled ?? 0,
      rfqCount:  demandStats?.rfqCount  ?? 0,
    },
    spend: {
      totalPayments:  spendStats?.totalPayments ?? 0,
      totalSpendEur:  spendStats?.totalSpend    ?? 0,
      totalMtOrdered: spendStats?.totalMt       ?? 0,
    },
    shipments: {
      total:     shipmentRows.reduce((s, r) => s + r.cnt, 0),
      delivered: shipByStatus("delivered"),
      inTransit: shipByStatus("in_transit"),
      booked:    shipByStatus("booked"),
    },
    commodities: commodityBreakdown.map(r => ({
      commodityName: r.name,
      mtOrdered:     r.mt,
      spendEur:      r.spend,
      demandCount:   r.demands,
    })),
  };
}

// ══════════════════════════════════════════════════════════════
// CSV SERIALISER
// ══════════════════════════════════════════════════════════════

/**
 * Converts a report object into a single CSV string.
 * Each top-level key becomes a section with its own header row.
 */
export function reportToCsv(report: Record<string, any>): string {
  const lines: string[] = [];

  function escCell(v: any): string {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  }

  function flattenSection(section: any, name: string) {
    lines.push(`\n=== ${name.toUpperCase()} ===`);

    if (typeof section !== "object" || section === null) {
      lines.push(escCell(section));
      return;
    }

    if (Array.isArray(section)) {
      if (section.length === 0) return;
      const keys = Object.keys(section[0]);
      lines.push(keys.map(escCell).join(","));
      for (const row of section) {
        lines.push(keys.map(k => escCell(row[k])).join(","));
      }
      return;
    }

    // Plain object — key/value pairs
    for (const [key, val] of Object.entries(section)) {
      if (Array.isArray(val)) {
        lines.push(`\n-- ${key} --`);
        if (val.length > 0) {
          const keys = Object.keys(val[0]);
          lines.push(keys.map(escCell).join(","));
          for (const row of val) {
            lines.push(keys.map(k => escCell(row[k])).join(","));
          }
        }
      } else {
        lines.push(`${escCell(key)},${escCell(val)}`);
      }
    }
  }

  for (const [key, value] of Object.entries(report)) {
    flattenSection(value, key);
  }

  return lines.join("\n");
}
