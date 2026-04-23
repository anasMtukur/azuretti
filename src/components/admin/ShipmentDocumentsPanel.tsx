"use client";

/**
 * src/components/admin/ShipmentDocumentsPanel.tsx
 *
 * Upload flow (all internal — no onUploadFile prop needed):
 *
 *   1. Component calls POST /api/admin/shipments/[id]/upload-url
 *      to get a presigned MinIO PUT URL + the contentType to send.
 *
 *   2. Component PUTs the file directly to MinIO.
 *      IMPORTANT: only Content-Type is set — no x-amz-* headers.
 *      The presigned URL was signed for `host` only; sending extra
 *      signed headers would cause a MissingFields error from MinIO.
 *
 *   3. Component calls POST /api/admin/shipments/[id]/documents
 *      to register the document in the DB with the returned publicUrl.
 */

import { useState, useRef } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { SHIPMENT_DOC_TYPES, DOC_TYPE_LABELS } from "@/lib/payments";
import {
  Upload, FileText, Loader2,
  CheckCircle2, ExternalLink, Plus, X,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfirm } from "../providers/ConfirmProvider";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ShipmentDoc {
  id:            string;
  docType:       string;
  customLabel:   string | null;
  fileUrl:       string;
  fileName:      string;
  fileSizeBytes: number | null;
  versionNote:   string | null;
  createdAt:     Date | string;
}

interface PendingUpload {
  docType:     string;
  customLabel: string;
  versionNote: string;
  file:        File | null;
}

interface Props {
  shipmentId:  string;
  initialDocs: ShipmentDoc[];
}

const EMPTY_PENDING: PendingUpload = {
  docType: "", customLabel: "", versionNote: "", file: null,
};

function fmtBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Component ──────────────────────────────────────────────────────────────

export function ShipmentDocumentsPanel({ shipmentId, initialDocs }: Props) {
  const { success, error } = useToast();
  const confirm = useConfirm();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs]           = useState<ShipmentDoc[]>(initialDocs);
  const [pending, setPending]     = useState<PendingUpload>(EMPTY_PENDING);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm]   = useState(false);

  const isOther  = pending.docType === "other";
  const hasFile  = !!pending.file;
  const hasType  = !!pending.docType && (pending.docType !== "other" || !!pending.customLabel.trim());
  const canUpload = hasFile && hasType && !uploading;

  function docLabel(doc: ShipmentDoc): string {
    if (doc.docType === "other") return doc.customLabel ?? "Other Document";
    return SHIPMENT_DOC_TYPES[doc.docType]?.label ?? doc.docType;
  }

  async function handleUpload() {
    if (!pending.file || !pending.docType) return;
    setUploading(true);

    try {
      // ── Step 1: Get presigned PUT URL from our API ──────────
      const urlRes = await fetch(
        `/api/admin/shipments/${shipmentId}/upload-url`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName:    pending.file.name,
            contentType: pending.file.type || "application/pdf",
          }),
        }
      );

      if (!urlRes.ok) {
        const json = await urlRes.json();
        throw new Error(json.error ?? "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl, contentType } = await urlRes.json();

      // ── Step 2: PUT file directly to MinIO ──────────────────
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": pending.file.type || "application/pdf",
        },
        body: pending.file,
      });

      if (!putRes.ok) {
        const text = await putRes.text();
        console.error( text );
        // Extract MinIO error code from XML for a cleaner message
        const codeMatch = text.match(/<Code>(.+?)<\/Code>/);
        throw new Error(
          codeMatch ? `MinIO error: ${codeMatch[1]}` : `Upload failed (${putRes.status})`
        );
      }

      // ── Step 3: Register document in the DB ────────────────
      const regRes = await fetch(
        `/api/admin/shipments/${shipmentId}/documents`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docType:       pending.docType,
            customLabel:   pending.customLabel || undefined,
            fileUrl:       publicUrl,
            fileName:      pending.file.name,
            fileSizeBytes: pending.file.size,
            versionNote:   pending.versionNote.trim() || undefined,
          }),
        }
      );

      if (!regRes.ok) {
        const json = await regRes.json();
        throw new Error(json.error ?? "Failed to register document");
      }

      const { id } = await regRes.json();

      // Optimistic UI update
      setDocs((prev) => [
        ...prev,
        {
          id,
          docType:       pending.docType,
          customLabel:   pending.customLabel?.trim() || null,
          fileUrl:       publicUrl,
          fileName:      pending.file!.name,
          fileSizeBytes: pending.file!.size,
          versionNote:   pending.versionNote.trim() || null,
          createdAt:     new Date(),
        },
      ]);

      success("Document uploaded", docLabel({
        id, docType: pending.docType, customLabel: pending.customLabel,
        fileUrl: publicUrl, fileName: pending.file.name,
        fileSizeBytes: null, versionNote: null, createdAt: new Date(),
      }));

      setPending(EMPTY_PENDING);
      setShowForm(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err: any) {
      console.error( err.message );
      error("Upload failed", err.message ?? "Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    const ok = await confirm({
      title: "Delete document",
      message: "This action cannot be undone.",
      confirmText: "Delete",
    });

    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/shipments/${shipmentId}/documents/${docId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to delete document");
      }

      setDocs((prev) => prev.filter((d) => d.id !== docId));
      success("Document deleted");

    } catch (err: any) {
      error("Delete failed", err.message ?? "Please try again.");
    }
  }

  async function handleDeleteDirect(docId: string) {
    try {
      const res = await fetch(
        `/api/admin/shipments/${shipmentId}/documents/${docId}`, // <-- your DELETE route
        { method: "DELETE" }
      );

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to delete document");
      }

      // Optimistic UI update
      setDocs((prev) => prev.filter((d) => d.id !== docId));

      success("Document deleted");
    } catch (err: any) {
      error("Delete failed", err.message ?? "Please try again.");
    }
  }

  const requiredTypes = DOC_TYPE_LABELS.filter((t) => t.required);
  const uploadedTypes = new Set(docs.map((d) => d.docType));

  return (
    <div className="space-y-5">

      {/* Required document checklist */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {requiredTypes.map(({ value, label }) => {
          const uploaded = uploadedTypes.has(value);
          return (
            <div
              key={value}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border text-xs font-medium",
                uploaded
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-neutral-50 border-border text-neutral-400"
              )}
            >
              {uploaded
                ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                : <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 shrink-0" />}
              {label}
            </div>
          );
        })}
      </div>

      {/* Uploaded docs table */}
      {docs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Document", "File", "Size", "Uploaded", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">{docLabel(doc)}</p>
                        {doc.versionNote && (
                          <p className="text-[11px] text-neutral-400">{doc.versionNote}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600 max-w-[180px] truncate">
                    {doc.fileName}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                    {fmtBytes(doc.fileSizeBytes)}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                    {fmtDate(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3 flex items-center justify-between gap-1">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2Icon className="h-3 w-3 color-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary-300 hover:bg-primary-50 text-sm text-neutral-500 hover:text-primary-700 font-medium transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </button>
      ) : (
        <div className="p-5 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/30 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-800">Upload New Document</p>
            <button
              type="button"
              onClick={() => { setShowForm(false); setPending(EMPTY_PENDING); }}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Document type */}
            <div>
              <label className="label">Document Type <span className="text-error">*</span></label>
              <select
                className="input bg-white"
                value={pending.docType}
                onChange={(e) => setPending((p) => ({ ...p, docType: e.target.value, customLabel: "" }))}
                defaultValue=""
              >
                <option value="" disabled>Select document type</option>
                {DOC_TYPE_LABELS
                  .filter(({ value }) => value === "other" || !uploadedTypes.has(value))
                  .map(({ value, label, required }) => (
                    <option key={value} value={value}>
                      {label}{required ? " *" : ""}
                    </option>
                  ))}
              </select>
            </div>

            {/* Custom label for "other" */}
            {isOther && (
              <div>
                <label className="label">Document Name <span className="text-error">*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Quality Assurance Report"
                  value={pending.customLabel as string}
                  onChange={(e) => setPending((p) => ({ ...p, customLabel: e.target.value }))}
                />
              </div>
            )}

            {/* Version note */}
            <div className={isOther ? "sm:col-span-2" : ""}>
              <label className="label">Version Note <span className="text-neutral-400 font-normal">(optional)</span></label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Corrected BL issued 14 Sep 2025"
                value={pending.versionNote}
                onChange={(e) => setPending((p) => ({ ...p, versionNote: e.target.value }))}
              />
            </div>
          </div>

          {/* File picker */}
          <div>
            <label className="label">PDF File <span className="text-error">*</span></label>
            <div
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-6",
                "rounded-xl border-2 border-dashed transition-colors cursor-pointer",
                pending.file
                  ? "border-green-300 bg-green-50"
                  : "border-border hover:border-primary-300 hover:bg-neutral-50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {pending.file ? (
                <>
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                  <p className="text-sm font-semibold text-green-800">{pending.file.name}</p>
                  <p className="text-xs text-green-600">{fmtBytes(pending.file.size)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPending((p) => ({ ...p, file: null }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white text-green-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-neutral-300" />
                  <p className="text-sm text-neutral-500 font-medium">Click to select a PDF</p>
                  <p className="text-xs text-neutral-400">PDF only · max 20 MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setPending((p) => ({ ...p, file: f }));
                }}
              />
            </div>
          </div>

          {/* Upload button */}
          <button
            type="button"
            disabled={!canUpload}
            onClick={handleUpload}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm transition-all",
              canUpload
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            )}
          >
            {uploading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
              : <><Upload className="h-4 w-4" /> Upload Document</>}
          </button>
        </div>
      )}
    </div>
  );
}
