import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { demandQuotes, demandRequests } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";
import { generateQuoteRef } from "@/lib/demands";

const quoteSchema = z.object({
  demandId:       z.string().uuid(),
  pricePerMt:     z.number().positive(),
  currency:       z.string().default("EUR"),
  quotedQtyMt:    z.number().positive(),
  qtyLock:        z.enum(["locked", "min_qty", "open"]),
  validUntil:     z.preprocess((val) => {
                    if (typeof val === "string") {
                      return new Date(val).toISOString();
                    }
                    return val;
                  }, z.string().datetime()),
  incoterm:       z.string().optional(),
  portOfLoading:  z.string().optional(),
  paymentTerms:   z.string().optional(),
  notes:          z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = quoteSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const d = parsed.data;
  const totalAmount = String((d.pricePerMt * d.quotedQtyMt).toFixed(2));
  const [{ total }] = await db.select({ total: count() }).from(demandQuotes);
  const quoteRef = generateQuoteRef(total + 1);

  const [quote] = await db.transaction(async (tx) => {
    const [q] = await tx.insert(demandQuotes).values({
      quoteRef,
      demandId:      d.demandId,
      issuedBy:      session.user.id,
      pricePerMt:    String(d.pricePerMt),
      currency:      d.currency,
      totalAmount,
      quotedQtyMt:   String(d.quotedQtyMt),
      qtyLock:       d.qtyLock,
      validUntil:    new Date(d.validUntil),
      incoterm:      d.incoterm      ?? null,
      portOfLoading: d.portOfLoading ?? null,
      paymentTerms:  d.paymentTerms  ?? null,
      notes:         d.notes         ?? null,
    }).returning();

    // Link quote to demand and move demand to "quoted" status
    await tx.update(demandRequests).set({
      status: "quoted", quoteId: q.id, updatedAt: new Date(),
    }).where(eq(demandRequests.id, d.demandId));

    return [q];
  });

  return NextResponse.json({ id: quote.id, quoteRef: quote.quoteRef }, { status: 201 });
}