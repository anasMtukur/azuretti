import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { theme } from "@/config/theme";

const db = getDb();

export const metadata = { title: "Commodities – Admin" };

type Category = keyof typeof theme.commodityColors;

export default async function AdminCommoditiesPage() {
  await requireRole(["admin"]);
  const allCommodities = await db
    .select()
    .from(commodities)
    .orderBy(commodities.sortOrder);

  const grouped = allCommodities.reduce<Record<string, typeof allCommodities>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Commodities</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{allCommodities.length} products in catalogue</p>
        </div>
        <Link href="/admin/commodities/new" className="btn-primary text-sm px-4 py-2">
          <Plus className="h-4 w-4" />
          Add Commodity
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["pulses", "grains", "seeds", "nuts"] as Category[]).map((cat) => {
          const colors = theme.commodityColors[cat];
          const catItems = grouped[cat] ?? [];
          return (
            <div
              key={cat}
              className="p-4 rounded-xl border border-border bg-white"
              style={{ borderLeftColor: colors.dot, borderLeftWidth: 3 }}
            >
              <p className="text-xl font-display font-bold" style={{ color: colors.text }}>
                {catItems.length}
              </p>
              <p className="text-xs text-neutral-500 capitalize mt-0.5">{cat}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Min Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {allCommodities.map((c) => {
                const colors = theme.commodityColors[c.category as Category] ?? theme.commodityColors.default;
                return (
                  <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{c.name}</p>
                      <p className="text-xs text-neutral-400">{c.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: colors.dot }} />
                        <span className="text-xs font-medium capitalize" style={{ color: colors.text }}>
                          {c.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.minOrderQtyMt ? `${c.minOrderQtyMt} MT` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                        {c.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {formatDate(c.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/commodities/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
