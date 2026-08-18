"use client";

import { useState } from "react";
import useSWR from "swr";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/src/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog";
import {
  Key, Trash2, AlertCircle, Plus, Copy, Check, ChevronDown, ChevronUp,
  Terminal, ShieldAlert, KeyRound, Coins as CoinsIcon,
} from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";

interface ApiKey {
  id: string;
  prefix: string;
  label: string | null;
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
  createdAt: string;
}

const QUICKSTART_SNIPPETS = [
  {
    label: "List open orders",
    code: `curl https://medialane-backend-production.up.railway.app/v1/orders \\
  -H "x-api-key: YOUR_API_KEY"`,
  },
  {
    label: "Get your account profile",
    code: `curl https://medialane-backend-production.up.railway.app/v1/portal/me \\
  -H "x-api-key: YOUR_API_KEY"`,
  },
];

function QuickstartCard() {
  const [open, setOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, i: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-2xl border border-brand-blue px-5">
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between gap-3 py-4 text-left group">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
              <Terminal className="w-4 h-4" />
            </span>
            <span className="font-semibold text-sm">Quickstart</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">· sample requests to get you started</span>
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 pb-5">
          <p className="text-xs text-muted-foreground">
            Replace <code className="bg-brand-blue/10 text-brand-blue px-1 py-0.5 rounded">YOUR_API_KEY</code> with a key from the list above.
          </p>
          {QUICKSTART_SNIPPETS.map((snippet, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{snippet.label}</p>
              <div className="relative group">
                <pre className="bg-background/60 rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                  {snippet.code}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(snippet.code, i)}
                >
                  {copiedIndex === i ? (
                    <Check className="w-3.5 h-3.5 text-brand-blue" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Need more? The full reference is in the <a href="/docs" className="text-brand-blue hover:underline">API docs</a>.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ApiKeysTab({ address }: { address: string }) {
  const { data, error, isLoading, mutate } = useSWR<{ data: ApiKey[] }>(
    `/api/portal/keys?address=${address}`,
    portalFetcher
  );
  const [revoking, setRevoking] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<{ prefix: string; plaintext: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/portal/keys/${id}?address=${address}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        setActionError(json?.error ?? `Failed to revoke key (${res.status})`);
        return;
      }
      await mutate();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setRevoking(null);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/portal/keys?address=${address}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: labelInput.trim() || undefined }),
      });
      const json = await res.json().catch(() => ({})) as { data?: { prefix: string; plaintext: string }; error?: string };
      if (!res.ok) {
        setActionError(json?.error ?? `Failed to create key (${res.status})`);
        return;
      }
      setNewKey({ prefix: json.data!.prefix, plaintext: json.data!.plaintext });
      await mutate();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey.plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setLabelInput("");
    setNewKey(null);
    setCopied(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 rounded-xl bg-destructive/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Couldn&apos;t load your API keys. Please try again in a moment.</span>
      </div>
    );
  }

  const keys = data?.data ?? [];
  const activeCount = keys.filter((k) => k.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">API Keys</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Use a key to authenticate requests to the Medialane REST API from your app, script, or agent.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="gradient-fill"
            className="from-brand-navy to-brand-purple shrink-0"
            onClick={() => setCreateOpen(true)}
            disabled={activeCount >= 5}
            title={activeCount >= 5 ? "Maximum 5 active keys reached" : undefined}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Key
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6 mb-6">
          <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-blue" />
            A new key&apos;s full value is shown once. Copy it before closing the dialog.
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <KeyRound className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-blue" />
            Lost a key? Revoke it below and create a new one.
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <CoinsIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-blue" />
            Credits stay with your account regardless of which key is used, so your balance stays intact when you revoke one.
          </div>
        </div>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 gap-3 rounded-2xl bg-muted/30">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
              <Key className="w-6 h-6" />
            </span>
            <p className="text-sm text-muted-foreground max-w-xs">
              You don&apos;t have any API keys yet. Create one to start calling the Medialane API.
            </p>
            <Button size="sm" variant="gradient-fill" className="from-brand-navy to-brand-purple mt-1" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create your first key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between gap-4 rounded-xl bg-muted/30 p-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Key className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm text-foreground">{k.prefix}***</code>
                      {k.label && (
                        <span className="text-xs text-muted-foreground">({k.label})</span>
                      )}
                      <Badge
                        variant={k.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          k.status === "ACTIVE"
                            ? "bg-brand-blue/15 text-brand-blue border-transparent"
                            : "bg-muted text-muted-foreground border-transparent"
                        }
                      >
                        {k.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {k.lastUsedAt
                        ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                        : "Never used"}{" "}
                      · Created {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {k.status === "ACTIVE" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    disabled={revoking === k.id}
                    onClick={() => handleRevoke(k.id)}
                    title="Revoke this key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/5 mt-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {actionError}
          </div>
        )}
      </div>

      <QuickstartCard />

      <Dialog open={createOpen} onOpenChange={(open) => !open && handleCloseCreate()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          {newKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy your key now. It won&apos;t be shown again, so keep it somewhere safe. If you lose it, revoke it and create a new one.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-primary/5 px-3 py-2 rounded-lg break-all">
                  {newKey.plaintext}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseCreate}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-label">Label (optional)</Label>
                <Input
                  id="key-label"
                  placeholder="e.g. production, staging"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  maxLength={64}
                />
                <p className="text-xs text-muted-foreground">A name to help you tell keys apart later. You can use up to 5 at once.</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
