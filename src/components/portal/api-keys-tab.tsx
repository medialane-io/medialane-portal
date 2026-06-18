"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
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
import { Key, Trash2, AlertCircle, Plus, Copy, Check, ChevronDown, ChevronUp, Terminal } from "lucide-react";
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
    label: "Get your tenant profile",
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
    <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/10 transition-colors rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Quickstart</CardTitle>
              </div>
              {open ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <CardDescription>Sample curl requests to get you started</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Replace <code className="bg-muted px-1 py-0.5 rounded text-foreground">YOUR_API_KEY</code> with the key shown above.
            </p>
            {QUICKSTART_SNIPPETS.map((snippet, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">{snippet.label}</p>
                <div className="relative group">
                  <pre className="bg-muted/50 border border-border rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                    {snippet.code}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(snippet.code, i)}
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
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
      <div className="flex items-center gap-2 text-destructive p-4 rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Failed to load API keys. Make sure the backend is running.</span>
      </div>
    );
  }

  const keys = data?.data ?? [];
  const activeCount = keys.filter((k) => k.status === "ACTIVE").length;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Keys
            </CardTitle>
            <CardDescription>
              Your API keys for accessing the Medialane REST API. Keep them secret.
            </CardDescription>
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
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No API keys yet. Create one to start using the Medialane API.
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-sm text-primary">{k.prefix}***</code>
                      {k.label && (
                        <span className="text-xs text-muted-foreground">({k.label})</span>
                      )}
                      <Badge
                        variant={k.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          k.status === "ACTIVE"
                            ? "bg-green-500/15 text-green-600 border-green-500/30"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {k.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {k.lastUsedAt
                        ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                        : "Never used"}{" "}
                      · Created {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {k.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      disabled={revoking === k.id}
                      onClick={() => handleRevoke(k.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {actionError && (
          <div className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg border border-destructive/20 bg-destructive/5 mt-3 mx-6 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {actionError}
          </div>
        )}
      </Card>

      {/* Quickstart snippets */}
      <QuickstartCard />

      {/* Create key dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && handleCloseCreate()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          {newKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy your key now — it won&apos;t be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-lg break-all">
                  {newKey.plaintext}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
