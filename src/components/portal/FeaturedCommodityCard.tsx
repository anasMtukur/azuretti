import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { theme } from "@/config/theme";
import { WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";

type Category = keyof typeof theme.commodityColors;

interface StockEntry {
  location:    string;
  remainingMt: number;
}

interface Commodity {
  id:            string;
  name:          string;
  slug:          string;
  category:      string;
  description:   string | null;
  minOrderQtyMt: string | null;
  grades:        unknown;
  certifications:unknown;
  stock:         StockEntry[];
  totalStockMt:  number;
  hasStock:      boolean;
}

interface Props {
  commodity: Commodity;
}

export function FeaturedCommodityCard({ commodity }: Props) {
  const colors  = theme.commodityColors[commodity.category as Category] ?? theme.commodityColors.default;
  const grades  = Array.isArray(commodity.grades)        ? commodity.grades        as string[] : [];
  const certs   = Array.isArray(commodity.certifications) ? commodity.certifications as string[] : [];

  return (
    <Link
      href={`/portal/buyer/commodity/${commodity.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Category stripe + stock badge */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border" style={{ background: colors.bg }}>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: colors.dot }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.text }}>
            {commodity.category}
          </span>
        </div>
        {commodity.hasStock ? (
          <div className="flex items-center gap-1 text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">In Stock</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-neutral-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Quote basis</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Name */}
        <h3 className="font-display font-bold text-lg text-neutral-900 group-hover:text-primary-700 transition-colors mb-2 leading-snug">
          {commodity.name}
        </h3>

        {/* Description */}
        {commodity.description && (
          <p className="text-xs text-neutral-500 leading-relaxed mb-4 line-clamp-2">
            {commodity.description}
          </p>
        )}

        {/* Live stock breakdown */}
        {commodity.hasStock ? (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
            <p className="text-xs font-semibold text-green-800 mb-2">Live Stock Available</p>
            <div className="space-y-1.5">
              {commodity.stock.filter(s => s.remainingMt > 0).map((s) => (
                <div key={s.location} className="flex items-center justify-between">
                  <span className="text-xs text-green-700">
                    {WAREHOUSE_LOCATION_LABELS[s.location] ?? s.location}
                  </span>
                  <span className="text-xs font-bold text-green-800 font-mono">
                    {s.remainingMt.toFixed(2)} MT
                  </span>
                </div>
              ))}
              <div className="pt-1.5 mt-1.5 border-t border-green-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-green-800">Total available</span>
                <span className="text-sm font-bold text-green-800 font-mono">
                  {commodity.totalStockMt.toFixed(2)} MT
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-lg bg-neutral-50 border border-border">
            <p className="text-xs text-neutral-500">
              No current stock — place a demand and we'll source to your specification.
            </p>
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-xs text-neutral-500 mb-4">
          {commodity.minOrderQtyMt && (
            <div className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              Min order: <span className="font-semibold text-neutral-700">{commodity.minOrderQtyMt} MT</span>
            </div>
          )}
          {grades.length > 0 && (
            <div className="flex items-center gap-1">
              <span>Grades: <span className="font-semibold text-neutral-700">{grades.length}</span></span>
            </div>
          )}
          {certs.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
              <span className="font-semibold text-primary-600">{certs.length} certs</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-neutral-400">Origin: Nigeria 🇳🇬</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 group-hover:text-primary-800 transition-colors">
            View details
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
