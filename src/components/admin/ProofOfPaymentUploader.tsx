"use client";

/**
 * src/components/admin/ProofOfPaymentUploader.tsx
 *
 * Reusable proof-of-payment file picker used by both:
 *   - PaymentConfirmForm   (buyer payment confirmation)
 *   - SettlementAction     (exporter settlement confirmation)
 *
 * Accepted file types: JPEG, PNG, PDF (max 10 MB)
 *
 * Upload flow:
 *   1. POST  {uploadUrlEndpoint}  → { uploadUrl, publicUrl, contentType }
 *   2. PUT   uploadUrl  (file body, Content-Type header only — no x-amz-* headers)
 *   3. Calls onUploaded(publicUrl) so the parent can include it in its POST body
 *
 * The component manages its own upload state; the parent only needs to
 * store the returned URL.
 */

import { useState, useRef } from "react";
import {
  Upload, CheckCircle2, X, Loader2,
  FileImage, FileText, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface Props {
  /**
   * API route that returns { uploadUrl, publicUrl, contentType }.
   * Must be a POST endpoint that accepts { fileName, contentType }.
   * Examples:
   *   /api/admin/payments/upload-url
   *   /api/admin/settlements/upload-url
   */
  uploadUrlEndpoint: string;
  /** Called with the final public URL once the upload succeeds */
  onUploaded:        (publicUrl: string) => void;
  /** Called if the user removes an already-uploaded file */
  onCleared?:        () => void;
  /** Optional — pre-fill if editing an existing record */
  existingUrl?:      string | null;
  /** Label shown above the drop zone */
  label?:            string;
}

const ACCEPTED_TYPES: Record<string, string> = {
  "image/jpeg":      "JPEG",
  "image/png":       "PNG",
  "application/pdf": "PDF",
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fileIcon(type: string) {
  if (type === "application/pdf") return <FileText className="h-5 w-5" />;
  return <FileImage className="h-5 w-5" />;
}

function fmtBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function ProofOfPaymentUploader({
  uploadUrlEndpoint,
  onUploaded,
  onCleared,
  existingUrl,
  label = "Proof of Payment",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile]         = useState<File | null>(null);
  const [uploadedUrl, setUploaded] = useState<string | null>(existingUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateFile(f: File): string | null {
    if (!ACCEPTED_TYPES[f.type]) {
      return `Unsupported file type. Please upload a JPEG, PNG or PDF.`;
    }
    if (f.size > MAX_BYTES) {
      return `File is too large (${fmtBytes(f.size)}). Maximum is 10 MB.`;
    }
    return null;
  }

  async function handleFileSelect(f: File) {
    const err = validateFile(f);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setFile(f);
    await upload(f);
  }

  async function upload(f: File) {
    setUploading(true);
    try {
      // Step 1 — get presigned PUT URL
      const urlRes = await fetch(uploadUrlEndpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fileName: f.name, contentType: f.type }),
      });
      if (!urlRes.ok) {
        const json = await urlRes.json();
        throw new Error(json.error ?? "Failed to get upload URL");
      }
      const { uploadUrl, publicUrl, contentType } = await urlRes.json();

      // Step 2 — PUT directly to MinIO (Content-Type only — no x-amz-* headers)
      const putRes = await fetch(uploadUrl, {
        method:  "PUT",
        headers: { "Content-Type": contentType },
        body:    f,
      });
      if (!putRes.ok) {
        const text  = await putRes.text();
        const code  = text.match(/<Code>(.+?)<\/Code>/)?.[1];
        throw new Error(code ? `Storage error: ${code}` : `Upload failed (${putRes.status})`);
      }

      // Step 3 — notify parent
      setUploaded(publicUrl);
      onUploaded(publicUrl);
    } catch (err: any) {
      setValidationError(err.message ?? "Upload failed. Please try again.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setFile(null);
    setUploaded(null);
    setValidationError(null);
    if (fileRef.current) fileRef.current.value = "";
    onCleared?.();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }

  // ── Uploaded state ─────────────────────────────────────────
  if (uploadedUrl && !uploading) {
    const displayName = file?.name ?? uploadedUrl.split("/").pop() ?? "Uploaded file";
    const fileType    = file?.type ?? (uploadedUrl.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
    return (
      <div>
        <label className="label">{label}</label>
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
            {fileIcon(fileType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-900 truncate">{displayName}</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-900 underline"
            >
              View uploaded file ↗
            </a>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <button
              type="button"
              onClick={clear}
              className="p-1 rounded hover:bg-emerald-200 text-emerald-600 hover:text-emerald-800 transition-colors"
              title="Remove and upload a different file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Drop zone ──────────────────────────────────────────────
  return (
    <div>
      <label className="label">
        {label}{" "}
        <span className="text-neutral-400 font-normal">(optional)</span>
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2.5 p-6 rounded-xl",
          "border-2 border-dashed cursor-pointer transition-colors text-center",
          uploading
            ? "border-primary-200 bg-primary-50 cursor-wait"
            : validationError
            ? "border-error bg-red-50"
            : "border-border hover:border-primary-300 hover:bg-neutral-50"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-7 w-7 text-primary-400 animate-spin" />
            <p className="text-sm text-primary-600 font-medium">Uploading…</p>
          </>
        ) : validationError ? (
          <>
            <AlertCircle className="h-7 w-7 text-error" />
            <p className="text-sm text-error font-medium">{validationError}</p>
            <p className="text-xs text-neutral-400">Click to try a different file</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-neutral-300">
              <FileImage className="h-6 w-6" />
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">
                Click or drag & drop to upload
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                JPEG, PNG or PDF · max 10 MB
              </p>
            </div>
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
      </div>
    </div>
  );
}