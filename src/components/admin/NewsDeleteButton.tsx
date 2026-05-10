"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteProps {
  id:    string;
  title: string;
}

export function NewsDeleteButton({ id, title }: DeleteProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        success("Article deleted", "");
        router.refresh();
      } else {
        const json = await res.json();
        error("Delete failed", json.error ?? "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDelete}
      className="text-neutral-300 hover:text-red-500 transition-colors disabled:opacity-50"
      title="Delete article"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}