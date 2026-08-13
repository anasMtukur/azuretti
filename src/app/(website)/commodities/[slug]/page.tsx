import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCommodityStats } from "@/lib/commodity-stats";
import { CommodityDetailClient } from "@/components/website/CommodityDetailClient";
import { HeroSubSection } from "@/components/website/sections/HeroSubSection";

const db = getDb();

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const commodity = await db.query.commodities.findFirst({
    where: eq(commodities.slug, params.slug),
  });
  if (!commodity) return { title: "Not Found" };
  return {
    title: `${commodity.name} | Azuretti`,
    description: commodity.description ?? undefined,
  };
}

export default async function CommodityDetailPage({ params }: { params: { slug: string } }) {
  const commodity = await db.query.commodities.findFirst({
    where: eq(commodities.slug, params.slug),
  });

  if (!commodity || !commodity.isActive) notFound();

  const stats = await getCommodityStats(commodity.id);

  return (
    <>
        <HeroSubSection
          type="commodities"
          tagText="Exportable Commodities"
          title={<>{commodity.name} <span className="text-accent-400"> - {commodity.origin}</span></>}
          description={commodity.description as string}
        />
  
        {/* ── Grid + Filter ────────────────────────────────────────── */}
        <section className="section-padding bg-white">
            <CommodityDetailClient commodity={commodity} stats={stats} />
        </section>
    </>
  );
}