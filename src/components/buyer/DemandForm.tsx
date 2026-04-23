"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import {
  CONTAINER_SIZES, INCOTERMS, PACKAGING_TYPES,
} from "@/lib/demands";
import {
  Loader2, Package, Ship, MapPin, Calendar,
  Info, ArrowRight, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────
interface CommodityOption {
  id:            string;
  name:          string;
  category:      string;
  slug:          string;
  minOrderQtyMt: string | null;
}

interface Props {
  commodities:             CommodityOption[];
  preselectedCommodityId?: string;
  isRfq?:                  boolean;
}

// ── Schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  commodityId:         z.string().uuid("Select a commodity"),
  quantityMt:          z.number({ invalid_type_error: "Enter a quantity" }).positive("Must be positive"),
  packagingType:       z.string().optional(),
  containerSize:       z.string().optional(),
  preferredIncoterm:   z.string().optional(),
  deliveryPort:        z.string().optional(),
  deliveryCountry:     z.string().min(2, "Country is required"),
  preferredGrade:      z.string().optional(),
  targetPricePerMt:    z.number().positive().optional(),
  targetPriceCurrency: z.string().default("EUR"),
  timelineFrom:        z.string().optional(),
  timelineTo:          z.string().optional(),
  specialRequirements: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const categoryColors: Record<string, string> = {
  pulses: "bg-green-50 text-green-700",
  grains: "bg-amber-50 text-amber-700",
  seeds:  "bg-blue-50 text-blue-700",
  nuts:   "bg-pink-50 text-pink-700",
};

// ── Component ─────────────────────────────────────────────────────────────
export function DemandForm({
  commodities,
  preselectedCommodityId,
  isRfq = false,
}: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const [commoditySearch, setCommoditySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    register, handleSubmit, control, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      commodityId:         preselectedCommodityId ?? "",
      targetPriceCurrency: "EUR",
    },
  });

  const watchedCommodityId = watch("commodityId");
  const watchedQty         = watch("quantityMt");
  const watchedPrice       = watch("targetPricePerMt");

  const selectedCommodity = commodities.find((c) => c.id === watchedCommodityId);
  const filteredCommodities = commodities.filter((c) =>
    c.name.toLowerCase().includes(commoditySearch.toLowerCase())
  );

  const estimatedTotal =
    watchedQty && watchedPrice
      ? (watchedQty * watchedPrice).toLocaleString("en-EU", {
          style: "currency", currency: "EUR", maximumFractionDigits: 0,
        })
      : null;

  async function onSubmit(data: FormData) {
    const endpoint = isRfq ? "/api/buyer/rfq" : "/api/buyer/demands";
    const res = await fetch(endpoint, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      success(
        isRfq ? "Quote request submitted" : "Demand placed",
        `Reference: ${json.demandRef}`
      );
      router.push(isRfq ? `/portal/buyer/rfq/${json.id}` : `/portal/buyer/demands/${json.id}`);
    } else {
      const json = await res.json();
      error("Submission failed", json.error ?? "Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>

      {/* RFQ info banner */}
      {isRfq && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">This is an enquiry, not an order</p>
            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
              You're requesting a price quote from Azuretti. Once you receive and accept the
              quote, it becomes a confirmed demand. No commitment is made until you accept.
            </p>
          </div>
        </div>
      )}

      {/* ── Section 1: Commodity ────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          <h2 className="font-display font-semibold text-lg text-neutral-900">Commodity</h2>
        </div>

        {/* Commodity selector */}
        <div>
          <label className="label">Commodity <span className="text-error">*</span></label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "w-full input text-left flex items-center justify-between",
                errors.commodityId ? "border-error" : ""
              )}
            >
              {selectedCommodity ? (
                <span className="flex items-center gap-2">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium capitalize", categoryColors[selectedCommodity.category] ?? "bg-neutral-100 text-neutral-600")}>
                    {selectedCommodity.category}
                  </span>
                  {selectedCommodity.name}
                </span>
              ) : (
                <span className="text-neutral-400">Select a commodity…</span>
              )}
              <ChevronDown className={cn("h-4 w-4 text-neutral-400 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-border shadow-xl overflow-hidden animate-scale-in">
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    placeholder="Search commodities…"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary-500"
                    value={commoditySearch}
                    onChange={(e) => setCommoditySearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredCommodities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setValue("commodityId", c.id, { shouldValidate: true });
                        setDropdownOpen(false);
                        setCommoditySearch("");
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-neutral-50 transition-colors text-left",
                        watchedCommodityId === c.id && "bg-primary-50 text-primary-800"
                      )}
                    >
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold capitalize", categoryColors[c.category] ?? "bg-neutral-100 text-neutral-600")}>
                        {c.category}
                      </span>
                      <span className="font-medium">{c.name}</span>
                      {c.minOrderQtyMt && (
                        <span className="ml-auto text-xs text-neutral-400">min {c.minOrderQtyMt} MT</span>
                      )}
                    </button>
                  ))}
                  {filteredCommodities.length === 0 && (
                    <p className="px-3 py-3 text-sm text-neutral-400 text-center">No results</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <input type="hidden" {...register("commodityId")} />
          {errors.commodityId && <p className="mt-1.5 text-xs text-error">{errors.commodityId.message}</p>}

          {selectedCommodity?.minOrderQtyMt && (
            <p className="mt-1.5 text-xs text-neutral-400 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Minimum order: {selectedCommodity.minOrderQtyMt} MT
            </p>
          )}
        </div>
      </div>

      {/* ── Section 2: Quantity & Packaging ────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">2</span>
          </div>
          <h2 className="font-display font-semibold text-lg text-neutral-900">Quantity & Packaging</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Quantity (MT) <span className="text-error">*</span></label>
            <input
              type="number"
              step="0.001"
              className={`input ${errors.quantityMt ? "border-error" : ""}`}
              placeholder="e.g. 25.000"
              {...register("quantityMt", { valueAsNumber: true })}
            />
            {errors.quantityMt && <p className="mt-1.5 text-xs text-error">{errors.quantityMt.message}</p>}
          </div>

          <div>
            <label className="label">Packaging Type</label>
            <select className="input bg-white" {...register("packagingType")} defaultValue="">
              <option value="">Any / not specified</option>
              {PACKAGING_TYPES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Preferred Container</label>
            <select className="input bg-white" {...register("containerSize")} defaultValue="">
              <option value="">Any / not specified</option>
              {CONTAINER_SIZES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Preferred Grade / Specification</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Grade A – Sortex clean, ≤10% moisture"
            {...register("preferredGrade")}
          />
        </div>
      </div>

      {/* ── Section 3: Shipping Preferences ────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Shipping & Delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Preferred Incoterm</label>
            <select className="input bg-white" {...register("preferredIncoterm")} defaultValue="">
              <option value="">Any / not specified</option>
              {INCOTERMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Destination Country <span className="text-error">*</span>
            </label>
            <input
              type="text"
              className={`input ${errors.deliveryCountry ? "border-error" : ""}`}
              placeholder="e.g. France"
              {...register("deliveryCountry")}
            />
            {errors.deliveryCountry && (
              <p className="mt-1.5 text-xs text-error">{errors.deliveryCountry.message}</p>
            )}
          </div>

          <div>
            <label className="label">Destination Port / City</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Le Havre"
              {...register("deliveryPort")}
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Pricing & Timeline ─────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">4</span>
          </div>
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            {isRfq ? "Timeline" : "Target Price & Timeline"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Required from</label>
            <input type="date" className="input" {...register("timelineFrom")} />
          </div>
          <div>
            <label className="label">Required by</label>
            <input type="date" className="input" {...register("timelineTo")} />
          </div>
        </div>

        {/* Target price — hidden for RFQ */}
        {!isRfq && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Target Price per MT (optional)</label>
              <div className="flex gap-2">
                <select
                  className="input bg-white w-24 shrink-0"
                  {...register("targetPriceCurrency")}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  className="input flex-1"
                  placeholder="e.g. 1 200"
                  {...register("targetPricePerMt", { valueAsNumber: true })}
                />
              </div>
              <p className="mt-1.5 text-xs text-neutral-400">
                Indicate your budget. This is not binding.
              </p>
            </div>

            {/* Live estimated total */}
            {estimatedTotal && (
              <div className="flex items-center">
                <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 w-full">
                  <p className="text-xs text-primary-700 font-medium">Estimated total</p>
                  <p className="text-2xl font-display font-bold text-primary-800 mt-1">
                    {estimatedTotal}
                  </p>
                  <p className="text-xs text-primary-600 mt-0.5">
                    {watchedQty?.toFixed(3)} MT × {watchedPrice?.toLocaleString()} /MT
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 5: Special Requirements ────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">5</span>
          </div>
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Special Requirements
          </h2>
        </div>
        <textarea
          rows={3}
          className="input resize-none"
          placeholder="Any additional specifications, certification requirements, labelling instructions, or other details the trade team should know…"
          {...register("specialRequirements")}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : isRfq ? (
            <>Request Quote <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>Place Demand <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost px-6 py-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
