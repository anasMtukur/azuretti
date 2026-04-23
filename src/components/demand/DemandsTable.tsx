"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { DEMAND_STATUS_META } from "@/lib/demands";
import { formatDate } from "@/lib/utils";

interface Demand {
  id: string;
  demandRef: string;
  commodityName?: string | null;
  commodityCategory?: string | null;
  quantityMt: string | number;
  deliveryCountry?: string | null;
  status: string;
  createdAt: Date | string;
}

interface Props {
  demands: Demand[];
  isAdmin?: boolean;
}

export default function DemandsTable({ demands, isAdmin = false }: Props) {
  const basePath = isAdmin ? "/admin/demands" : "/portal/buyer/demands";

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              {["Ref", "Commodity", "Qty (MT)", "Destination", "Status", "Date", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border bg-white">
            {demands.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <Package className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-500">No demands yet</p>
                  <p className="text-xs text-neutral-400 mt-1 mb-4">
                    Place a demand to source commodities.
                  </p>

                  {!isAdmin && (
                    <Link
                      href="/portal/buyer/demands/new"
                      className="btn-primary text-xs px-4 py-2"
                    >
                      Place your first demand
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              demands.map((d) => {
                const meta =
                  DEMAND_STATUS_META[d.status] ?? DEMAND_STATUS_META.submitted;

                const href = `${basePath}/${d.id}`;

                return (
                  <tr
                    key={d.id}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = href)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-neutral-800">
                        {d.demandRef}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">
                        {d.commodityName ?? "—"}
                      </p>
                      <p className="text-xs text-neutral-400 capitalize">
                        {d.commodityCategory}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-mono text-sm text-neutral-700">
                      {parseFloat(String(d.quantityMt)).toFixed(3)}
                    </td>

                    <td className="px-4 py-3 text-xs text-neutral-600">
                      {d.deliveryCountry ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: meta.dot }}
                        />
                        {meta.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {formatDate(d.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={href}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}