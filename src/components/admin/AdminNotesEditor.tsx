"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { Save, Loader2 } from "lucide-react";

interface Props {
  demandId:     string;
  initialNotes: string;
}

export function AdminNotesEditor({ demandId, initialNotes }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const [notes, setNotes]   = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/demands/${demandId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ adminNotes: notes }),
      });
      if (res.ok) {
        success("Notes saved", "");
        router.refresh();
      } else {
        error("Save failed", "Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        rows={4}
        className="input resize-none text-sm"
        placeholder="Internal notes visible only to admins…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        type="button"
        onClick={save}
        disabled={saving || notes === initialNotes}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Save notes
      </button>
    </div>
  );
}
