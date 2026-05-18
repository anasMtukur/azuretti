import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { demandRequests, buyerProfiles } from "@/db/schema";

import { eq, desc, count } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";
import { generateDemandRef } from "@/lib/demands";

const db = getDb();

const createSchema = z.object({
  commodityId:         z.string().uuid(),
  quantityMt:          z.number().positive(),
  packagingType:       z.string().optional(),
  containerSize:       z.string().optional(),
  preferredIncoterm:   z.string().optional(),
  deliveryPort:        z.string().optional(),
  deliveryCountry:     z.string().optional(),
  preferredGrade:      z.string().optional(),
  targetPricePerMt:    z.number().positive().optional(),
  targetPriceCurrency: z.string().default("EUR"),
  timelineFrom:        z.preprocess((val) => {
                          if (typeof val === "string") {
                          return new Date(val).toISOString();
                          }
                          return val;
                        }, z.string().datetime()).optional(),
  timelineTo:          z.preprocess((val) => {
                          if (typeof val === "string") {
                          return new Date(val).toISOString();
                          }
                          return val;
                        }, z.string().datetime()).optional(),
  specialRequirements: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles).where(eq(buyerProfiles.userId, session.user.id)).limit(1);

  if (!profile) return NextResponse.json({ demands: [] });

  const demands = await db
    .select()
    .from(demandRequests)
    .where(eq(demandRequests.buyerId, profile.id))
    .orderBy(desc(demandRequests.createdAt));

  return NextResponse.json({ demands });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "buyer")
    return NextResponse.json({ error: "Buyers only" }, { status: 403 });

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles).where(eq(buyerProfiles.userId, session.user.id)).limit(1);

  if (!profile)
    return NextResponse.json({ error: "Complete your buyer profile first." }, { status: 400 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const [{ total }] = await db.select({ total: count() }).from(demandRequests);
  const demandRef   = generateDemandRef(total + 1);

  const [demand] = await db.insert(demandRequests).values({
    demandRef,
    buyerId:             profile.id,
    commodityId:         parsed.data.commodityId,
    quantityMt:          String(parsed.data.quantityMt),
    packagingType:       parsed.data.packagingType       ?? null,
    containerSize:       parsed.data.containerSize       ?? null,
    preferredIncoterm:   parsed.data.preferredIncoterm   ?? null,
    deliveryPort:        parsed.data.deliveryPort        ?? null,
    deliveryCountry:     parsed.data.deliveryCountry     ?? null,
    preferredGrade:      parsed.data.preferredGrade      ?? null,
    targetPricePerMt:    parsed.data.targetPricePerMt ? String(parsed.data.targetPricePerMt) : null,
    targetPriceCurrency: parsed.data.targetPriceCurrency,
    timelineFrom:        parsed.data.timelineFrom ? new Date(parsed.data.timelineFrom) : null,
    timelineTo:          parsed.data.timelineTo   ? new Date(parsed.data.timelineTo)   : null,
    specialRequirements: parsed.data.specialRequirements ?? null,
    status:              "submitted",
    isRfq:               false,
  }).returning();

  return NextResponse.json({ id: demand.id, demandRef: demand.demandRef }, { status: 201 });
}
