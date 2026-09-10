"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  id: string;
  name: string;
  isDeleted: boolean;
}

export function CommodityRowActions({ id, name, isDeleted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"delete" | "restore" | null>(null);

  async function softDelete() {
    if (!confirm(`Delete "${name}"? It can be restored later.`)) return;
    setLoading("delete");
    await fetch(`/api/admin/commodities/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(null);
  }

  async function restore() {
    setLoading("restore");
    await fetch(`/api/admin/commodities/${id}/restore`, { method: "PATCH" });
    router.refresh();
    setLoading(null);
  }

  if (isDeleted) {
    return (
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-500 border border-red-200 rounded-full">
          Deleted
        </span>
        <button
          onClick={restore}
          disabled={loading === "restore"}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "restore" && <Loader2 className="h-3 w-3 animate-spin" />}
          {loading === "restore" ? "Restoring…" : "Restore"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/admin/commodities/${id}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </Link>
      <button
        onClick={softDelete}
        disabled={loading === "delete"}
        className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === "delete" && <Loader2 className="h-3 w-3 animate-spin" />}
        {loading === "delete" ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
