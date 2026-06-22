"use client";

import { useState } from "react";
import { useAdminTenants, useAdminTenantKeys } from "@/src/hooks/use-admin";
import { adminFetch } from "@/src/lib/admin-fetch";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { KeyRound, Plus, Copy, Ban, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import type { AdminTenant } from "@/src/types/admin";

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

function PlaintextKeyDialog({
  plaintext,
  onClose,
}: {
  plaintext: string | null;
  onClose: () => void;
}) {
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

function TenantKeys({ tenant, onPlaintext }: { tenant: AdminTenant; onPlaintext: (k: string) => void }) {
  const { keys, isLoading, mutate } = useAdminTenantKeys(tenant.id);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  async function createKey() {
    setBusy(true);
    try {
      const res = await adminFetch(`/api/admin/tenants/${tenant.id}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onPlaintext(data.data.plaintext);
      setCreating(false);
      setLabel("");
      await mutate();
    } catch { toast.error("Failed to create key"); }
    finally { setBusy(false); }
  }

  async function revokeKey(keyId: string, prefix: string) {
    if (!confirm(`Revoke key ${prefix}…? Apps using it will lose access immediately.`)) return;
    try {
      const res = await adminFetch(`/api/admin/keys/${keyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Key revoked");
      await mutate();
    } catch { toast.error("Failed to revoke key"); }
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
              <th className="text-left pb-1.5 pr-3">Requests</th>
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
                <td className="py-1.5 pr-3 text-xs font-mono">{k.monthlyRequestCount}</td>
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

export default function AdminTenantsPage() {
  const { tenants, isLoading, mutate } = useAdminTenants();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [plaintext, setPlaintext] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", plan: "FREE" });
  const [busy, setBusy] = useState(false);

  async function createTenant() {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Name and email are required"); return; }
    setBusy(true);
    try {
      const res = await adminFetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), plan: form.plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreateOpen(false);
      setForm({ name: "", email: "", plan: "FREE" });
      setPlaintext(data.data.apiKey.plaintext);
      toast.success(`Tenant ${data.data.tenant.name} created`);
      await mutate();
    } catch { toast.error("Failed to create tenant (email may already be registered)"); }
    finally { setBusy(false); }
  }

  async function patchTenant(t: AdminTenant, patch: { plan?: string; status?: string }) {
    try {
      const res = await adminFetch(`/api/admin/tenants/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      toast.success("Tenant updated");
      await mutate();
    } catch { toast.error("Update failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2"><Building2 className="h-5 w-5" />Tenants & API Keys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            SDK and API consumers. Keys are shown once on creation and stored hashed.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" />New tenant</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <KeyRound className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No tenants yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tenants.map((t) => (
            <div key={t.id} className="glass rounded-xl p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${PLAN_STYLE[t.plan] ?? ""}`}>{t.plan}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[t.status] ?? ""}`}>{t.status}</Badge>
                  <span className="text-xs text-muted-foreground">{t.keyCount} key{t.keyCount !== 1 ? "s" : ""}</span>
                  <Button
                    size="sm" variant="ghost" className="h-7 px-2 text-xs"
                    onClick={() => patchTenant(t, { plan: t.plan === "FREE" ? "PREMIUM" : "FREE" })}>
                    {t.plan === "FREE" ? "Upgrade" : "Downgrade"}
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className={`h-7 px-2 text-xs ${t.status === "ACTIVE" ? "text-destructive" : "text-green-500"}`}
                    onClick={() => {
                      const next = t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                      if (next === "SUSPENDED" && !confirm(`Suspend ${t.name}? All their keys stop working immediately.`)) return;
                      patchTenant(t, { status: next });
                    }}>
                    {t.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                    {expanded === t.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              {expanded === t.id && <TenantKeys tenant={t} onPlaintext={setPlaintext} />}
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Acme Studio" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="dev@acme.xyz" type="email" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Plan</Label>
              <select
                value={form.plan}
                onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="FREE">FREE — 50 req/month</option>
                <option value="PREMIUM">PREMIUM — 3,000 req/min</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={busy} onClick={createTenant}>{busy ? "Creating…" : "Create tenant + key"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlaintextKeyDialog plaintext={plaintext} onClose={() => setPlaintext(null)} />
    </div>
  );
}
