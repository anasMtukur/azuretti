import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import { requireRole } from "@/lib/auth/helpers";

const db = getDb();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireRole(["admin"]);

  await db
    .update(commodities)
    .set({ isDeleted: false, deletedAt: null, updatedAt: new Date() })
    .where(eq(commodities.id, params.id));

  return Response.json({ success: true });
}