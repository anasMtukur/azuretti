import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import { commodities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminCommodityForm } from "@/components/admin/AdminCommodityForm";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (params.id === "new") {
    return { title: "New Commodity – Admin" };
  }

  const [commodity] = await db
    .select({ name: commodities.name })
    .from(commodities)
    .where(eq(commodities.id, params.id))
    .limit(1);

  return {
    title: commodity ? `Edit "${commodity.name}" – Admin` : "Commodity Not Found – Admin",
  };
}

export default async function AdminCommodityEditPage({ params }: Props) {
  await requireRole(["admin"]);

  const isNew = params.id === "new";

  let commodity = null;
  
  if (!isNew) {
    const [found] = await db
      .select()
      .from(commodities)
      .where(eq(commodities.id, params.id))
      .limit(1);
    if (!found) notFound();
    commodity = found;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">
          {isNew ? "New Commodity" : `Edit — ${commodity?.name}`}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {isNew ? "Add a new commodity to the catalogue." : "Update commodity details."}
        </p>
      </div>
      <div className="card p-8">
        <AdminCommodityForm commodity={commodity} />
      </div>
    </div>
  );
}
