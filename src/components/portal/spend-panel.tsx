"use client";

import useSWR from "swr";
import { Skeleton } from "@/src/components/ui/skeleton";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { groupSpend, labelForAction, shareOf, type ActionSpend } from "@/src/lib/spend-labels";

interface RecentRow {
  id: string;
  actionKey: string;
  service: string;
  units: number;
  credits: number;
  createdAt: string;
}

interface SpendData {
  data?: {
    recent?: RecentRow[];
    byAction?: ActionSpend[];
    spent?: number;
  };
}

function when(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function SpendPanel() {
  const { data, isLoading } = useSWR<SpendData>("/api/portal/spend", portalFetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) return <Skeleton className="h-40 rounded-xl" />;

  const spent = data?.data?.spent ?? 0;
  const groups = groupSpend(data?.data?.byAction ?? []);
  const recent = data?.data?.recent ?? [];

  if (spent === 0) {
    return (
      <p className="text-muted-foreground">
        Your first run will show up here, itemised by what it did.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <p className="text-3xl font-bold tabular-nums">{spent.toLocaleString()}</p>
        <p className="text-muted-foreground">credits spent so far</p>
      </div>

      <ul className="space-y-3">
        {groups.map((group) => (
          <li key={group.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span>{group.label}</span>
              <span className="tabular-nums">{group.credits.toLocaleString()}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-brand-rose"
                style={{ width: `${Math.max(2, shareOf(group.credits, spent) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {recent.length > 0 ? (
        <ul className="space-y-2 border-t border-border/60 pt-4">
          {recent.slice(0, 8).map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-4">
              <span className="text-muted-foreground">
                {labelForAction(row.actionKey)}
                {row.units > 1 ? ` ×${row.units}` : ""} · {when(row.createdAt)}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {row.credits.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
