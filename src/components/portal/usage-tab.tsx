"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { BarChart2, AlertCircle, Key } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";

// FREE rate limit is per API key, per calendar month (backend rateLimit.ts).
const FREE_MONTHLY_LIMIT = 50;

interface KeyUsage {
  prefix: string;
  label: string | null;
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
  monthlyRequestCount: number;
  monthlyResetAt: string | null;
}

// The account-admin surface (/admin/accounts/:id/usage) returns an aggregate
// monthly count plus per-key counters — not a daily series or a request log.
interface UsageData {
  data?: { totalMonthlyRequests?: number; keys?: KeyUsage[] };
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

function formatResetDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

interface UsageTabProps {
  address: string;
}

export function UsageTab({ address }: UsageTabProps) {
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
      <div className="flex items-center gap-2 text-destructive p-4 rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Failed to load usage data. Make sure the backend is running.</span>
      </div>
    );
  }

  const totalMonthlyRequests = data?.data?.totalMonthlyRequests ?? 0;
  const keys = data?.data?.keys ?? [];
  const activeKeys = keys.filter((k) => k.status === "ACTIVE");

  return (
    <div className="space-y-4">
      {/* Account-wide monthly total */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            API Usage — This Month
          </CardTitle>
          <CardDescription>
            Total requests across all your keys:{" "}
            <span className="text-foreground font-semibold">{totalMonthlyRequests.toLocaleString()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            The FREE tier allows {FREE_MONTHLY_LIMIT} requests per key each calendar month. Add credits to
            keep calling once a key is exhausted.
          </p>
        </CardContent>
      </Card>

      {/* Per-key usage */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Per-Key Usage</CardTitle>
          <CardDescription>Monthly requests for each of your API keys</CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No API keys yet. Create one in the API Keys tab to start making requests.
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((k) => {
                const pct = Math.min((k.monthlyRequestCount / FREE_MONTHLY_LIMIT) * 100, 100);
                const warn = k.status === "ACTIVE" && k.monthlyRequestCount / FREE_MONTHLY_LIMIT > 0.8;
                const reset = formatResetDate(k.monthlyResetAt);
                return (
                  <div key={k.prefix} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Key className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <code className="font-mono text-xs text-primary">{k.prefix}***</code>
                        {k.label && <span className="text-xs text-muted-foreground truncate">({k.label})</span>}
                        <Badge
                          className={
                            k.status === "ACTIVE"
                              ? "bg-green-500/15 text-green-400 border-green-500/30 text-xs"
                              : "bg-muted text-muted-foreground text-xs"
                          }
                        >
                          {k.status}
                        </Badge>
                      </div>
                      <span className={warn ? "text-orange-400 font-semibold shrink-0" : "text-muted-foreground shrink-0"}>
                        {k.monthlyRequestCount} / {FREE_MONTHLY_LIMIT}
                      </span>
                    </div>
                    <Progress value={pct} className={warn ? "[&>div]:bg-orange-400" : undefined} />
                    <p className="text-xs text-muted-foreground">
                      {k.lastUsedAt ? `Last used ${relativeTime(k.lastUsedAt)}` : "Never used"}
                      {reset ? ` · Resets ${reset}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          {keys.length > 0 && activeKeys.length === 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              All your keys are revoked. Create a new key to resume making requests.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
