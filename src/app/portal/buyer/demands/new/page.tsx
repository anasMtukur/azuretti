import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import { eq } from "drizzle-orm";
import { DemandForm } from "@/components/buyer/DemandForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const db = getDb();

export const metadata: Metadata = { title: "Place Demand – Buyer Portal" };

interface Props {
  searchParams: { commodity?: string };
}

export default async function NewDemandPage({ searchParams }: Props) {
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

  // Pre-select from commodity detail page (?commodity=<slug>)
  const preselected = searchParams.commodity
    ? allCommodities.find((c) => c.slug === searchParams.commodity || c.id === searchParams.commodity)
    : undefined;

  return (
    <div className="max-w-full space-y-6">
      {/* Back */}
      <Link
        href="/portal/buyer/demands"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my demands
      </Link>

      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">Place Demand</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Specify what you need and our trade team will process your order and
          allocate stock from verified Nigerian exporters.
        </p>
      </div>

      <DemandForm
        commodities={allCommodities}
        preselectedCommodityId={preselected?.id}
        isRfq={false}
      />
    </div>
  );
}
