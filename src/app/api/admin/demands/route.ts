import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  demandRequests, buyerProfiles, commodities, users
} from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status");
  const isRfq    = searchParams.get("rfq") === "true";

  const conditions: any[] = [eq(demandRequests.isRfq, isRfq)];
  if (status && status !== "all") conditions.push(eq(demandRequests.status, status as any));

  const rows = await db
    .select({
      id:          demandRequests.id,
      demandRef:   demandRequests.demandRef,
      status:      demandRequests.status,
      isRfq:       demandRequests.isRfq,
      quantityMt:  demandRequests.quantityMt,
      containerSize:     demandRequests.containerSize,
      preferredIncoterm: demandRequests.preferredIncoterm,
      deliveryCountry:   demandRequests.deliveryCountry,
      createdAt:         demandRequests.createdAt,
      buyerName:    users.name,
      buyerEmail:   users.email,
      commodityName: commodities.name,
      commodityCategory: commodities.category,
    })
    .from(demandRequests)
    .leftJoin(buyerProfiles, eq(demandRequests.buyerId, buyerProfiles.id))
    .leftJoin(users,         eq(buyerProfiles.userId, users.id))
    .leftJoin(commodities,   eq(demandRequests.commodityId, commodities.id))
    .where(and(...conditions))
    .orderBy(desc(demandRequests.createdAt))
    .limit(100);

  return NextResponse.json({ demands: rows });
}