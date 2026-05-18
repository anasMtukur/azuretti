import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  demandRequests, demandQuotes, buyerProfiles,
  commodities, demandAllocations,
} from "@/db/schema";

import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles).where(eq(buyerProfiles.userId, session.user.id)).limit(1);

  const [demand] = await db
    .select({
      demand:    demandRequests,
      commodity: { name: commodities.name, slug: commodities.slug, category: commodities.category },
    })
    .from(demandRequests)
    .leftJoin(commodities, eq(demandRequests.commodityId, commodities.id))
    .where(
      and(
        eq(demandRequests.id, params.id),
        profile ? eq(demandRequests.buyerId, profile.id) : undefined,
      )
    )
    .limit(1);

  if (!demand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Attach quote if present
  let quote = null;
  if (demand.demand.quoteId) {
    const [q] = await db.select().from(demandQuotes)
      .where(eq(demandQuotes.id, demand.demand.quoteId!)).limit(1);
    quote = q;
  }

  return NextResponse.json({ ...demand, quote });
}

// Buyer accepts or rejects a quote, optionally adjusting quantity
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "buyer")
    return NextResponse.json({ error: "Buyers only" }, { status: 403 });

  const body = await req.json() as {
    action: "accept" | "reject";
    adjustedQtyMt?: number;
  };

  const [demand] = await db.select().from(demandRequests)
    .where(eq(demandRequests.id, params.id)).limit(1);
  if (!demand || demand.status !== "quoted")
    return NextResponse.json({ error: "Demand not in quoted state" }, { status: 400 });

  const [quote] = await db.select().from(demandQuotes)
    .where(eq(demandQuotes.id, demand.quoteId!)).limit(1);
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  // Validate quote has not expired
  if (new Date() > quote.validUntil) {
    await db.update(demandRequests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(demandRequests.id, params.id));
    return NextResponse.json({ error: "Quote has expired." }, { status: 400 });
  }

  const isAccept = body.action === "accept";
  const adjustedQty = body.adjustedQtyMt;

  // Validate quantity adjustment based on lock type
  if (isAccept && adjustedQty !== undefined) {
    const originalQty = parseFloat(String(quote.quotedQtyMt));
    if (quote.qtyLock === "locked" && adjustedQty !== originalQty) {
      return NextResponse.json({ error: "This quote has a fixed (locked) quantity." }, { status: 400 });
    }
    if (quote.qtyLock === "min_qty" && adjustedQty < originalQty) {
      return NextResponse.json({ error: "Quantity cannot be reduced below the quoted minimum." }, { status: 400 });
    }
  }

  await db.transaction(async (tx) => {
    await tx.update(demandQuotes).set({
      buyerResponse:    isAccept ? "accepted" : "rejected",
      buyerRespondedAt: new Date(),
      buyerQtyMt:       adjustedQty ? String(adjustedQty) : null,
      updatedAt:        new Date(),
    }).where(eq(demandQuotes.id, quote.id));

    await tx.update(demandRequests).set({
      status:    isAccept ? "accepted" : "rejected",
      isRfq:     false,
      updatedAt: new Date(),
      ...(isAccept && adjustedQty ? { quantityMt: String(adjustedQty) } : {}),
    }).where(eq(demandRequests.id, params.id));
  });

  return NextResponse.json({ message: isAccept ? "Demand accepted." : "Quote rejected." });
}