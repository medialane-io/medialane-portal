"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { BarChart2, AlertCircle } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";

const FREE_MONTHLY_LIMIT = 50;

interface UsageDayRaw {
  day: string;
  requests: number;
}

interface ChartDay {
  date: string;
  requests: number;
}

interface RecentRow {
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number | null;
  createdAt: string;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDay(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function fillDays(raw: UsageDayRaw[]): ChartDay[] {
  const lookup = new Map<string, number>();
  for (const r of raw) {
    lookup.set(toIsoDate(new Date(r.day)), r.requests);
  }

  const result: ChartDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = toIsoDate(d);
    result.push({ date: formatDay(iso), requests: lookup.get(iso) ?? 0 });
  }
  return result;
}

/** YYYY-MM prefix for the current month */
function currentMonthPrefix(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** First day of next month as a display string */
function nextResetDate(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

function methodBadge(method: string) {
  const m = method.toUpperCase();
  if (m === "GET") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (m === "POST") return "bg-green-500/15 text-green-400 border-green-500/30";
  if (m === "DELETE") return "bg-red-500/15 text-red-400 border-red-500/30";
  return "bg-muted text-muted-foreground border";
}

function statusBadge(code: number) {
  if (code >= 200 && code < 300) return "bg-green-500/15 text-green-400 border-green-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
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
}

export function UsageTab({ address }: UsageTabProps) {
  const { data, error, isLoading } = useSWR<{ data: UsageDayRaw[] }>(
    `/api/portal/usage?address=${address}`,
    portalFetcher
  );

  const {
    data: recentData,
    error: recentError,
    isLoading: recentLoading,
  } = useSWR<{ data: RecentRow[] }>(`/api/portal/usage/recent?address=${address}`, portalFetcher);

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

  const chartData = fillDays(data?.data ?? []);
  const total = chartData.reduce((sum, d) => sum + d.requests, 0);

  // Monthly total — sum only rows whose day starts with the current YYYY-MM
  const monthPrefix = currentMonthPrefix();
  const monthlyTotal = (data?.data ?? [])
    .filter((r) => r.day.startsWith(monthPrefix))
    .reduce((sum, r) => sum + r.requests, 0);

  // Free tier by default now that MDLN-tier gating is decoupled from auth.
  const isFree = true;
  const quotaPct = Math.min((monthlyTotal / FREE_MONTHLY_LIMIT) * 100, 100);
  const quotaWarn = isFree && monthlyTotal / FREE_MONTHLY_LIMIT > 0.8;

  const recentRows = recentData?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Monthly quota bar — FREE only */}
      {isFree && (
        <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Monthly quota</span>
              <span className={quotaWarn ? "text-orange-400 font-semibold" : "text-muted-foreground"}>
                {monthlyTotal} / {FREE_MONTHLY_LIMIT} requests
              </span>
            </div>
            <Progress
              value={quotaPct}
              className={quotaWarn ? "[&>div]:bg-orange-400" : undefined}
            />
            <p className="text-xs text-muted-foreground">
              Resets on {nextResetDate()} · Upgrade to PREMIUM for unlimited access
            </p>
          </CardContent>
        </Card>
      )}

      {/* 30-day bar chart */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            API Usage — Last 30 Days
          </CardTitle>
          <CardDescription>
            Total requests:{" "}
            <span className="text-foreground font-semibold">{total.toLocaleString()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No usage data yet. Start making API calls to see activity here.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                />
                <Bar
                  dataKey="requests"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent requests table */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Requests</CardTitle>
          <CardDescription>Last 10 API calls made with your keys</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded" />
              ))}
            </div>
          ) : recentError ? (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Failed to load recent requests.
            </div>
          ) : recentRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="text-left py-2 pr-3">Method</th>
                    <th className="text-left py-2 pr-3">Path</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-right py-2 pr-3">Latency</th>
                    <th className="text-right py-2">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentRows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="py-2 pr-3">
                        <Badge className={`text-xs font-mono ${methodBadge(row.method)}`}>
                          {row.method.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                        {row.path}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge className={`text-xs font-mono ${statusBadge(row.statusCode)}`}>
                          {row.statusCode}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 text-right text-xs text-muted-foreground">
                        {row.latencyMs != null ? `${row.latencyMs}ms` : "—"}
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {relativeTime(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
