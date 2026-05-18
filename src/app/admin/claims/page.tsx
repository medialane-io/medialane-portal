"use client";

import { useState } from "react";
import { useAdminClaims, useAdminUsernameClaims } from "@/src/hooks/use-admin";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Textarea } from "@/src/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { AtSign, FileCheck } from "lucide-react";
import type { AdminCollectionClaimRecord, AdminUsernameClaimRecord } from "@/src/types/admin";

const STATUS_STYLE: Record<string, string> = {
  PENDING:       "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  AUTO_APPROVED: "bg-green-500/20  text-green-400  border-green-500/30",
  APPROVED:      "bg-green-500/20  text-green-400  border-green-500/30",
  REJECTED:      "bg-red-500/20    text-red-400    border-red-500/30",
};
const METHOD_STYLE: Record<string, string> = {
  ONCHAIN:   "bg-blue-500/20   text-blue-400   border-blue-500/30",
  SIGNATURE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  MANUAL:    "bg-orange-500/20 text-orange-400 border-orange-500/30",
};
const SERVICES = ["mip-erc721", "mip-erc1155", "pop-protocol", "drop-collection"];
const FILTERS = ["", "PENDING", "APPROVED", "REJECTED"];

function CollectionClaimsTab() {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const { claims, total, isLoading, mutate } = useAdminClaims(statusFilter || undefined);
  const [selected, setSelected] = useState<AdminCollectionClaimRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [service, setService] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleAction(status: "APPROVED" | "REJECTED") {
    if (!selected) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/claims/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes, ...(status === "APPROVED" && service ? { service } : {}) }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "APPROVED" ? "Claim approved" : "Claim rejected");
      setSelected(null);
      await mutate();
    } catch { toast.error("Action failed"); }
    finally { setProcessing(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Collection Claims ({total})</h2>
        <div className="flex gap-2">
          {FILTERS.map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)}>
              {s || "All"}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <div className="space-y-2">
          {claims.map((claim) => (
            <div key={claim.id} className="glass rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm truncate max-w-xs">{claim.contractAddress}</span>
                  <Badge variant="outline" className={STATUS_STYLE[claim.status]}>{claim.status}</Badge>
                  <Badge variant="outline" className={METHOD_STYLE[claim.verificationMethod]}>{claim.verificationMethod}</Badge>
                </div>
                {claim.claimantAddress && <p className="text-xs text-muted-foreground font-mono">{claim.claimantAddress.slice(0, 16)}…</p>}
                {claim.claimantEmail && <p className="text-xs text-muted-foreground">{claim.claimantEmail}</p>}
                {claim.notes && <p className="text-xs text-foreground/60 italic">&ldquo;{claim.notes}&rdquo;</p>}
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}</p>
              </div>
              {claim.status === "PENDING" && (
                <Button size="sm" variant="outline" onClick={() => { setSelected(claim); setAdminNotes(""); setService(""); }}>Review</Button>
              )}
            </div>
          ))}
          {claims.length === 0 && <p className="text-sm text-muted-foreground">No claims found.</p>}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Collection Claim</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p className="font-mono break-all">{selected?.contractAddress}</p>
            {selected?.claimantEmail && <p className="text-muted-foreground">{selected.claimantEmail}</p>}
            {selected?.notes && <p className="italic text-foreground/70">&ldquo;{selected.notes}&rdquo;</p>}
            <div className="space-y-1">
              <p className="font-medium text-xs uppercase text-muted-foreground">Service (on approve)</p>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger><SelectValue placeholder="(external / none)" /></SelectTrigger>
                <SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Admin notes (optional)…" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="destructive" disabled={processing} onClick={() => handleAction("REJECTED")}>Reject</Button>
            <Button disabled={processing} onClick={() => handleAction("APPROVED")}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsernameClaimsTab() {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const { claims, total, isLoading, mutate } = useAdminUsernameClaims(statusFilter || undefined);
  const [selected, setSelected] = useState<AdminUsernameClaimRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleAction(status: "APPROVED" | "REJECTED") {
    if (!selected) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/username-claims/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "APPROVED" ? `@${selected.username} approved` : "Claim rejected");
      setSelected(null);
      await mutate();
    } catch { toast.error("Action failed"); }
    finally { setProcessing(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Username Claims ({total})</h2>
        <div className="flex gap-2">
          {FILTERS.map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)}>
              {s || "All"}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <div className="space-y-2">
          {claims.map((claim) => (
            <div key={claim.id} className="glass rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-medium">@{claim.username}</span>
                  <Badge variant="outline" className={STATUS_STYLE[claim.status]}>{claim.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{claim.walletAddress.slice(0, 16)}…</p>
                {claim.adminNotes && <p className="text-xs text-foreground/60 italic">&ldquo;{claim.adminNotes}&rdquo;</p>}
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}</p>
              </div>
              {claim.status === "PENDING" && (
                <Button size="sm" variant="outline" onClick={() => { setSelected(claim); setAdminNotes(""); }}>Review</Button>
              )}
            </div>
          ))}
          {claims.length === 0 && <p className="text-sm text-muted-foreground">No username claims found.</p>}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Username Claim</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Requested username</p>
              <p className="font-mono text-lg font-bold">@{selected?.username}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Wallet</p>
              <p className="font-mono text-xs break-all">{selected?.walletAddress}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Creator profile</p>
              <a href={`/account/${selected?.walletAddress}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                View profile →
              </a>
            </div>
            <Textarea
              placeholder="Admin notes (shown to user on rejection)…"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="destructive" disabled={processing} onClick={() => handleAction("REJECTED")}>Reject</Button>
            <Button disabled={processing} onClick={() => handleAction("APPROVED")}>Approve @{selected?.username}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminClaimsPage() {
  const [tab, setTab] = useState<"collections" | "usernames">("usernames");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setTab("usernames")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${tab === "usernames" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <AtSign className="h-3.5 w-3.5" />
          Usernames
        </button>
        <button
          onClick={() => setTab("collections")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${tab === "collections" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <FileCheck className="h-3.5 w-3.5" />
          Collections
        </button>
      </div>

      {tab === "usernames" ? <UsernameClaimsTab /> : <CollectionClaimsTab />}
    </div>
  );
}
