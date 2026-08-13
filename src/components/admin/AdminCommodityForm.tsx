"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Save, Plus, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name:             z.string().min(2, "Name required"),
  slug:             z.string().min(2, "Slug required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  category:         z.enum(["pulses", "grains", "seeds", "nuts", "other"]),
  description:      z.string().optional(),
  origin:           z.string().default("Nigeria"),
  minOrderQtyMt:    z.string().optional(),
  isActive:         z.boolean().default(true),
  sortOrder:        z.number().int().default(0),
  factSheetUrl:     z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

interface AdminCommodityFormProps {
  commodity?: {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    origin: string | null;
    grades: unknown;
    packagingOptions: unknown;
    minOrderQtyMt: string | null;
    certifications: unknown;
    factSheetUrl: string | null;
    isActive: boolean;
    sortOrder: number | null;
  } | null;
}

export function AdminCommodityForm({ commodity }: AdminCommodityFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const isNew = !commodity;

  const [grades, setGrades]           = useState<string[]>(
    Array.isArray(commodity?.grades) ? commodity.grades as string[] : []
  );
  const [packaging, setPackaging]     = useState<string[]>(
    Array.isArray(commodity?.packagingOptions) ? commodity.packagingOptions as string[] : []
  );
  const [certs, setCerts]             = useState<string[]>(
    Array.isArray(commodity?.certifications) ? commodity.certifications as string[] : []
  );
  const [gradeInput, setGradeInput]       = useState("");
  const [packagingInput, setPackagingInput] = useState("");
  const [certInput, setCertInput]         = useState("");

  const [factSheetFile, setFactSheetFile] = useState<File | null>(null);
  const [factSheetUploading, setFactSheetUploading] = useState(false);
  const [factSheetUrl, setFactSheetUrl] = useState<string>(commodity?.factSheetUrl ?? "");

  async function uploadFactSheet(file: File) {
    setFactSheetUploading(true);
    try {
      const res = await fetch("/api/admin/commodities/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const { uploadUrl, fileUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: file });
      setFactSheetUrl(fileUrl);
    } finally {
      setFactSheetUploading(false);
    }
  }

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:          commodity?.name          ?? "",
      slug:          commodity?.slug          ?? "",
      category:      (commodity?.category     ?? "pulses") as FormData["category"],
      description:   commodity?.description   ?? "",
      origin:        commodity?.origin        ?? "Nigeria",
      minOrderQtyMt: commodity?.minOrderQtyMt ?? "",
      isActive:      commodity?.isActive      ?? true,
      sortOrder:     commodity?.sortOrder     ?? 0,
      factSheetUrl:  commodity?.factSheetUrl  ?? "",
    },
  });

  const nameValue = watch("name");

  function handleNameBlur() {
    if (isNew && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }

  function addItem(list: string[], setList: (v: string[]) => void, value: string, clear: () => void) {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      clear();
    }
  }

  function removeItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.filter((i) => i !== item));
  }

  async function onSubmit(data: FormData) {
    const payload = { ...data, grades, packagingOptions: packaging, certifications: certs, factSheetUrl };
    const url    = isNew ? "/api/admin/commodities" : `/api/admin/commodities/${commodity!.id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (res.ok) {
      success(isNew ? "Commodity created" : "Commodity updated", "Changes saved.");
      router.push("/admin/commodities");
      router.refresh();
    } else {
      const json = await res.json();
      error("Save failed", json.error ?? "Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name + Slug */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Name <span className="text-error">*</span></label>
          <input type="text" className={`input ${errors.name ? "border-error" : ""}`}
            {...register("name")} onBlur={handleNameBlur} placeholder="e.g. Sesame Seeds" />
          {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Slug <span className="text-error">*</span></label>
          <input type="text" className={`input font-mono text-sm ${errors.slug ? "border-error" : ""}`}
            {...register("slug")} placeholder="e.g. sesame-seeds" />
          {errors.slug && <p className="mt-1.5 text-xs text-error">{errors.slug.message}</p>}
        </div>
      </div>

      {/* Category + Origin */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className="label">Category <span className="text-error">*</span></label>
          <select className="input bg-white" {...register("category")}>
            <option value="pulses">Pulses</option>
            <option value="grains">Grains</option>
            <option value="seeds">Seeds</option>
            <option value="nuts">Nuts</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Origin</label>
          <input type="text" className="input" {...register("origin")} />
        </div>
        <div>
          <label className="label">Min Order (MT)</label>
          <input type="number" step="0.01" className="input" {...register("minOrderQtyMt")} placeholder="e.g. 5.00" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea rows={4} className="input resize-none" {...register("description")}
          placeholder="Product description for the public catalogue…" />
      </div>

      {/* Tag lists */}
      {[
        { label: "Grades / Specifications", list: grades, setList: setGrades, input: gradeInput, setInput: setGradeInput, placeholder: "e.g. Grade A – Sortex clean" },
        { label: "Packaging Options",        list: packaging, setList: setPackaging, input: packagingInput, setInput: setPackagingInput, placeholder: "e.g. 25 kg polypropylene bags" },
        { label: "Certifications",           list: certs, setList: setCerts, input: certInput, setInput: setCertInput, placeholder: "e.g. Phytosanitary Certificate" },
      ].map(({ label, list, setList, input, setInput, placeholder }) => (
        <div key={label}>
          <label className="label">{label}</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(list, setList, input, () => setInput("")); } }}
              className="input flex-1 text-sm py-2"
              placeholder={placeholder}
            />
            <button type="button" onClick={() => addItem(list, setList, input, () => setInput(""))}
              className="px-3 py-2 rounded bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {list.map((item) => (
              <span key={item} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">
                {item}
                <button type="button" onClick={() => removeItem(list, setList, item)}
                  className="hover:text-error transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Fact Sheet (PDF)</label>

        {factSheetUrl && (
          <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-neutral-50">
            <FileText className="h-4 w-4 text-neutral-400 shrink-0" />
            <a href={factSheetUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary truncate flex-1 hover:underline">
              Current fact sheet
            </a>
            <button type="button" onClick={() => setFactSheetUrl("")}
                    className="text-xs text-red-500 hover:text-red-700">Remove</button>
          </div>
        )}

        <div
          className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById("factsheet-input")?.click()}
        >
          {factSheetUploading ? (
            <p className="text-sm text-neutral-500">Uploading…</p>
          ) : factSheetFile ? (
            <p className="text-sm text-neutral-700">{factSheetFile.name}</p>
          ) : (
            <p className="text-sm text-neutral-400">Click to upload PDF</p>
          )}
          <input
            id="factsheet-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setFactSheetFile(file); uploadFactSheet(file); }
            }}
          />
        </div>

        {/* Pass the resolved URL to your form submit */}
        <input type="hidden" name="factSheetUrl" value={factSheetUrl} />
      </div>

      {/* Sort order + Active */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="label">Sort Order</label>
          <input type="number" className="input" {...register("sortOrder", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Visibility</label>
          <select className="input bg-white" {...register("isActive", { setValueAs: (v) => v === "true" || v === true })}>
            <option value="true">Active (visible)</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button type="submit" disabled={isSubmitting} className="btn-primary text-sm px-5 py-2.5">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Create commodity" : "Save changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost text-sm px-4 py-2.5">
          Cancel
        </button>
      </div>
    </form>
  );
}