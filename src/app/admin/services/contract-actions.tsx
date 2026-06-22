"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/src/lib/admin-fetch";

interface Props {
  contractId: string;
  active: boolean;
  notes: string | null;
}

export function ContractActions({ contractId, active, notes }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState(notes ?? "");

  async function patch(body: { active?: boolean; notes?: string | null }) {
    setBusy(true);
    try {
      const res = await adminFetch(`/api/admin/services/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
      return true;
    } catch {
      toast.error("Update failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    if (active && !confirm("Deactivate this contract record? The indexer/registry treats inactive contracts as retired.")) return;
    if (await patch({ active: !active })) {
      toast.success(active ? "Contract deactivated" : "Contract activated");
    }
  }

  async function saveNotes() {
    if (await patch({ notes: noteDraft.trim() || null })) {
      toast.success("Notes saved");
      setEditingNotes(false);
    }
  }

  if (editingNotes) {
    return (
      <span className="flex items-center gap-1.5">
        <input
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          className="bg-background border border-border rounded px-2 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="notes"
        />
        <button onClick={saveNotes} disabled={busy} className="text-xs text-primary hover:underline disabled:opacity-50">Save</button>
        <button onClick={() => setEditingNotes(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button onClick={toggleActive} disabled={busy}
        className={`text-xs transition-colors disabled:opacity-50 ${active ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground hover:text-green-400"}`}>
        {active ? "Deactivate" : "Activate"}
      </button>
      <button onClick={() => { setNoteDraft(notes ?? ""); setEditingNotes(true); }} disabled={busy}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
        Notes
      </button>
    </span>
  );
}
