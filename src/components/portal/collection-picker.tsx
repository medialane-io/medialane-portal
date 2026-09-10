"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAccount } from "@starknet-react/core";
import { Popover, PopoverContent, PopoverTrigger } from "@medialane/ui";
import { ChevronDown, Check, ImageIcon, Loader2, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Skeleton } from "@/src/components/ui/skeleton";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { TaskDialog } from "@/src/components/portal/task-dialog";
import { type TaskPhase } from "@/src/lib/task-progress";

export interface CollectionOption {
  collectionId: string | null;
  contractAddress: string;
  name: string | null;
  image?: string | null;
  totalSupply?: number | null;
}

export function collectionLabel(c: CollectionOption): string {
  return c.name?.trim() || `Collection ${c.collectionId}`;
}

export function collectionWorks(c: CollectionOption): string {
  const n = c.totalSupply ?? 0;
  if (n === 0) return "No works yet";
  return `${n} ${n === 1 ? "work" : "works"}`;
}

export function CollectionPicker({
  serviceId,
  owner,
  value,
  onChange,
  disabled,
}: {
  serviceId: string;
  owner: string;
  value: string;
  onChange: (collectionId: string) => void;
  disabled?: boolean;
}) {
  const { account } = useAccount();
  const { data, isLoading, error: loadError, mutate } = useSWR<{
    collections?: CollectionOption[];
    data?: CollectionOption[];
  }>(`/api/portal/collections?service=${serviceId}`, portalFetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [activeIndex, setActiveIndex] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);

  const collections = (data?.collections ?? data?.data ?? []).filter((c) => c.collectionId);
  const selected = collections.find((c) => c.collectionId === value) ?? null;

  const filtered = query.trim()
    ? collections.filter((c) => collectionLabel(c).toLowerCase().includes(query.trim().toLowerCase()))
    : collections;

  async function create() {
    if (!account) return;
    setBusy(true);
    setError(null);
    setOutOfCredits(false);
    setPhase("running");
    setActiveIndex(0);
    setDetail("Confirm in your wallet");
    try {
      const res = await fetch("/api/portal/intents/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CREATE_COLLECTION",
          owner,
          name: name.trim(),
          symbol: symbol.trim(),
          baseUri: "",
          service: serviceId,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setOutOfCredits(true);
        setPhase("error");
        return;
      }
      if (!res.ok) throw new Error(body?.error ?? "Could not prepare the collection");

      setActiveIndex(1);
      setDetail("Waiting for the transaction");
      const tx = await account.execute(body.data.calls);
      await account.waitForTransaction(tx.transaction_hash);

      setActiveIndex(2);
      setDetail("Waiting for it to be indexed");
      const created = await waitForCollection(collections.length, mutate);
      if (created?.collectionId) onChange(created.collectionId);

      setPhase("success");
      setCreating(false);
      setName("");
      setSymbol("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the collection.");
      setPhase("error");
    } finally {
      setBusy(false);
      setDetail(null);
    }
  }

  const dialog = (
    <TaskDialog
      open={phase !== "idle"}
      title="Creating your collection"
      labels={["Prepare it", "Confirm onchain", "Make it available"]}
      activeIndex={activeIndex}
      phase={phase}
      detail={detail}
      error={error}
      outOfCredits={outOfCredits}
      successLine="Your collection is ready"
      onClose={() => setPhase("idle")}
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Collection *</Label>
        <Skeleton className="h-[4.25rem] rounded-xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-2">
        <Label>Collection *</Label>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-destructive">
            {loadError instanceof Error ? loadError.message : "Could not load your collections."}
          </p>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="space-y-2">
        {dialog}
        <Label>New collection</Label>
        <div className="space-y-3 rounded-xl border border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="col-name">Name</Label>
              <Input
                id="col-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Research archive"
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="col-symbol">Symbol</Label>
              <Input
                id="col-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="ARCH"
                disabled={busy}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            You own this collection, and you are the only one who can issue into it.
          </p>

          <div className="flex gap-2">
            <Button onClick={create} disabled={busy || !name.trim() || !symbol.trim()} size="sm">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? "Creating" : "Create"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Collection *</Label>
        <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Everything you tokenize lives in a collection you own.
          </p>
          <Button size="sm" onClick={() => setCreating(true)} disabled={disabled}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create your first collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dialog}
      <Label>Collection *</Label>
      <div className="flex gap-2">
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-expanded={open}
              disabled={disabled}
              className="flex flex-1 items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-50"
            >
              <Thumb image={selected?.image} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {selected ? collectionLabel(selected) : "Choose a collection"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected ? collectionWorks(selected) : "Where this will live"}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0">
                Change
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            {collections.length > 5 ? (
              <div className="border-b border-border p-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search collections…"
                  className="h-8"
                />
              </div>
            ) : null}
            <div className="max-h-64 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No collection found.
                </p>
              ) : (
                filtered.map((col) => (
                  <button
                    key={col.collectionId!}
                    type="button"
                    onClick={() => {
                      onChange(col.collectionId!);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/60"
                  >
                    <Thumb image={col.image} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{collectionLabel(col)}</p>
                      <p className="text-xs text-muted-foreground">{collectionWorks(col)}</p>
                    </div>
                    {value === col.collectionId ? (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-border p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCreating(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm font-medium transition-colors hover:bg-muted/60"
              >
                <Plus className="h-4 w-4" />
                New collection
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function Thumb({ image }: { image?: string | null }) {
  if (!image) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  return <img src={image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />;
}

async function waitForCollection(
  previousCount: number,
  mutate: () => Promise<unknown>,
): Promise<CollectionOption | null> {
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));
    const refreshed = (await mutate()) as
      | { collections?: CollectionOption[]; data?: CollectionOption[] }
      | undefined;
    const rows = (refreshed?.collections ?? refreshed?.data ?? []).filter((c) => c.collectionId);
    if (rows.length > previousCount) return rows[rows.length - 1];
  }
  return null;
}
