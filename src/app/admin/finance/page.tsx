import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import {
  payments, demandRequests, demandAllocations,
  commodities, users, buyerProfiles,
} from "@/db/schema";

import { eq, desc, count, sql } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { PAYMENT_METHODS, SETTLEMENT_STATUS_META } from "@/lib/payments";
import { SettlementAction } from "@/components/admin/SettlementAction";
import {
  DollarSign, CheckCircle2, Clock, TrendingUp,
  ExternalLink, FileImage,
} from "lucide-react";

const db = getDb();

export const metadata: Metadata = { title: "Finance & Settlement – Admin" };

export default async function AdminFinancePage() {
  await requireRole(["admin"]);
  // All payment records
  const allPayments = await db
    .select({
      id:                payments.id,
      paymentRef:        payments.paymentRef,
      amountPaid:        payments.amountPaid,
      currency:          payments.currency,
      paymentMethod:     payments.paymentMethod,
      transactionRef:    payments.transactionRef,
      valueDate:         payments.valueDate,
      createdAt:         payments.createdAt,
      proofOfPaymentUrl: (payments as any).proofOfPaymentUrl,
      demandRef:         demandRequests.demandRef,
      demandId:          payments.demandId,
      buyerName:         users.name,
      buyerEmail:        users.email,
    })
    .from(payments)
    .leftJoin(demandRequests, eq(payments.demandId,        demandRequests.id))
    .leftJoin(buyerProfiles,  eq(demandRequests.buyerId,   buyerProfiles.id))
    .leftJoin(users,          eq(buyerProfiles.userId,     users.id))
    .orderBy(desc(payments.createdAt));

  // Per-exporter settlement summary (dispatched allocations only)
  const settlementRows = await db
    .select({
      exporterUserId:    demandAllocations.exporterUserId,
      exporterName:      users.name,
      exporterEmail:     users.email,
      settlementStatus:  demandAllocations.settlementStatus,
      settledAt:         demandAllocations.settledAt,
      totalAllocatedMt:  sql<string>`SUM(${demandAllocations.allocatedMt})`,
      totalAmount:       sql<string>`SUM(${demandAllocations.allocationAmount})`,
      allocationCount:   count(demandAllocations.id),
    })
    .from(demandAllocations)
    .leftJoin(users, eq(demandAllocations.exporterUserId, users.id))
    .where(sql`${demandAllocations.status} = 'dispatched'`)
    .groupBy(
      demandAllocations.exporterUserId,
      users.name,
      users.email,
      demandAllocations.settlementStatus,
      demandAllocations.settledAt,
    )
    .orderBy(users.name);

  // Summary totals
  const totalReceived = allPayments.reduce(
    (s, p) => s + parseFloat(String(p.amountPaid)), 0
  );
  const totalSettled  = settlementRows
    .filter((r) => r.settlementStatus === "settled")
    .reduce((s, r) => s + parseFloat(r.totalAmount || "0"), 0);
  const totalPending  = settlementRows
    .filter((r) => r.settlementStatus === "pending")
    .reduce((s, r) => s + parseFloat(r.totalAmount || "0"), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">Finance & Settlement</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Payment confirmations and exporter settlement status.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Received (EUR)",
            value: totalReceived.toLocaleString("en-EU", {
              style: "currency", currency: "EUR", maximumFractionDigits: 0,
            }),
            icon: DollarSign, color: "text-green-600", bg: "bg-green-50",
          },
          {
            label: "Pending Settlement",
            value: totalPending.toLocaleString("en-EU", {
              style: "currency", currency: "EUR", maximumFractionDigits: 0,
            }),
            icon: Clock, color: "text-amber-600", bg: "bg-amber-50",
          },
          {
            label: "Settled to Exporters",
            value: totalSettled.toLocaleString("en-EU", {
              style: "currency", currency: "EUR", maximumFractionDigits: 0,
            }),
            icon: CheckCircle2, color: "text-primary-600", bg: "bg-primary-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="font-display font-bold text-xl text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Exporter Settlement ──────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg text-neutral-900">Exporter Settlements</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            All dispatched allocations — mark as settled once the exporter has been paid out.
          </p>
        </div>

        {settlementRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <TrendingUp className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">No settled demands yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  {[
                    "Exporter / Farmer",
                    "Dispatched Qty",
                    "Their Amount (EUR)",
                    "Settlement",
                    "Settled On",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {settlementRows.map((row, i) => {
                  const smeta = SETTLEMENT_STATUS_META[row.settlementStatus ?? "pending"];
                  return (
                    <tr key={`${row.exporterUserId}-${i}`} className="hover:bg-neutral-50 align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-900 text-sm">
                          {row.exporterName ?? "—"}
                        </p>
                        <p className="text-xs text-neutral-400">{row.exporterEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-neutral-700">
                        {parseFloat(row.totalAllocatedMt || "0").toFixed(3)} MT
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        {parseFloat(row.totalAmount || "0").toLocaleString("en-EU", {
                          style: "currency", currency: "EUR", maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: smeta.bg, color: smeta.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: smeta.dot }} />
                          {smeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400">
                        {row.settledAt ? formatDate(row.settledAt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <SettlementAction
                          exporterUserId={row.exporterUserId}
                          exporterName={row.exporterName}
                          currentStatus={row.settlementStatus ?? "pending"}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payment Records ───────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg text-neutral-900">Payment Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {[
                  "Ref", "Demand", "Buyer", "Amount", "Method",
                  "Transaction Ref", "Value Date", "Proof", "",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {allPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-neutral-400">
                    No payments confirmed yet.
                  </td>
                </tr>
              ) : (
                allPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-neutral-800">
                      {p.paymentRef}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/demands/${p.demandId}`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800"
                      >
                        {p.demandRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-neutral-900">{p.buyerName ?? "—"}</p>
                      <p className="text-[11px] text-neutral-400 truncate max-w-[140px]">{p.buyerEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-900 whitespace-nowrap">
                      {parseFloat(String(p.amountPaid)).toLocaleString("en-EU", {
                        style: "currency", currency: p.currency, maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">
                      {PAYMENT_METHODS[p.paymentMethod] ?? p.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-700 truncate max-w-[160px]">
                      {p.transactionRef}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {p.valueDate ? formatDate(p.valueDate) : "—"}
                    </td>
                    {/* Proof of payment link */}
                    <td className="px-4 py-3">
                      {p.proofOfPaymentUrl ? (
                        <a
                          href={p.proofOfPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                          title="View proof of payment"
                        >
                          <FileImage className="h-3.5 w-3.5" />
                          Proof
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/demands/${p.demandId}`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
