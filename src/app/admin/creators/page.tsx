"use client";

import { useState } from "react";
import { useAdminCreators } from "@/src/hooks/use-admin";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { ExternalLink, Wrench } from "lucide-react";
import type { AdminCreatorRecord } from "@/src/types/admin";

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-green-500/20 text-green-400",
  PENDING:  "bg-yellow-500/20 text-yellow-400",
  REJECTED: "bg-red-500/20 text-red-400",
};

export default function AdminCreatorsPage() {
  const [statusFilter, setStatusFilter] = useState("APPROVED");
  const [page, setPage] = useState(1);
  const { creators, total, isLoading, mutate } = useAdminCreators(statusFilter || undefined, page);

  const [fixOpen, setFixOpen]       = useState(false);
  const [fixCreator, setFixCreator] = useState<AdminCreatorRecord | null>(null);
  const [newWallet, setNewWallet]   = useState("");
  const [fixing, setFixing]         = useState(false);

  function openFix(creator: AdminCreatorRecord) {
    setFixCreator(creator);
    setNewWallet("");
    setFixOpen(true);
  }

  async function handleFixWallet() {
    if (!newWallet.trim() || !fixCreator) return;
    setFixing(true);
    try {
      const res = await fetch(
        `/api/admin/creators/${fixCreator.walletAddress}/fix-wallet`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newAddress: newWallet.trim() }),
        }
      );
      if (!res.ok) throw new Error();
      toast.success(`Wallet corrected for @${fixCreator.username}`);
      setFixOpen(false);
      await mutate();
    } catch { toast.error("Failed to fix wallet"); }
    finally { setFixing(false); }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Creator Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage creator username claims and fix wallet address issues.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "APPROVED", "PENDING", "REJECTED"].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {s || "All"} {!s && total > 0 && `(${total})`}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/30">
          <div className="w-28 shrink-0">Username</div>
          <div className="flex-1">Wallet address</div>
          <div className="w-24 hidden sm:block">Status</div>
          <div className="w-24 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : creators.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No creators found</div>
        ) : creators.map((c) => (
          <div key={c.id} className="flex items-center gap-4 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
            <div className="w-28 shrink-0">
              <a
                href={`/creator/${c.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                @{c.username}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs text-muted-foreground truncate">{c.walletAddress}</p>
            </div>
            <div className="w-24 hidden sm:block">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[c.status] ?? ""}`}>
                {c.status}
              </span>
            </div>
            <div className="w-24 text-right shrink-0">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openFix(c)}>
                <Wrench className="h-3 w-3 mr-1" />Fix wallet
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={fixOpen} onOpenChange={setFixOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fix wallet for @{fixCreator?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Current (wrong) address</Label>
              <p className="font-mono text-xs break-all bg-muted rounded p-2">{fixCreator?.walletAddress}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Correct wallet address</Label>
              <Input placeholder="0x…" value={newWallet} onChange={e => setNewWallet(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFixOpen(false)}>Cancel</Button>
            <Button onClick={handleFixWallet} disabled={fixing || !newWallet.trim()}>
              {fixing ? "Fixing…" : "Fix Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
