import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { buyerProfiles } from "@/db/schema";

import { getSession } from "@/lib/auth/helpers";

const db = getDb();

const schema = z.object({
  companyName:           z.string().min(2),
  companyEmail:          z.string().email(),
  companyWebsite:        z.string().url(),
  registrationNo:        z.string().min(2),
  companyAddress:        z.string().min(5),
  country:               z.string().min(2),
  city:                  z.string().optional(),
  phone:                 z.string().optional(),
  businessType:          z.enum([
    "importer", "distributor", "wholesaler", "food_manufacturer", "other",
  ]),
  interestedCommodities: z.array(z.string()).max(3).default([]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "buyer") {
    return NextResponse.json({ error: "This endpoint is for buyers only." }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const {
    companyName, companyEmail, companyWebsite, registrationNo, companyAddress,
    country, city, phone, businessType, interestedCommodities,
  } = parsed.data;

  // Store company email and address in metadata
  const metadata = {
    companyEmail,
    companyAddress,
    companyWebsite,
    interestedCommodities,
  };

  const existing = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, session.user.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(buyerProfiles)
      .set({
        companyName,
        registrationNo:        registrationNo,
        country,
        city:                  city ?? null,
        phone:                 phone ?? null,
        address:               companyAddress,
        businessType,
        interestedCommodities,
        onboardingComplete:    true,
        metadata,
        updatedAt:             new Date(),
      })
      .where(eq(buyerProfiles.userId, session.user.id));
  } else {
    await db.insert(buyerProfiles).values({
      userId:                session.user.id,
      companyName,
      country,
      city:                  city ?? null,
      phone:                 phone ?? null,
      address:               companyAddress,
      vatNumber:             registrationNo,   // maps reg number to vatNumber column
      businessType,
      interestedCommodities,
      onboardingComplete:    true,
      metadata,
    });
  }

  return NextResponse.json({ message: "Profile saved." }, { status: 200 });
}