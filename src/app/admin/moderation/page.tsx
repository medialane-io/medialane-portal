"use client";

import { useState } from "react";
import { useAdminComments, useAdminSlugClaims } from "@/src/hooks/use-admin";
import { adminFetch } from "@/src/lib/admin-fetch";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
import { MessageSquare, Link2, Wrench, Eye, EyeOff, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { timeAgo } from "@/src/lib/utils";

const PAGE_SIZE = 20;

function short(addr: string) {
  return addr.length > 16 ? `${addr.slice(0, 8)}…${addr.slice(-4)}` : addr;
}

function Pager({ page, total, setPage }: { page: number; total: number; setPage: (fn: (p: number) => number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" />Prev</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function CommentsTab() {
  const [hiddenFilter, setHiddenFilter] = useState<boolean | undefined>(false);
  const [page, setPage] = useState(1);
  const { comments, total, isLoading, mutate } = useAdminComments(hiddenFilter, page);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(id: string, hide: boolean) {
    setBusy(id);
    try {
      const res = await adminFetch(`/api/admin/comments/${id}/${hide ? "hide" : "show"}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success(hide ? "Comment hidden" : "Comment restored");
      await mutate();
    } catch { toast.error("Action failed"); }
    finally { setBusy(null); }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[
          { label: "Visible", value: false },
          { label: "Hidden", value: true },
          { label: "All", value: undefined },
        ].map((tab) => (
          <button key={tab.label} onClick={() => { setHiddenFilter(tab.value); setPage(1); }}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${hiddenFilter === tab.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">{isLoading ? "Loading…" : `${total.toLocaleString()} comments`}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : comments.length === 0 ? (
        <p className="text-center py-12 text-sm text-muted-foreground">No comments for this filter.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className={`flex items-start gap-3 p-4 border border-border rounded-lg ${c.isHidden ? "opacity-60" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm break-words">{c.content}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {short(c.author)} · token {c.tokenId} on {short(c.contractAddress)} · {timeAgo(c.createdAt)}
                </p>
              </div>
              {c.isHidden && <Badge variant="outline" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30 shrink-0">HIDDEN</Badge>}
              <Button
                size="sm" variant="outline" className="shrink-0"
                disabled={busy === c.id}
                onClick={() => toggle(c.id, !c.isHidden)}>
                {c.isHidden ? <><Eye className="h-3.5 w-3.5 mr-1.5" />Show</> : <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Hide</>}
              </Button>
            </div>
          ))}
        </div>
      )}
      <Pager page={page} total={total} setPage={(fn) => setPage(fn)} />
    </div>
  );
}

function SlugClaimsTab() {
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const { claims, total, isLoading, mutate } = useAdminSlugClaims(status || undefined, page);
  const [busy, setBusy] = useState<string | null>(null);

  async function review(id: string, newStatus: "APPROVED" | "REJECTED") {
    setBusy(id);
    try {
      const res = await adminFetch(`/api/admin/collection-slug-claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Claim ${newStatus.toLowerCase()}`);
      await mutate();
    } catch { toast.error("Action failed"); }
    finally { setBusy(null); }
  }

  const STATUS_STYLE: Record<string, string> = {
    APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
    PENDING:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
          <button key={s || "all"} onClick={() => { setStatus(s); setPage(1); }}
            className={`text-sm px-3 py-1.5 rounded-md capitalize transition-colors ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            {s ? s.toLowerCase() : "All"}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">{isLoading ? "Loading…" : `${total.toLocaleString()} claims`}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
      ) : claims.length === 0 ? (
        <p className="text-center py-12 text-sm text-muted-foreground">No slug claims for this filter.</p>
      ) : (
        <div className="space-y-2">
          {claims.map((claim) => (
            <div key={claim.id} className="flex items-center gap-3 p-4 border border-border rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">/{claim.slug}</p>
                <p className="text-xs text-muted-foreground font-mono">{short(claim.contractAddress)} · {timeAgo(claim.createdAt)}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUS_STYLE[claim.status] ?? ""}`}>{claim.status}</Badge>
              {claim.status === "PENDING" && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                    disabled={busy === claim.id} onClick={() => review(claim.id, "APPROVED")}>
                    <Check className="h-3.5 w-3.5 mr-1" />Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive"
                    disabled={busy === claim.id} onClick={() => review(claim.id, "REJECTED")}>
                    <X className="h-3.5 w-3.5 mr-1" />Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Pager page={page} total={total} setPage={(fn) => setPage(fn)} />
    </div>
  );
}

function LicensingFixTab() {
  const [offerId, setOfferId] = useState("");
  const [creatorAddress, setCreatorAddress] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!offerId.trim() || !creatorAddress.trim()) { toast.error("Both fields are required"); return; }
    setBusy(true);
    try {
      const res = await adminFetch(`/api/admin/remix-offers/${offerId.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorAddress: creatorAddress.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Creator address updated on offer ${data.data.id}`);
      setOfferId(""); setCreatorAddress("");
    } catch { toast.error("Update failed — check the offer ID"); }
    finally { setBusy(false); }
  }

  return (
    <div className="glass rounded-xl p-5 space-y-3 max-w-lg">
      <div className="flex items-start gap-3">
        <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Fix licensing offer creator</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            When a token transfer leaves a licensing (remix) offer pointing at a stale creator,
            override the <code>creatorAddress</code> on the offer record.
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Offer ID</Label>
        <Input value={offerId} onChange={(e) => setOfferId(e.target.value)} placeholder="offer id" className="h-8 text-xs font-mono" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">New creator address</Label>
        <Input value={creatorAddress} onChange={(e) => setCreatorAddress(e.target.value)} placeholder="0x…" className="h-8 text-xs font-mono" />
      </div>
      <Button size="sm" disabled={busy} onClick={submit}>{busy ? "Updating…" : "Update offer"}</Button>
    </div>
  );
}

const TABS = [
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "slugs",    label: "Slug Claims", icon: Link2 },
  { id: "licensing", label: "Licensing", icon: Wrench },
] as const;

export default function AdminModerationPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("comments");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Moderation</h1>
        <p className="text-sm text-muted-foreground mt-0.5">On-chain comments, collection slug claims, and licensing fixes.</p>
      </div>

      <div className="flex gap-1 border-b border-border pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === "comments" && <CommentsTab />}
      {tab === "slugs" && <SlugClaimsTab />}
      {tab === "licensing" && <LicensingFixTab />}
    </div>
  );
}
