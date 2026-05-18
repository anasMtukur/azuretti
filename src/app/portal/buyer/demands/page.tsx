import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { demandRequests, buyerProfiles, commodities } from "@/db/schema";

import { eq, desc, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { DEMAND_STATUS_META } from "@/lib/demands";
import { Plus, Package, FileQuestion } from "lucide-react";
import DemandsTable from "@/components/demand/DemandsTable";

const db = getDb();

export const metadata: Metadata = { title: "My Demands – Buyer Portal" };

export default async function BuyerDemandsPage() {
  const user = await requireRole(["buyer", "admin"]);

  const [profile] = await db
    .select({ id: buyerProfiles.id })
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, user.id))
    .limit(1);

  const demands = profile
    ? await db
        .select({
          id:            demandRequests.id,
          demandRef:     demandRequests.demandRef,
          status:        demandRequests.status,
          isRfq:         demandRequests.isRfq,
          quantityMt:    demandRequests.quantityMt,
          containerSize: demandRequests.containerSize,
          deliveryCountry: demandRequests.deliveryCountry,
          createdAt:     demandRequests.createdAt,
          commodityName: commodities.name,
          commodityCategory: commodities.category,
        })
        .from(demandRequests)
        .leftJoin(commodities, eq(demandRequests.commodityId, commodities.id))
        .where(
          and(
            eq(demandRequests.buyerId, profile.id),
            eq(demandRequests.isRfq, false),
          )
        )
        .orderBy(desc(demandRequests.createdAt))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">My Demands</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {demands.length} demand{demands.length !== 1 ? "s" : ""} placed
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/portal/buyer/rfq/new" className="btn-outline text-sm px-4 py-2">
            <FileQuestion className="h-4 w-4" />
            Request a Quote
          </Link>
          <Link href="/portal/buyer/demands/new" className="btn-primary text-sm px-4 py-2">
            <Plus className="h-4 w-4" />
            Place Demand
          </Link>
        </div>
      </div>

      {/* Table */}
      <DemandsTable demands={demands} />
    </div>
  );
}
