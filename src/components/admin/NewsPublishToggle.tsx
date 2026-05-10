"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── NewsPublishToggle ──────────────────────────────────────────────────────

interface ToggleProps {
  id:          string;
  isPublished: boolean;
}

export function NewsPublishToggle({ id, isPublished }: ToggleProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [published, setPublished] = useState(isPublished);
  const [loading, setLoading]     = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isPublished: !published }),
      });
      if (res.ok) {
        setPublished((p) => !p);
        success(
          !published ? "Article published" : "Article unpublished",
          !published ? "Now visible on the website." : "Moved back to drafts."
        );
        router.refresh();
      } else {
        const json = await res.json();
        error("Update failed", json.error ?? "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50",
          published ? "bg-green-500" : "bg-neutral-200"
        )}
        title={published ? "Click to unpublish" : "Click to publish"}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 text-white animate-spin absolute left-1" />
        ) : (
          <span
            className={cn(
              "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
              published ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        )}
      </button>
      <span className={cn(
        "text-xs font-medium",
        published ? "text-green-600" : "text-neutral-400"
      )}>
        {published ? "Live" : "Draft"}
      </span>
    </div>
  );
}