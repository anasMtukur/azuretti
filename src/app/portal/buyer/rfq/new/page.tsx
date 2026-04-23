import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import { commodities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DemandForm } from "@/components/buyer/DemandForm";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Request a Quote – Buyer Portal" };

interface Props {
  searchParams: { commodity?: string };
}

export default async function NewRfqPage({ searchParams }: Props) {
  await requireRole(["buyer", "admin"]);

  const allCommodities = await db
    .select({
      id:            commodities.id,
      name:          commodities.name,
      category:      commodities.category,
      slug:          commodities.slug,
      minOrderQtyMt: commodities.minOrderQtyMt,
    })
    .from(commodities)
    .where(eq(commodities.isActive, true))
    .orderBy(commodities.sortOrder, commodities.name);

  const preselected = searchParams.commodity
    ? allCommodities.find((c) => c.slug === searchParams.commodity || c.id === searchParams.commodity)
    : undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/portal/buyer/rfq"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to quote requests
      </Link>

      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">Request a Quote</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Tell us what you need and our trade team will provide a price quote.
          No commitment is made until you accept the quote.
        </p>
      </div>

      <DemandForm
        commodities={allCommodities}
        preselectedCommodityId={preselected?.id}
        isRfq={true}
      />
    </div>
  );
}
