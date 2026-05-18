import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { users, commodities } from "@/db/schema";

import { eq, or } from "drizzle-orm";
import { NewReceiptForm } from "@/components/warehouse/NewReceiptForm";

const db = getDb();

export const metadata: Metadata = { title: "Log New Receipt – Warehouse" };

export default async function NewReceiptPage() {
  await requireRole(["admin"]);

  // Load exporters/farmers for the owner dropdown
  const owners = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(or(eq(users.role, "exporter"), eq(users.role, "farmer"), eq(users.role, "investor")))
    .orderBy(users.name);

  // Load active commodities for item selection
  const allCommodities = await db
    .select({ id: commodities.id, name: commodities.name, category: commodities.category })
    .from(commodities)
    .where(eq(commodities.isActive, true))
    .orderBy(commodities.name);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">Log New Receipt</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Record a commodity drop-off from an exporter or farmer.
        </p>
      </div>
      <NewReceiptForm owners={owners} commodities={allCommodities} />
    </div>
  );
}