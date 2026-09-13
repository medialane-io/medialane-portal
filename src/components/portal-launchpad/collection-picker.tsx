"use client";

import { useState } from "react";
import useSWR from "swr";
import { Check, ImageIcon, Loader2, Plus } from "lucide-react";
import { Label, Skeleton } from "@medialane/ui";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import type { CollectionServiceId } from "@medialane/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMedialaneClient } from "@/lib/medialane-client";
import { createCollection } from "@/lib/portal-launchpad/issue";
import { collectionCopy, isTicketService } from "@/lib/portal-launchpad/collection-copy";
import { TaskDialog } from "./task-dialog";
import { type TaskPhase } from "@/lib/portal-launchpad/task-progress";

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

export function CollectionPicker({
  serviceId,
  owner,
  signer,
  value,
  onChange,
  disabled,
  hideLabel,
}: {
  serviceId: CollectionServiceId;
  owner: string;
  signer: StarknetVenueSigner | null;
  value: string;
  onChange: (contractAddress: string) => void;
  disabled?: boolean;
  hideLabel?: boolean;
}) {
  const copy = collectionCopy(serviceId);
  const isTickets = isTicketService(serviceId);
  const { data, isLoading, error: loadError, mutate } = useSWR(
    owner ? `portal-launchpad:collections:${owner}:${serviceId}` : null,
    async () => {
      const res = await getMedialaneClient().api.getCollectionsByOwner(owner, 1, 50);
      return (res.data ?? []).filter((c) => c.service === serviceId && c.contractAddress);
    },
    { shouldRetryOnError: false, revalidateOnFocus: false },
  );

  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [servicePaused, setServicePaused] = useState(false);
  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [detail, setDetail] = useState<string | null>(null);

  const collections = data ?? [];

  async function create() {
    if (!signer) return;
    setBusy(true);
    setError(null);
    setServicePaused(false);
    setPhase("running");
    setDetail("Confirm in your wallet");
    try {
      await createCollection(signer, {
        owner,
        name: name.trim(),
        symbol: symbol.trim(),
        service: serviceId,
      });

      setDetail("Waiting for it to be indexed");
      const created = await waitForCollection(collections.length, mutate);
      if (created?.contractAddress) onChange(created.contractAddress);

      setPhase("success");
      setCreating(false);
      setName("");
      setSymbol("");
    } catch (e) {
      if (e instanceof Error && e.message.includes("402")) {
        setServicePaused(true);
      } else {
        setError(e instanceof Error ? e.message : "Could not create the collection.");
      }
      setPhase("error");
    } finally {
      setBusy(false);
      setDetail(null);
    }
  }

  const dialog = (
    <TaskDialog
      open={phase !== "idle"}
      title={copy.create}
      phase={phase}
      detail={detail}
      error={error}
      servicePaused={servicePaused}
      successLine="Ready"
      onClose={() => setPhase("idle")}
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {hideLabel ? null : <Label>{copy.label}</Label>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-2">
        {hideLabel ? null : <Label>{copy.label}</Label>}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <p className="text-destructive">Could not load these.</p>
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
        <Label>{copy.create}</Label>
        <div className="space-y-3 rounded-xl border border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="col-name">Name</Label>
              <Input
                id="col-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTickets ? "Summer series" : "Research archive"}
                className="h-12"
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="col-symbol">Short code</Label>
              <Input
                id="col-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder={isTickets ? "SUMMER" : "ARCH"}
                className="h-12"
                disabled={busy}
              />
            </div>
          </div>

          <p className="text-muted-foreground">{copy.hint}</p>

          <div className="flex gap-2">
            <Button onClick={create} disabled={busy || !name.trim() || !symbol.trim()}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? "Creating" : "Create"}
            </Button>
            {collections.length > 0 ? (
              <Button variant="ghost" onClick={() => setCreating(false)} disabled={busy}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dialog}
      {hideLabel ? null : <Label>{copy.label}</Label>}

      <div className="grid gap-3 sm:grid-cols-2">
        {collections.map((c) => {
          const selected = value === c.contractAddress;
          return (
            <button
              key={c.contractAddress}
              type="button"
              disabled={disabled}
              onClick={() => onChange(c.contractAddress)}
              className={
                selected
                  ? "flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4 text-left"
                  : "flex items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-foreground/20"
              }
            >
              <Thumb image={c.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{collectionLabel(c)}</p>
                <p className="truncate text-muted-foreground">{copy.countOf(c.totalSupply ?? 0)}</p>
              </div>
              {selected ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
            </button>
          );
        })}

        <button
          type="button"
          disabled={disabled}
          onClick={() => setCreating(true)}
          className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-left transition-colors hover:border-foreground/20"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-muted">
            <Plus className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{copy.create}</p>
            <p className="truncate text-muted-foreground">
              {collections.length === 0 ? copy.empty : copy.hint}
            </p>
          </div>
        </button>
      </div>

      {collections.length > 0 ? <p className="text-muted-foreground">{copy.hint}</p> : null}
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
  mutate: () => Promise<CollectionOption[] | undefined>,
): Promise<CollectionOption | null> {
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));
    const refreshed = (await mutate()) ?? [];
    if (refreshed.length > previousCount) return refreshed[refreshed.length - 1];
  }
  return null;
}
