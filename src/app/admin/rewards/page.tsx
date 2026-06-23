"use client";

import { useState } from "react";
import { useAdminRewardsConfig, useAdminBadges } from "@/src/hooks/use-admin";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";
import { Trophy, Play, Award, Layers, Percent } from "lucide-react";
import type { RewardAction, RewardMultiplier } from "@/src/types/admin";
import { adminFetch } from "@/src/lib/admin-fetch";

async function patchJson(url: string, body: unknown) {
  const res = await adminFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Request failed");
  }
  return res.json();
}

function ActionsCard() {
  const { actions, isLoading, mutate } = useAdminRewardsConfig();
  const [editing, setEditing] = useState<string | null>(null);
  const [xp, setXp] = useState("");
  const [dailyCap, setDailyCap] = useState("");

  function startEdit(a: RewardAction) {
    setEditing(a.type);
    setXp(String(a.xp));
    setDailyCap(a.dailyCap == null ? "" : String(a.dailyCap));
  }

  async function save(a: RewardAction) {
    try {
      await patchJson(`/api/admin/rewards/actions/${a.type}`, {
        xp: Number(xp),
        dailyCap: dailyCap.trim() === "" ? null : Number(dailyCap),
      });
      toast.success(`${a.label} updated`);
      setEditing(null);
      await mutate();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  }

  async function toggleEnabled(a: RewardAction) {
    try {
      await patchJson(`/api/admin/rewards/actions/${a.type}`, { enabled: !a.enabled });
      await mutate();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  }

  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <h2 className="font-semibold text-sm flex items-center gap-2"><Layers className="h-4 w-4" />Action XP weights</h2>
      {isLoading ? <Skeleton className="h-32 w-full" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="text-left pb-2 pr-3">Action</th>
                <th className="text-left pb-2 pr-3">XP</th>
                <th className="text-left pb-2 pr-3">Daily cap</th>
                <th className="text-left pb-2 pr-3">Enabled</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {actions.map((a) => (
                <tr key={a.type} className={a.enabled ? "" : "opacity-50"}>
                  <td className="py-2 pr-3">
                    <p className="text-xs font-medium">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{a.type}</p>
                  </td>
                  {editing === a.type ? (
                    <>
                      <td className="py-2 pr-3"><Input value={xp} onChange={(e) => setXp(e.target.value)} className="h-7 w-20 text-xs" type="number" min="0" /></td>
                      <td className="py-2 pr-3"><Input value={dailyCap} onChange={(e) => setDailyCap(e.target.value)} placeholder="none" className="h-7 w-20 text-xs" type="number" min="0" /></td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-3 font-mono text-xs">{a.xp}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{a.dailyCap ?? "—"}</td>
                    </>
                  )}
                  <td className="py-2 pr-3">
                    <Switch checked={a.enabled} onCheckedChange={() => toggleEnabled(a)} />
                  </td>
                  <td className="py-2 text-right">
                    {editing === a.type ? (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" className="h-6 px-2 text-xs" onClick={() => save(a)}>Save</Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => startEdit(a)}>Edit</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MultipliersCard() {
  const { multipliers, isLoading, mutate } = useAdminRewardsConfig();
  const [editing, setEditing] = useState<string | null>(null);
  const [factor, setFactor] = useState("");

  async function save(m: RewardMultiplier) {
    try {
      await patchJson(`/api/admin/rewards/multipliers/${m.id}`, { factor: Number(factor) });
      toast.success(`${m.name} updated`);
      setEditing(null);
      await mutate();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  }

  async function toggleEnabled(m: RewardMultiplier) {
    try {
      await patchJson(`/api/admin/rewards/multipliers/${m.id}`, { enabled: !m.enabled });
      await mutate();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  }

  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <h2 className="font-semibold text-sm flex items-center gap-2"><Percent className="h-4 w-4" />Multipliers</h2>
      {isLoading ? <Skeleton className="h-20 w-full" /> : (
        <div className="space-y-2">
          {multipliers.map((m) => (
            <div key={m.id} className={`flex items-center gap-3 p-3 border border-border rounded-lg ${m.enabled ? "" : "opacity-50"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{m.name}</p>
                {m.description && <p className="text-[10px] text-muted-foreground">{m.description}</p>}
              </div>
              {editing === m.id ? (
                <>
                  <Input value={factor} onChange={(e) => setFactor(e.target.value)} className="h-7 w-20 text-xs" type="number" step="0.1" min="0" />
                  <Button size="sm" className="h-6 px-2 text-xs" onClick={() => save(m)}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="font-mono text-xs">{m.factor}×</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => { setEditing(m.id); setFactor(String(m.factor)); }}>Edit</Button>
                </>
              )}
              <Switch checked={m.enabled} onCheckedChange={() => toggleEnabled(m)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BadgesCard() {
  const { badges, isLoading, mutate } = useAdminBadges();
  const [address, setAddress] = useState("");
  const [badgeKey, setBadgeKey] = useState("");
  const [awarding, setAwarding] = useState(false);

  async function toggleEnabled(key: string, enabled: boolean) {
    try {
      await patchJson(`/api/admin/rewards/badges/${key}`, { enabled: !enabled });
      await mutate();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  }

  async function award() {
    if (!address.trim() || !badgeKey) { toast.error("Address and badge are required"); return; }
    setAwarding(true);
    try {
      const res = await adminFetch(`/api/admin/rewards/badges/${address.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Award failed");
      toast.success("Badge awarded");
      setAddress("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Award failed"); }
    finally { setAwarding(false); }
  }

  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <h2 className="font-semibold text-sm flex items-center gap-2"><Award className="h-4 w-4" />Badges</h2>
      {isLoading ? <Skeleton className="h-24 w-full" /> : (
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <button key={b.key} onClick={() => toggleEnabled(b.key, b.enabled)} title={`${b.description} — click to ${b.enabled ? "disable" : "enable"}`}>
              <Badge
                variant="outline"
                className={`text-[10px] cursor-pointer ${b.enabled ? "" : "opacity-40 line-through"}`}
                style={b.color ? { borderColor: `${b.color}66`, color: b.color } : undefined}>
                {b.icon ? `${b.icon} ` : ""}{b.name}
              </Badge>
            </button>
          ))}
        </div>
      )}
      <div className="border-t border-border pt-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Manually award a badge</p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label className="text-xs">Wallet address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x…" className="h-8 text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Badge</Label>
            <select value={badgeKey} onChange={(e) => setBadgeKey(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1.5 text-xs h-8 focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Select…</option>
              {badges.map((b) => <option key={b.key} value={b.key}>{b.name}</option>)}
            </select>
          </div>
          <Button size="sm" disabled={awarding} onClick={award}>{awarding ? "Awarding…" : "Award"}</Button>
        </div>
      </div>
    </div>
  );
}

function ComputeCard() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  async function compute(dryRun: boolean) {
    if (!dryRun && !confirm("Recompute all scores, point events, and badges from scratch? This truncates and rebuilds the reward tables.")) return;
    setRunning(true); setOutput(null);
    try {
      const res = await adminFetch(`/api/admin/rewards/compute${dryRun ? "?dry_run=true" : ""}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutput(data.output ?? "");
      toast.success(`Computation complete in ${(data.elapsedMs / 1000).toFixed(1)}s${dryRun ? " (dry run)" : ""}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Computation failed"); }
    finally { setRunning(false); }
  }

  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Play className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Recompute scores</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Retroactive XP + badge computation over all indexed activity. Run after changing weights.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" disabled={running} onClick={() => compute(true)}>Dry run</Button>
          <Button size="sm" disabled={running} onClick={() => compute(false)}>{running ? "Running…" : "Compute"}</Button>
        </div>
      </div>
      {output != null && (
        <pre className="text-[10px] text-muted-foreground bg-muted rounded-lg p-3 overflow-x-auto max-h-48 whitespace-pre-wrap">{output}</pre>
      )}
    </div>
  );
}

export default function AdminRewardsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2"><Trophy className="h-5 w-5" />Rewards</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          DAO-managed XP system — weights live in the database, changes apply without a deploy.
        </p>
      </div>
      <ComputeCard />
      <ActionsCard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MultipliersCard />
        <BadgesCard />
      </div>
    </div>
  );
}
