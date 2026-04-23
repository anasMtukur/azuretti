/**
 * src/app/api/admin/payments/route.ts
 *
 * POST — Admin confirms that a buyer's payment has been received.
 *
 * On success:
 *   1. Creates a payments record
 *   2. Updates the demand status → "fulfilled"
 *   3. Updates all demandAllocations for this demand → status "dispatched",
 *      settlementStatus "pending"
 *   4. Links the payment to the demand (quoteId equivalent)
 *
 * All steps run inside a single DB transaction.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import {
  payments,
  demandRequests,
  demandAllocations,
} from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";
import { generatePaymentRef } from "@/lib/payments";

const schema = z.object({
  demandId:           z.string().uuid(),
  amountPaid:         z.number().positive(),
  currency:           z.string().default("EUR"),
  paymentMethod:      z.enum([
    "wire_transfer", "swift", "lc",
    "documentary_collection", "cash_advance", "other",
  ]),
  transactionRef:     z.string().min(1, "Transaction reference is required"),
  valueDate:          z.preprocess((val) => {
                        if (typeof val === "string") {
                        return new Date(val).toISOString();
                        }
                        return val;
                      }, z.string().datetime()).optional(),
  proofOfPaymentUrl:  z.string().min(1, "Proof of Transaction is required"),
  payerBank:          z.string().optional(),
  payerAccountName:   z.string().optional(),
  payerIban:          z.string().optional(),
  receiverBank:       z.string().optional(),
  receiverAccount:    z.string().optional(),
  exchangeRate:       z.number().positive().optional(),
  exchangeRateTo:     z.string().optional(),
  notes:              z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Verify demand exists and is in a state that can receive payment
  const [demand] = await db
    .select({ id: demandRequests.id, status: demandRequests.status })
    .from(demandRequests)
    .where(eq(demandRequests.id, d.demandId))
    .limit(1);

  if (!demand) {
    return NextResponse.json({ error: "Demand not found" }, { status: 404 });
  }
  if (!["accepted", "allocated"].includes(demand.status)) {
    return NextResponse.json(
      { error: `Demand must be in 'accepted' or 'allocated' state (current: ${demand.status})` },
      { status: 400 }
    );
  }

  const [{ total }] = await db.select({ total: count() }).from(payments);
  const paymentRef  = generatePaymentRef(total + 1);

  const result = await db.transaction(async (tx) => {
    // 1. Create payment record
    const [payment] = await tx
      .insert(payments)
      .values({
        paymentRef,
        demandId:          d.demandId,
        confirmedBy:       session.user.id,
        amountPaid:        String(d.amountPaid),
        currency:          d.currency,
        paymentMethod:     d.paymentMethod,
        transactionRef:    d.transactionRef,
        valueDate:         d.valueDate ? new Date(d.valueDate) : null,
        payerBank:         d.payerBank        ?? null,
        proofOfPaymentUrl: d.proofOfPaymentUrl,
        payerAccountName:  d.payerAccountName ?? null,
        payerIban:         d.payerIban        ?? null,
        receiverBank:      d.receiverBank     ?? null,
        receiverAccount:   d.receiverAccount  ?? null,
        exchangeRate:      d.exchangeRate     ? String(d.exchangeRate)  : null,
        exchangeRateTo:    d.exchangeRateTo   ?? null,
        notes:             d.notes            ?? null,
      })
      .returning();

    // 2. Update demand → fulfilled
    await tx
      .update(demandRequests)
      .set({ status: "fulfilled", updatedAt: new Date() })
      .where(eq(demandRequests.id, d.demandId));

    // 3. Update all allocations for this demand → dispatched, pending settlement
    await tx
      .update(demandAllocations)
      .set({
        status:           "dispatched",
        dispatchedAt:     new Date(),
        settlementStatus: "pending",
        updatedAt:        new Date(),
      })
      .where(eq(demandAllocations.demandId, d.demandId));

    return payment;
  });

  return NextResponse.json(
    { id: result.id, paymentRef: result.paymentRef },
    { status: 201 }
  );
}

// ── GET /api/admin/payments — list all payments (admin finance view) ───────
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select()
    .from(payments)
    .orderBy(payments.createdAt);

  return NextResponse.json({ payments: rows });
}
