import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import path from "path";

// ── Config ─────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}


const ENDPOINT = process.env.MINIO_PUBLIC_ENDPOINT!;
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "";
const SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "";
const REGION     = process.env.MINIO_REGION     ?? "us-east-1";

// Bucket names
export const BUCKETS = {
  /** PDFs uploaded for shipment documents */
  shipmentDocs:   process.env.MINIO_BUCKET_SHIPMENT_DOCS ?? "shipment-docs",
  /** Warehouse receipt attachments */
  warehouseDocs:  process.env.MINIO_BUCKET_WAREHOUSE     ?? "warehouse-receipts",
  /** Public assets (logos, commodity images, etc.) */
  public:         process.env.MINIO_BUCKET_PUBLIC        ?? "azuretti-public",
} as const;

export type BucketName = keyof typeof BUCKETS;

// ── S3 client (singleton) ──────────────────────────────────────────────────

let _client: S3Client | null = null;

function getClient(endpoint = ENDPOINT): S3Client {
  if (_client) return _client;

  _client = new S3Client({
    endpoint:         endpoint,
    region:           REGION,
    credentials:      { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    forcePathStyle:   true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return _client;
}

// ── Bucket bootstrap ───────────────────────────────────────────────────────

/**
 * Ensure a bucket exists. Safe to call on every server start —
 * it is a no-op if the bucket already exists.
 */
async function ensureBucket(bucketName: string, isPublic = false): Promise<void> {
  const client = getClient();

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    // Bucket already exists
    return;
  } catch (err: any) {
    // 404 / NoSuchBucket → create it
    if (err?.name !== "NotFound" && err?.$metadata?.httpStatusCode !== 404) {
      throw err;
    }
  }

  await client.send(new CreateBucketCommand({ Bucket: bucketName }));

  // For public buckets, attach a read-all policy
  if (isPublic) {
    const policy = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect:    "Allow",
          Principal: { AWS: ["*"] },
          Action:    ["s3:GetObject"],
          Resource:  [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    });
    await client.send(
      new PutBucketPolicyCommand({ Bucket: bucketName, Policy: policy })
    );
  }
}

/**
 * Call this once at application startup (e.g. in src/app/layout.tsx
 * server component, or in a Next.js instrumentation.ts file).
 *
 *   import { bootstrapStorage } from "@/lib/storage";
 *   await bootstrapStorage();
 */
export async function bootstrapStorage(): Promise<void> {
  await Promise.all([
    ensureBucket(BUCKETS.shipmentDocs,  false),
    ensureBucket(BUCKETS.warehouseDocs, false),
    ensureBucket(BUCKETS.public,        true),
  ]);
}

// ── Upload ─────────────────────────────────────────────────────────────────

export interface UploadResult {
  /** Storage key (path inside the bucket) */
  key:      string;
  /** Bucket the file was stored in */
  bucket:   string;
  /**
   * URL suitable for persisting in the database.
   * - Public buckets:  direct URL (no expiry)
   * - Private buckets: presigned GET URL (1-hour default)
   *
   * For private buckets, re-generate the URL when serving it
   * to clients using `getPresignedUrl()`.
   */
  url:      string;
  /** File size in bytes (as given by the caller) */
  sizeBytes:number;
}

interface UploadOptions {
  /** The bucket to upload to (defaults to shipmentDocs) */
  bucket?:      BucketName;
  /**
   * Optional prefix / folder path inside the bucket.
   * e.g. "shipments/shp-2025-0001" → key = "shipments/shp-2025-0001/{uuid}.pdf"
   */
  prefix?:      string;
  /** Override the auto-generated filename. Sanitised before use. */
  fileName?:    string;
  /** MIME type (default: application/octet-stream) */
  contentType?: string;
  /** Additional metadata stored alongside the object */
  metadata?:    Record<string, string>;
}

/**
 * Upload a file to MinIO.
 *
 * Server usage (API route, Server Action):
 *   const { url } = await uploadFile(buffer, file.size, {
 *     bucket:      "shipmentDocs",
 *     prefix:      `shipments/${shipmentId}`,
 *     fileName:    file.name,
 *     contentType: file.type,
 *   });
 */
export async function uploadFile(
  body:     Buffer | Uint8Array | ReadableStream | Blob,
  sizeBytes:number,
  options:  UploadOptions = {}
): Promise<UploadResult> {
  const {
    bucket      = "shipmentDocs",
    prefix      = "",
    contentType = "application/octet-stream",
    metadata    = {},
  } = options;

  const bucketName = BUCKETS[bucket];

  // Sanitise filename — strip path separators, collapse whitespace
  const rawName    = options.fileName ?? `${randomUUID()}`;
  const safeName   = rawName.replace(/[/\\]/g, "_").replace(/\s+/g, "-");
  const ext        = path.extname(safeName) || "";
  const stem       = path.basename(safeName, ext);
  const uniqueName = `${stem}-${randomUUID()}${ext}`;
  const key        = prefix ? `${prefix}/${uniqueName}` : uniqueName;

  await getClient().send(
    new PutObjectCommand({
      Bucket:        bucketName,
      Key:           key,
      Body:          body as any,
      ContentType:   contentType,
      ContentLength: sizeBytes,
      Metadata:      metadata,
    })
  );

  // For the public bucket generate a direct URL; for private, presign
  const url = bucket === "public"
    ? buildPublicUrl(bucketName, key)
    : await getPresignedUrl(bucketName, key, 3600);

  return { key, bucket: bucketName, url, sizeBytes };
}

// ── Convenience: upload a PDF from a Next.js FormData File ─────────────────

/**
 * Upload a PDF file received from a multipart/form-data request.
 *
 * Usage in an API route:
 *   const formData = await req.formData();
 *   const file = formData.get("file") as File;
 *   const result = await uploadPdf(file, `shipments/${shipmentId}`);
 */
export async function uploadPdf(
  file:    File,
  prefix?: string,
  bucket:  BucketName = "shipmentDocs"
): Promise<UploadResult> {
  if (file.type !== "application/pdf") {
    throw new Error(`Expected a PDF file, got: ${file.type}`);
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("File exceeds the 20 MB size limit.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadFile(buffer, file.size, {
    bucket,
    prefix,
    fileName:    file.name,
    contentType: "application/pdf",
    metadata:    { originalName: file.name },
  });
}

// ── Presigned URLs ─────────────────────────────────────────────────────────

/**
 * Generate a presigned GET URL for a private object.
 * Default expiry: 1 hour (3600 seconds).
 *
 * Regenerate this URL every time you serve it to a client —
 * do NOT persist the presigned URL in the database; only store
 * the bucket + key. Persist the plain URL only for public buckets.
 */
export async function getPresignedUrl(
  bucketOrName: BucketName | string,
  key:          string,
  expiresIn:    number = 3600
): Promise<string> {
  // Accept both BucketName enum keys and raw bucket name strings
  const bucketName = bucketOrName in BUCKETS
    ? BUCKETS[bucketOrName as BucketName]
    : bucketOrName;

  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  const url     = await getSignedUrl(getClient(), command, { expiresIn });

  // Replace the internal Docker hostname with the public-facing one
  // so the URL works in the browser.
  return url;//.replace(INTERNAL_ENDPOINT, PUBLIC_ENDPOINT);
}

/**
 * Generate a presigned PUT URL so the browser can upload directly
 * to MinIO without routing the file through the Next.js server.
 *
 * Usage flow:
 *   1. Client requests a presigned URL from a lightweight API route.
 *   2. Client PUTs the file directly to MinIO using the URL.
 *   3. Client sends the resulting key/URL to the app server to register.
 *
 * This is the recommended approach for large files (> 5 MB).
 */
export async function getPresignedUploadUrl(
  bucket:      BucketName,
  key:         string,
  contentType: string = "application/pdf",
  expiresIn:   number = 300   // 5 minutes
): Promise<string> {
  const bucketName = BUCKETS[bucket];
  const { PutObjectCommand: PutCmd } = await import("@aws-sdk/client-s3");
  const command = new PutObjectCommand({
    Bucket:      bucketName,
    Key:         key,
    ContentType: contentType,
    ChecksumAlgorithm: undefined,
  });
  const url = await getSignedUrl(getClient(), command, { expiresIn });
  return url;//.replace(INTERNAL_ENDPOINT, PUBLIC_ENDPOINT);
}

// ── Delete ─────────────────────────────────────────────────────────────────

/**
 * Delete an object from MinIO.
 * Safe to call with a key that doesn't exist — MinIO returns 204.
 */
export async function deleteFile(
  bucket: BucketName | string,
  key:    string
): Promise<void> {
  const endpoint = process.env.MINIO_ENDPOINT ?? "http://minio:9000";
  const bucketName = bucket in BUCKETS
    ? BUCKETS[bucket as BucketName]
    : bucket;

  await getClient( endpoint ).send(
    new DeleteObjectCommand({ Bucket: bucketName, Key: key })
  );
}

// ── Exists check ───────────────────────────────────────────────────────────

/**
 * Returns true if the object exists and is accessible, false otherwise.
 */
export async function fileExists(
  bucket: BucketName | string,
  key:    string
): Promise<boolean> {
  const bucketName = bucket in BUCKETS
    ? BUCKETS[bucket as BucketName]
    : bucket;

  try {
    await getClient().send(
      new HeadObjectCommand({ Bucket: bucketName, Key: key })
    );
    return true;
  } catch {
    return false;
  }
}

// ── URL helpers ────────────────────────────────────────────────────────────

/**
 * Build a direct public URL (no expiry) for public-bucket objects.
 * Format: {PUBLIC_ENDPOINT}/{bucketName}/{key}
 */
export function buildPublicUrl(bucketName: string, key: string): string {
  const base = ENDPOINT.replace(/\/$/, "");
  return `${base}/${bucketName}/${key}`;
}

/**
 * Extract the bucket and key from a stored MinIO URL.
 * Useful when you need to delete or re-presign a stored URL.
 *
 * Works for both:
 *   - Direct URLs:     http://localhost:9000/shipment-docs/path/file.pdf
 *   - Presigned URLs:  http://localhost:9000/shipment-docs/path/file.pdf?X-Amz-...
 */
export function parseStoredUrl(url: string): { bucket: string; key: string } | null {
  try {
    // Strip query string (presigned params)
    const clean   = url.split("?")[0];
    const parsed  = new URL(clean);
    // Path is /{bucket}/{key...}
    const parts   = parsed.pathname.replace(/^\//, "").split("/");
    if (parts.length < 2) return null;
    const [bucket, ...rest] = parts;
    return { bucket, key: rest.join("/") };
  } catch {
    return null;
  }
}

// ── ShipmentDocumentsPanel integration ────────────────────────────────────
//
// Pass this as the `onUploadFile` prop to ShipmentDocumentsPanel.
// Because ShipmentDocumentsPanel is a client component, this function
// must also run in the browser — it calls the presigned URL API route
// rather than importing the server-side SDK directly.
//
// Create a lightweight API route at:
//   src/app/api/admin/shipments/[id]/upload-url/route.ts
//
//   export async function POST(req, { params }) {
//     const session = await getSession();
//     if (session?.user.role !== "admin") return 403;
//     const { fileName, contentType } = await req.json();
//     const key = `shipments/${params.id}/${Date.now()}-${fileName}`;
//     const url = await getPresignedUploadUrl("shipmentDocs", key, contentType);
//     return NextResponse.json({ uploadUrl: url, key });
//   }
//
// Then in the page that renders ShipmentDocumentsPanel, pass:
//
//   <ShipmentDocumentsPanel
//     shipmentId={params.id}
//     initialDocs={docs}
//     onUploadFile={async (file, shipmentId) => {
//       // 1. Get a presigned PUT URL from our API
//       const { uploadUrl, key } = await fetch(
//         `/api/admin/shipments/${shipmentId}/upload-url`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ fileName: file.name, contentType: file.type }),
//         }
//       ).then((r) => r.json());
//
//       // 2. Upload directly to MinIO
//       await fetch(uploadUrl, {
//         method: "PUT",
//         headers: { "Content-Type": file.type },
//         body: file,
//       });
//
//       // 3. Return the permanent URL for the DB record
//       return `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_ENDPOINT}/${
//         process.env.NEXT_PUBLIC_MINIO_BUCKET_SHIPMENT_DOCS ?? "shipment-docs"
//       }/${key}`;
//     }}
//   />
