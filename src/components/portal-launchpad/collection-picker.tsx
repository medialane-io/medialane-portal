"use client";

import useSWR from "swr";
import { Check, ImageIcon } from "lucide-react";
import { Label, Skeleton } from "@medialane/ui";
import type { CollectionServiceId } from "@medialane/sdk";
import { Button } from "@/components/ui/button";
import { getMedialaneClient } from "@/lib/medialane-client";
import { collectionCopy } from "@/lib/portal-launchpad/collection-copy";

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
  value,
  onChange,
  disabled,
  hideLabel,
}: {
  serviceId: CollectionServiceId;
  owner: string;
  value: string;
  onChange: (collection: CollectionOption) => void;
  disabled?: boolean;
  hideLabel?: boolean;
}) {
  const copy = collectionCopy(serviceId);
  const { data, isLoading, error: loadError, mutate } = useSWR(
    owner ? `portal-launchpad:collections:${owner}:${serviceId}` : null,
    async () => {
      const res = await getMedialaneClient().api.listCollections({ owner, page: 1, limit: 50 });
      return (res.data ?? []).filter((c) => c.service === serviceId && c.contractAddress);
    },
    { shouldRetryOnError: false, revalidateOnFocus: false },
  );

  const collections = data ?? [];

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

  return (
    <div className="space-y-2">
      {hideLabel ? null : <Label>{copy.label}</Label>}

      <div className="grid gap-3 sm:grid-cols-2">
        {collections.map((c) => {
          const selected = value === c.contractAddress;
          return (
            <button
              key={c.contractAddress}
              type="button"
              disabled={disabled}
              onClick={() => onChange(c)}
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

        {collections.length === 0 ? <p className="text-muted-foreground">{copy.empty}</p> : null}
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
