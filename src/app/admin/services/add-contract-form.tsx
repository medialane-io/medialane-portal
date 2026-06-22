"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/src/lib/admin-fetch";

const CHAINS = ["starknet-mainnet", "starknet-sepolia"] as const;

interface Props {
  serviceId: string;
}

export function AddContractForm({ serviceId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    chain: "starknet-mainnet",
    contractAddress: "",
    startBlock: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adminFetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add contract");
        return;
      }
      setOpen(false);
      setForm({ chain: "starknet-mainnet", contractAddress: "", startBlock: "", notes: "" });
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        + Add contract
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3 mt-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add contract</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Chain</label>
          <select
            value={form.chain}
            onChange={(e) => setForm((f) => ({ ...f, chain: e.target.value }))}
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {CHAINS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Start Block</label>
          <input
            type="text"
            placeholder="9196722"
            value={form.startBlock}
            onChange={(e) => setForm((f) => ({ ...f, startBlock: e.target.value }))}
            required
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Contract Address</label>
        <input
          type="text"
          placeholder="0x..."
          value={form.contractAddress}
          onChange={(e) => setForm((f) => ({ ...f, contractAddress: e.target.value }))}
          required
          className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Notes (optional)</label>
        <input
          type="text"
          placeholder="e.g. v0.8.0 immutable deploy"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="text-xs bg-primary text-primary-foreground rounded px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
