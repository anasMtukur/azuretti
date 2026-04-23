"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { Plus, Trash2, Loader2, Package, ChevronDown } from "lucide-react";
import { WEIGHT_UNIT_LABELS, WAREHOUSE_LOCATION_LABELS } from "@/lib/warehouse";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
interface Owner       { id: string; name: string | null; email: string; role: string }
interface Commodity   { id: string; name: string; category: string }

interface Props {
  owners:      Owner[];
  commodities: Commodity[];
}

// ── Validation ─────────────────────────────────────────────────────────────
const itemSchema = z.object({
  commodityId:     z.string().uuid("Select a commodity"),
  rawQuantity:     z.number({ invalid_type_error: "Enter a quantity" }).positive("Must be positive"),
  rawUnit:         z.enum(["kg", "lbs", "mt", "sacks"]),
  sacksCount:      z.number().int().positive().optional(),
  avgSackWeightKg: z.number().positive().optional(),
  grade:           z.string().optional(),
  moistureContent: z.number().min(0).max(100).optional(),
  impurityLevel:   z.number().min(0).max(100).optional(),
  inspectionNotes: z.string().optional(),
});

const formSchema = z.object({
  ownerId:           z.string().uuid("Select an owner"),
  warehouseLocation: z.enum(["kano", "abuja", "france", "other"]),
  warehouseName:     z.string().optional(),
  arrivedAt:         z.string().optional(),
  notes:             z.string().optional(),
  items:             z.array(itemSchema).min(1, "Add at least one commodity item"),
});

type FormData = z.infer<typeof formSchema>;

const categoryColors: Record<string, string> = {
  pulses: "bg-green-50 text-green-700",
  grains: "bg-amber-50 text-amber-700",
  seeds:  "bg-blue-50 text-blue-700",
  nuts:   "bg-pink-50 text-pink-700",
  other:  "bg-neutral-100 text-neutral-600",
};

// ── Component ──────────────────────────────────────────────────────────────
export function NewReceiptForm({ owners, commodities }: Props) {
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register, control, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouseLocation: "kano",
      arrivedAt: new Date().toISOString().slice(0, 16),
      items: [{ commodityId: "", rawQuantity: 0, rawUnit: "kg" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  async function onSubmit(data: FormData) {
    console.log(data.arrivedAt);
    const res = await fetch("/api/warehouse/receipts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      success("Receipt logged", `Reference: ${json.receiptRef}`);
      router.push(`/admin/warehouse/receipts/${json.id}`);
    } else {
      const json = await res.json();
      error("Failed to log receipt", json.error ?? "Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Receipt header ─────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display font-semibold text-lg text-neutral-900">Receipt Details</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Owner */}
          <div className="sm:col-span-2">
            <label className="label">Owner (Exporter / Farmer) <span className="text-error">*</span></label>
            <select className={`input bg-white ${errors.ownerId ? "border-error" : ""}`} {...register("ownerId")} defaultValue="">
              <option value="" disabled>Select the owner of these commodities</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name ?? o.email} ({o.role}) — {o.email}
                </option>
              ))}
            </select>
            {errors.ownerId && <p className="mt-1.5 text-xs text-error">{errors.ownerId.message}</p>}
          </div>

          {/* Warehouse location */}
          <div>
            <label className="label">Warehouse Location <span className="text-error">*</span></label>
            <select className="input bg-white" {...register("warehouseLocation")}>
              {Object.entries(WAREHOUSE_LOCATION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Warehouse name / zone */}
          <div>
            <label className="label">Bay / Zone <span className="text-neutral-400 font-normal">(optional)</span></label>
            <input type="text" className="input" placeholder="e.g. Bay 3, Section A" {...register("warehouseName")} />
          </div>

          {/* Arrival date */}
          <div>
            <label className="label">Arrival Date & Time <span className="text-error">*</span></label>
            <input type="datetime-local" className="input" {...register("arrivedAt")} />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Receipt Notes <span className="text-neutral-400 font-normal">(optional)</span></label>
            <input type="text" className="input" placeholder="e.g. Arrived with 3 trucks" {...register("notes")} />
          </div>
        </div>
      </div>

      {/* ── Commodity items ────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-neutral-900">Commodity Items</h2>
          <button
            type="button"
            onClick={() => append({ commodityId: "", rawQuantity: 0, rawUnit: "kg" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
        </div>

        {errors.items?.root && (
          <p className="text-xs text-error">{errors.items.root.message}</p>
        )}

        {fields.map((field, idx) => {
          const item       = watchedItems[idx];
          const isSacks    = item?.rawUnit === "sacks";
          const commodity  = commodities.find(c => c.id === item?.commodityId);

          return (
            <div key={field.id} className="card p-6 space-y-4">
              {/* Item header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                  <span className="font-medium text-sm text-neutral-700">
                    {commodity ? commodity.name : `Item ${idx + 1}`}
                  </span>
                  {commodity && (
                    <span className={cn("badge text-xs capitalize", categoryColors[commodity.category] ?? "bg-neutral-100 text-neutral-600")}>
                      {commodity.category}
                    </span>
                  )}
                </div>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(idx)}
                    className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Commodity select */}
                <div className="lg:col-span-2">
                  <label className="label">Commodity <span className="text-error">*</span></label>
                  <select
                    className={`input bg-white ${errors.items?.[idx]?.commodityId ? "border-error" : ""}`}
                    {...register(`items.${idx}.commodityId`)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select commodity</option>
                    {commodities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.items?.[idx]?.commodityId && (
                    <p className="mt-1.5 text-xs text-error">{errors.items[idx]!.commodityId!.message}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="label">Unit <span className="text-error">*</span></label>
                  <select className="input bg-white" {...register(`items.${idx}.rawUnit`)}>
                    {Object.entries(WEIGHT_UNIT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="label">
                    {isSacks ? "Avg Sack Weight (kg)" : "Quantity"} <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    className={`input ${errors.items?.[idx]?.rawQuantity ? "border-error" : ""}`}
                    placeholder={isSacks ? "e.g. 75" : "e.g. 500"}
                    {...register(`items.${idx}.rawQuantity`, { valueAsNumber: true })}
                  />
                </div>

                {/* Sack count (only when unit = sacks) */}
                {isSacks && (
                  <div>
                    <label className="label">Number of Sacks <span className="text-error">*</span></label>
                    <input
                      type="number"
                      step="1"
                      className="input"
                      placeholder="e.g. 120"
                      {...register(`items.${idx}.sacksCount`, { valueAsNumber: true })}
                    />
                  </div>
                )}
              </div>

              {/* Inspection fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Grade</label>
                  <input type="text" className="input" placeholder="e.g. Grade A, FAQ" {...register(`items.${idx}.grade`)} />
                </div>
                <div>
                  <label className="label">Moisture Content (%)</label>
                  <input type="number" step="0.1" min="0" max="100" className="input"
                    placeholder="e.g. 10.5" {...register(`items.${idx}.moistureContent`, { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="label">Impurity Level (%)</label>
                  <input type="number" step="0.1" min="0" max="100" className="input"
                    placeholder="e.g. 2.0" {...register(`items.${idx}.impurityLevel`, { valueAsNumber: true })} />
                </div>
              </div>

              <div>
                <label className="label">Inspection Notes</label>
                <input type="text" className="input" placeholder="Any observations about this batch…"
                  {...register(`items.${idx}.inspectionNotes`)} />
              </div>
            </div>
          );
        })}

        {/* Add another item */}
        <button
          type="button"
          onClick={() => append({ commodityId: "", rawQuantity: 0, rawUnit: "kg" })}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-primary-300 hover:bg-primary-50 text-sm text-neutral-500 hover:text-primary-700 font-medium transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add another commodity item
        </button>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Logging receipt…</>
          ) : (
            <><Package className="h-4 w-4" /> Log Receipt</>
          )}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost px-6 py-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
