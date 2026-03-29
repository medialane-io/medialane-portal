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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Webhook, Trash2, AlertCircle, Plus, Copy, Check, Lock } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";

const ALL_EVENTS = ["ORDER_CREATED", "ORDER_FULFILLED", "ORDER_CANCELLED", "TRANSFER"] as const;
type EventType = (typeof ALL_EVENTS)[number];

interface WebhookEndpoint {
  id: string;
  url: string;
  events: EventType[];
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
}

interface Props {
  plan: string;
}

export function WebhooksTab({ plan }: Props) {
  const isPremium = plan === "PREMIUM";

  // Backend returns { data: WebhookEndpoint[] } — only reachable if PREMIUM
  const { data, error, isLoading, mutate } = useSWR<{ data: WebhookEndpoint[] }>(
    isPremium ? "/api/portal/webhooks" : null,
    portalFetcher
  );

  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<EventType>>(new Set(ALL_EVENTS));
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleEvent = (e: EventType) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      next.has(e) ? next.delete(e) : next.add(e);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/portal/webhooks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        setActionError(json?.error ?? `Failed to delete endpoint (${res.status})`);
        return;
      }
      await mutate();
    } catch {
      setActionError("Network error — please try again");
    } finally {
      setDeleting(null);
    }
  };

  const handleCreate = async () => {
    if (!urlInput || selectedEvents.size === 0) return;
    setCreating(true);
    setActionError(null);
    try {
      const res = await fetch("/api/portal/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput, events: Array.from(selectedEvents) }),
      });
      const json = await res.json().catch(() => ({})) as { data?: { secret: string }; error?: string };
      if (!res.ok) {
        setActionError(json?.error ?? `Failed to create endpoint (${res.status})`);
        return;
      }
      setNewSecret(json.data?.secret ?? null);
      await mutate();
    } catch {
      setActionError("Network error — please try again");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!newSecret) return;
    navigator.clipboard.writeText(newSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setUrlInput("");
    setSelectedEvents(new Set(ALL_EVENTS));
    setNewSecret(null);
    setCopied(false);
  };

  if (!isPremium) {
    return (
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Webhooks — PREMIUM feature</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upgrade to Premium to receive real-time event notifications via HTTP webhooks for orders
            and transfers.
          </p>
          <Button asChild variant="outline">
            <a href="mailto:api@medialane.io?subject=Premium%20Access%20Request">
              Request Premium Access
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Failed to load webhooks. Make sure the backend is running.</span>
      </div>
    );
  }

  const endpoints = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Webhook className="w-5 h-5 text-primary" />
              Webhook Endpoints
            </CardTitle>
            <CardDescription>
              Receive HTTP POST notifications for marketplace events.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Endpoint
          </Button>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No webhook endpoints yet. Add one to start receiving events.
            </div>
          ) : (
            <div className="space-y-3">
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-xs text-primary break-all">{ep.url}</code>
                      <Badge
                        variant="secondary"
                        className={
                          ep.status === "ACTIVE"
                            ? "bg-green-500/15 text-green-600 border-green-500/30"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {ep.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ep.events.map((e) => (
                        <span
                          key={e}
                          className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(ep.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {ep.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      disabled={deleting === ep.id}
                      onClick={() => handleDelete(ep.id)}
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

      {/* Create endpoint dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && handleCloseCreate()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
          </DialogHeader>
          {newSecret ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Save your signing secret now — it won&apos;t be shown again. Use it to verify the{" "}
                <code className="text-xs font-mono">x-medialane-signature</code> header on deliveries.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-lg break-all">
                  {newSecret}
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
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-server.com/webhooks/medialane"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_EVENTS.map((e) => (
                    <label
                      key={e}
                      className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(e)}
                        onChange={() => toggleEvent(e)}
                        className="accent-primary"
                      />
                      <span className="font-mono text-xs">{e}</span>
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !urlInput || selectedEvents.size === 0}
                >
                  {creating ? "Creating…" : "Add Endpoint"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
