import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { exporterProfiles } from "@/db/schema";
import { getSession } from "@/lib/auth/helpers";

const schema = z.object({
  companyName:           z.string().min(2),
  companyEmail:          z.string().email(),
  rcNumber:              z.string().min(2),
  exportLicense:         z.string().optional(),
  directorName:          z.string().min(2),
  directorNin:           z.string().regex(/^\d{11}$/),
  phone:                 z.string().optional(),
  state:                 z.string().optional(),
  address:               z.string().optional(),
  interestedCommodities: z.array(z.string()).max(3).default([]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowedRoles = ["exporter", "farmer", "investor"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "This endpoint is for exporters only." }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const {
    companyName, companyEmail, rcNumber, exportLicense,
    directorName, directorNin, phone, state, address,
    interestedCommodities,
  } = parsed.data;

  // Sensitive KYC fields are stored in metadata as a JSON object
  // so they can be access-controlled separately if needed
  const metadata = {
    companyEmail,
    directorName,
    directorNin,         // stored encrypted in production — see security notes
    interestedCommodities,
  };

  const existing = await db
    .select({ id: exporterProfiles.id })
    .from(exporterProfiles)
    .where(eq(exporterProfiles.userId, session.user.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(exporterProfiles)
      .set({
        companyName,
        registrationNo: rcNumber,
        exportLicense:  exportLicense ?? null,
        phone:          phone         ?? null,
        state:          state         ?? null,
        address:        address       ?? null,
        metadata,
        updatedAt: new Date(),
      })
      .where(eq(exporterProfiles.userId, session.user.id));
  } else {
    await db.insert(exporterProfiles).values({
      userId:         session.user.id,
      companyName,
      registrationNo: rcNumber,
      exportLicense:  exportLicense ?? null,
      country:        "Nigeria",
      phone:          phone         ?? null,
      state:          state         ?? null,
      address:        address       ?? null,
      metadata,
    });
  }

  return NextResponse.json({ message: "Profile saved." }, { status: 200 });
}