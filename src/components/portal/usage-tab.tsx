"use client";

import useSWR from "swr";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { BarChart2, AlertCircle, Key, Coins, ArrowRight } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";

interface KeyUsage {
  prefix: string;
  label: string | null;
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
}

interface UsageData {
  data?: { keys?: KeyUsage[] };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface UsageTabProps {
  address: string;
  onViewCredits?: () => void;
}

export function UsageTab({ address, onViewCredits }: UsageTabProps) {
  const { data, error, isLoading } = useSWR<UsageData>(
    `/api/portal/usage?address=${address}`,
    portalFetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 rounded-xl bg-destructive/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Failed to load usage data. Make sure the backend is running.</span>
      </div>
    );
  }

  const keys = data?.data?.keys ?? [];
  const activeKeys = keys.filter((k) => k.status === "ACTIVE");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
            <BarChart2 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">API Usage</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Every call is credit-metered, drawn from the same
              balance no matter which key made it.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewCredits}
          className="inline-flex items-center gap-1.5 text-sm text-brand-rose hover:underline mt-4 rounded-xl bg-brand-rose/10 px-3 py-2"
        >
          <Coins className="w-3.5 h-3.5" />
          View your balance and top-up history
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Your API keys</h3>
        <p className="text-xs text-muted-foreground mb-5">Status and last activity for each key.</p>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 gap-3 rounded-2xl bg-muted/30">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
              <Key className="w-6 h-6" />
            </span>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create your first API key in the API Keys tab to start making requests.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.prefix} className="flex items-center justify-between gap-2 text-sm rounded-xl bg-muted/30 p-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                    <Key className="w-3 h-3" />
                  </span>
                  <code className="font-mono text-xs text-foreground">{k.prefix}***</code>
                  {k.label && <span className="text-xs text-muted-foreground truncate">({k.label})</span>}
                  <Badge
                    className={
                      k.status === "ACTIVE"
                        ? "bg-brand-orange/15 text-brand-orange border-transparent text-xs"
                        : "bg-muted text-muted-foreground border-transparent text-xs"
                    }
                  >
                    {k.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {k.lastUsedAt ? `Last used ${relativeTime(k.lastUsedAt)}` : "Never used"}
                </span>
              </div>
            ))}
          </div>
        )}
        {keys.length > 0 && activeKeys.length === 0 && (
          <p className="mt-4 text-xs text-muted-foreground">
            All your keys are revoked. Create a new key to resume making requests.
          </p>
        )}
      </div>
    </div>
  );
}
