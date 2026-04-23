"use client";

/**
 * src/components/admin/ReceiptItemDocumentsPanel.tsx
 *
 * Admin panel attached to each warehouse receipt item.
 * Allows uploading PDFs (test results, certificates of analysis, etc.)
 * and toggling buyer visibility per document.
 *
 * Upload flow (same as ShipmentDocumentsPanel):
 *   1. POST /api/warehouse/receipt-items/[itemId]/upload-url  → presigned PUT URL
 *   2. PUT file directly to MinIO
 *   3. POST /api/warehouse/receipt-items/[itemId]/documents   → register in DB
 */

import { useState, useRef } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Upload, FileText, Loader2, CheckCircle2,
  Plus, X, Eye, EyeOff, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReceiptItemDoc {
  id:             string;
  docType:        string;
  customLabel:    string | null;
  fileUrl:        string;
  fileName:       string;
  fileSizeBytes:  number | null;
  visibleToBuyer: boolean;
  createdAt:      Date | string;
}

interface Props {
  receiptItemId: string;
  initialDocs:   ReceiptItemDoc[];
}

const DOC_TYPES = [
  { value: "test_result",              label: "Test Result" },
  { value: "certificate_of_analysis",  label: "Certificate of Analysis" },
  { value: "phytosanitary",            label: "Phytosanitary Certificate" },
  { value: "certificate_of_origin",    label: "Certificate of Origin" },
  { value: "moisture_report",          label: "Moisture Report" },
  { value: "other",                    label: "Other" },
] as const;

type DocTypeValue = typeof DOC_TYPES[number]["value"];

interface Pending {
  docType:    DocTypeValue | "";
  customLabel:string;
  file:       File | null;
}

const EMPTY: Pending = { docType: "", customLabel: "", file: null };

function fmtBytes(b: number | null) {
  if (!b) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const DOC_TYPE_LABELS = Object.fromEntries(DOC_TYPES.map(t => [t.value, t.label]));

// ── Component ──────────────────────────────────────────────────────────────

export function ReceiptItemDocumentsPanel({ receiptItemId, initialDocs }: Props) {
  const { success, error } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs]           = useState<ReceiptItemDoc[]>(initialDocs);
  const [pending, setPending]     = useState<Pending>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [togglingId, setToggling] = useState<string | null>(null);

  const isOther  = pending.docType === "other";
  const canUpload = !!pending.file && !!pending.docType &&
    (pending.docType !== "other" || !!pending.customLabel.trim()) && !uploading;

  async function handleUpload() {
    if (!pending.file || !pending.docType) return;
    setUploading(true);
    try {
      // Step 1 — get presigned PUT URL
      const urlRes = await fetch(
        `/api/warehouse/receipt-items/${receiptItemId}/upload-url`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            fileName:    pending.file.name,
            contentType: pending.file.type || "application/pdf",
          }),
        }
      );
      if (!urlRes.ok) throw new Error((await urlRes.json()).error ?? "Failed to get upload URL");
      const { uploadUrl, publicUrl, contentType } = await urlRes.json();

      // Step 2 — PUT directly to MinIO
      const putRes = await fetch(uploadUrl, {
        method:  "PUT",
        headers: { "Content-Type": contentType },
        body:    pending.file,
      });
      if (!putRes.ok) {
        const text = await putRes.text();
        const code = text.match(/<Code>(.+?)<\/Code>/)?.[1];
        throw new Error(code ? `MinIO error: ${code}` : `Upload failed (${putRes.status})`);
      }

      // Step 3 — register in DB
      const regRes = await fetch(
        `/api/warehouse/receipt-items/${receiptItemId}/documents`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            docType:       pending.docType,
            customLabel:   pending.customLabel.trim() || undefined,
            fileUrl:       publicUrl,
            fileName:      pending.file.name,
            fileSizeBytes: pending.file.size,
          }),
        }
      );
      if (!regRes.ok) throw new Error((await regRes.json()).error ?? "Failed to register document");
      const { id } = await regRes.json();

      setDocs(prev => [...prev, {
        id,
        docType:        pending.docType as string,
        customLabel:    pending.customLabel.trim() || null,
        fileUrl:        publicUrl,
        fileName:       pending.file!.name,
        fileSizeBytes:  pending.file!.size,
        visibleToBuyer: false,
        createdAt:      new Date(),
      }]);

      success("Document uploaded", DOC_TYPE_LABELS[pending.docType as DocTypeValue] ?? "Document");
      setPending(EMPTY);
      setShowForm(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      error("Upload failed", err.message ?? "Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function toggleVisibility(docId: string, current: boolean) {
    setToggling(docId);
    try {
      const res = await fetch(
        `/api/warehouse/receipt-items/${receiptItemId}/documents/${docId}`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ visibleToBuyer: !current }),
        }
      );
      if (res.ok) {
        setDocs(prev => prev.map(d => d.id === docId ? { ...d, visibleToBuyer: !current } : d));
        success(!current ? "Now visible to buyers" : "Hidden from buyers", "");
      } else {
        error("Update failed", "");
      }
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing docs */}
      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map((doc) => {
            const label = doc.docType === "other"
              ? (doc.customLabel ?? "Other")
              : (DOC_TYPE_LABELS[doc.docType as DocTypeValue] ?? doc.docType);
            return (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-xs",
                  doc.visibleToBuyer
                    ? "border-green-200 bg-green-50"
                    : "border-border bg-white"
                )}
              >
                <FileText className={cn(
                  "h-4 w-4 shrink-0",
                  doc.visibleToBuyer ? "text-green-600" : "text-neutral-400"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{label}</p>
                  <p className="text-neutral-400 truncate">
                    {doc.fileName}{doc.fileSizeBytes ? ` · ${fmtBytes(doc.fileSizeBytes)}` : ""}
                  </p>
                </div>
                {/* Buyer visibility toggle */}
                <button
                  type="button"
                  disabled={togglingId === doc.id}
                  onClick={() => toggleVisibility(doc.id, doc.visibleToBuyer)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors shrink-0",
                    doc.visibleToBuyer
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                  title={doc.visibleToBuyer ? "Click to hide from buyer" : "Click to show to buyer"}
                >
                  {togglingId === doc.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : doc.visibleToBuyer ? (
                    <><Eye className="h-3 w-3" /> Visible</>
                  ) : (
                    <><EyeOff className="h-3 w-3" /> Hidden</>
                  )}
                </button>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload form / button */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add document
        </button>
      ) : (
        <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-neutral-800">Upload Document</p>
            <button type="button" onClick={() => { setShowForm(false); setPending(EMPTY); }}
              className="text-neutral-400 hover:text-neutral-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-xs">Type <span className="text-error">*</span></label>
              <select
                className="input py-1.5 text-xs bg-white"
                value={pending.docType}
                onChange={(e) => setPending(p => ({ ...p, docType: e.target.value as DocTypeValue, customLabel: "" }))}
                defaultValue=""
              >
                <option value="" disabled>Select type</option>
                {DOC_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {isOther && (
              <div>
                <label className="label text-xs">Label <span className="text-error">*</span></label>
                <input
                  type="text"
                  className="input py-1.5 text-xs"
                  placeholder="Document name"
                  value={pending.customLabel}
                  onChange={(e) => setPending(p => ({ ...p, customLabel: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* File picker */}
          <div
            className={cn(
              "flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer text-xs transition-colors",
              pending.file
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-border hover:border-primary-300 text-neutral-500"
            )}
            onClick={() => fileRef.current?.click()}
          >
            {pending.file ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="truncate font-medium">{pending.file.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPending(p => ({ ...p, file: null })); if (fileRef.current) fileRef.current.value = ""; }}
                  className="shrink-0 text-green-600 hover:text-green-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 shrink-0 text-neutral-400" />
                Click to select PDF
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPending(p => ({ ...p, file: f })); }}
            />
          </div>

          <button
            type="button"
            disabled={!canUpload}
            onClick={handleUpload}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold transition-all",
              canUpload
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            )}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
}