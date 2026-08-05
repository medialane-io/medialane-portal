"use client";

import { useState } from "react";
import { useAdminAccounts, useAdminApiClientKeys } from "@/src/hooks/use-admin";
import { runAdminAction } from "@/src/lib/admin-fetch";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { KeyRound, Copy, Ban, ChevronDown, ChevronUp, Users, Coins, Search, Plug } from "lucide-react";
import type { AdminAccount, AdminApiClient } from "@/src/types/admin";

const PLAN_STYLE: Record<string, string> = {
  FREE:    "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PREMIUM: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-green-500/20 text-green-400 border-green-500/30",
  SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
};

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

function shortAddr(a: string | null): string {
  if (!a) return "—";
  return a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-4)}` : a;
}

function accountLabel(a: AdminAccount): { title: string; subtitle: string } {
  const wallet = a.identities.find((i) => i.scheme === "wallet");
  const emailId = a.identities.find((i) => i.email);
  if (wallet?.address) return { title: shortAddr(wallet.address), subtitle: emailId?.email ?? a.publicId };
  if (emailId?.email) return { title: emailId.email, subtitle: a.publicId };
  return { title: a.publicId, subtitle: a.type };
}

function PlaintextKeyDialog({ plaintext, onClose }: { plaintext: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!plaintext} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>API key created</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This key is shown <strong>once</strong> and is not stored. Copy it now.
        </p>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
          <code className="text-xs font-mono break-all flex-1">{plaintext}</code>
          <Button size="sm" variant="outline" onClick={() => plaintext && copy(plaintext)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <DialogFooter>
          <Button size="sm" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApiClientKeys({ apiClient, onPlaintext }: { apiClient: AdminApiClient; onPlaintext: (k: string) => void }) {
  const { keys, isLoading, mutate } = useAdminApiClientKeys(apiClient.id);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  async function createKey() {
    setBusy(true);
    const r = await runAdminAction<{ data?: { plaintext?: string } }>(`/api/admin/api-clients/${apiClient.id}/keys`, {
      method: "POST", body: JSON.stringify({ label: label.trim() || undefined }), errorPrefix: "Failed to create key",
    });
    if (r?.data?.plaintext) { onPlaintext(r.data.plaintext); setCreating(false); setLabel(""); await mutate(); }
    setBusy(false);
  }

  async function revokeKey(keyId: string, prefix: string) {
    if (!confirm(`Revoke key ${prefix}…? Apps using it will lose access immediately.`)) return;
    const r = await runAdminAction(`/api/admin/api-clients/${apiClient.id}/keys/${keyId}`, {
      method: "DELETE", success: "Key revoked", errorPrefix: "Failed to revoke key",
    });
    if (r) await mutate();
  }

  return (
    <div className="border-t border-border pt-3 mt-3 space-y-2">
      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : keys.length === 0 ? (
        <p className="text-xs text-muted-foreground">No keys.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="text-left pb-1.5 pr-3">Prefix</th>
              <th className="text-left pb-1.5 pr-3">Label</th>
              <th className="text-left pb-1.5 pr-3">App</th>
              <th className="text-left pb-1.5 pr-3">Last used</th>
              <th className="text-left pb-1.5 pr-3">Status</th>
              <th className="pb-1.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.map((k) => (
              <tr key={k.id} className={k.status === "REVOKED" ? "opacity-50" : ""}>
                <td className="py-1.5 pr-3 font-mono text-xs">{k.prefix}…</td>
                <td className="py-1.5 pr-3 text-xs">{k.label || "—"}</td>
                <td className="py-1.5 pr-3 text-xs text-muted-foreground">{k.appSource ?? "generic"}</td>
                <td className="py-1.5 pr-3 text-xs text-muted-foreground">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "never"}
                </td>
                <td className="py-1.5 pr-3">
                  <Badge variant="outline" className={`text-[10px] ${k.status === "ACTIVE" ? STATUS_STYLE.ACTIVE : STATUS_STYLE.SUSPENDED}`}>
                    {k.status}
                  </Badge>
                </td>
                <td className="py-1.5 text-right">
                  {k.status === "ACTIVE" && (
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-destructive" onClick={() => revokeKey(k.id, k.prefix)}>
                      <Ban className="h-3 w-3" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {creating ? (
        <div className="flex items-end gap-2">
          <div className="space-y-1 flex-1">
            <Label className="text-xs">Label (optional)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. production" className="h-8 text-xs" />
          </div>
          <Button size="sm" disabled={busy} onClick={createKey}>{busy ? "Creating…" : "Create"}</Button>
          <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
        </div>
      ) : (
        <button onClick={() => setCreating(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          + Add key
        </button>
      )}
    </div>
  );
}

function GrantCreditsDialog({
  apiClient, open, onClose, onGranted,
}: { apiClient: AdminApiClient | null; open: boolean; onClose: () => void; onGranted: () => void }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  async function grant() {
    const n = Number(amount);
    if (!Number.isInteger(n) || n === 0) { toast.error("Enter a non-zero integer (negative deducts)"); return; }
    setBusy(true);
    const r = await runAdminAction(`/api/admin/api-clients/${apiClient!.id}/credits/grant`, {
      method: "POST", body: JSON.stringify({ amount: n }), success: "Credits updated", errorPrefix: "Grant failed",
    });
    setBusy(false);
    if (r) { setAmount(""); onClose(); onGranted(); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust credits</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Current balance: <span className="font-mono">{apiClient?.creditBalance.toLocaleString()}</span>.
          Positive grants, negative deducts (floors at 0).
        </p>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100000 or -5000" />
        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={busy} onClick={grant}>{busy ? "Saving…" : "Apply"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAccountsPage() {
  const [query, setQuery] = useState("");
  const [q, setQ] = useState<string | undefined>(undefined);
  const { accounts, isLoading, mutate } = useAdminAccounts(q);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [granting, setGranting] = useState<AdminApiClient | null>(null);

  async function patchAccount(a: AdminAccount, patch: { status: string }) {
    const r = await runAdminAction(`/api/admin/accounts/${a.id}`, {
      method: "PATCH", body: JSON.stringify(patch), success: "Account updated", errorPrefix: "Update failed",
    });
    if (r) await mutate();
  }

  async function patchApiClient(apiClient: AdminApiClient, patch: { plan: string }) {
    const r = await runAdminAction(`/api/admin/api-clients/${apiClient.id}`, {
      method: "PATCH", body: JSON.stringify(patch), success: "Plan updated", errorPrefix: "Update failed",
    });
    if (r) await mutate();
  }

  async function grantApiAccess(a: AdminAccount) {
    const r = await runAdminAction(`/api/admin/api-clients`, {
      method: "POST", body: JSON.stringify({ accountId: a.id }), success: "API access granted", errorPrefix: "Failed to grant API access",
    });
    if (r) await mutate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5" />Accounts & API Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Every wallet/identity that connects to any Medialane app is an Account. Keys, credits, and plan
            only apply to accounts that are also SDK/API clients — grant that separately below.
          </p>
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); setQ(query || undefined); }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="id / wallet / email"
            className="h-8 w-56 text-xs"
          />
          <Button size="sm" variant="outline" type="submit"><Search className="h-3.5 w-3.5" /></Button>
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <KeyRound className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No accounts found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((a) => {
            const { title, subtitle } = accountLabel(a);
            return (
              <div key={a.id} className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate font-mono">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {a.apiClient ? (
                      <>
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Coins className="h-3 w-3" />{a.apiClient.creditBalance.toLocaleString()}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${PLAN_STYLE[a.apiClient.plan] ?? ""}`}>{a.apiClient.plan}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[a.status] ?? ""}`}>{a.status}</Badge>
                        <span className="text-xs text-muted-foreground">{a.apiClient.keyCount} key{a.apiClient.keyCount !== 1 ? "s" : ""}</span>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setGranting(a.apiClient)}>
                          Credits
                        </Button>
                        <Button
                          size="sm" variant="ghost" className="h-7 px-2 text-xs"
                          onClick={() => patchApiClient(a.apiClient!, { plan: a.apiClient!.plan === "FREE" ? "PREMIUM" : "FREE" })}>
                          {a.apiClient.plan === "FREE" ? "Upgrade" : "Downgrade"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[a.status] ?? ""}`}>{a.status}</Badge>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => grantApiAccess(a)}>
                          <Plug className="h-3 w-3" />Grant API access
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm" variant="ghost"
                      className={`h-7 px-2 text-xs ${a.status === "ACTIVE" ? "text-destructive" : "text-green-500"}`}
                      onClick={() => {
                        const next = a.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                        if (next === "SUSPENDED" && !confirm(`Suspend this account? All its keys stop working immediately.`)) return;
                        patchAccount(a, { status: next });
                      }}>
                      {a.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                    </Button>
                    {a.apiClient && (
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                        {expanded === a.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                </div>
                {expanded === a.id && a.apiClient && <ApiClientKeys apiClient={a.apiClient} onPlaintext={setPlaintext} />}
              </div>
            );
          })}
        </div>
      )}

      <GrantCreditsDialog
        apiClient={granting}
        open={!!granting}
        onClose={() => setGranting(null)}
        onGranted={() => void mutate()}
      />
      <PlaintextKeyDialog plaintext={plaintext} onClose={() => setPlaintext(null)} />
    </div>
  );
}
