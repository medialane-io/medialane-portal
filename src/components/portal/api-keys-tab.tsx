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
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between gap-3 py-3 text-left group">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Quickstart</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">— sample requests to get you started</span>
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 pb-2">
          <p className="text-xs text-muted-foreground">
            Replace <code className="bg-primary/10 text-primary px-1 py-0.5 rounded">YOUR_API_KEY</code> with a key from the list above.
          </p>
          {QUICKSTART_SNIPPETS.map((snippet, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{snippet.label}</p>
              <div className="relative group">
                <pre className="bg-primary/5 rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                  {snippet.code}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(snippet.code, i)}
                >
                  {copiedIndex === i ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Need more? The full reference is in the <a href="/docs" className="text-primary hover:underline">API docs</a>.
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
      setActionError("Network error — please try again");
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
      setActionError("Network error — please try again");
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
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-1">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Keys
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Use a key to authenticate requests to the Medialane REST API from your app, script, or agent.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            disabled={activeCount >= 5}
            title={activeCount >= 5 ? "Maximum 5 active keys reached" : undefined}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Key
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-5 mb-6 text-xs text-muted-foreground">
          <span className="flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
            A new key&apos;s full value is shown once — copy it before closing the dialog.
          </span>
          <span className="flex items-start gap-1.5">
            <KeyRound className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
            Lost a key? You can&apos;t recover it — revoke it below and create a new one.
          </span>
          <span className="flex items-start gap-1.5">
            <CoinsIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
            Credits belong to your account, not the key — revoking never affects your balance.
          </span>
        </div>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center text-center py-12 gap-3">
            <Key className="w-8 h-8 text-primary" />
            <p className="text-sm text-muted-foreground max-w-xs">
              You don&apos;t have any API keys yet. Create one to start calling the Medialane API.
            </p>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="mt-1">
              <Plus className="w-4 h-4 mr-1" />
              Create your first key
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Key className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-sm text-primary">{k.prefix}***</code>
                      {k.label && (
                        <span className="text-xs text-muted-foreground">({k.label})</span>
                      )}
                      <Badge
                        variant={k.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          k.status === "ACTIVE"
                            ? "bg-primary/15 text-primary border-transparent"
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
                Copy your key now — it won&apos;t be shown again. If you lose it, you&apos;ll need to revoke it and create a new one.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-primary/5 px-3 py-2 rounded-lg break-all">
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
                <p className="text-xs text-muted-foreground">A name to help you tell keys apart later — you can use up to 5 at once.</p>
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
