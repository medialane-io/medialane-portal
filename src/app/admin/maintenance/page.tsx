"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { RefreshCw, Activity, Database, Zap, GitMerge, ShoppingCart, ListChecks } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

function adminPost(path: string, body?: unknown) {
  const proxyPath = path.replace(/^\/admin\//, "/api/admin/");
  return fetch(proxyPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function adminGet(path: string) {
  return fetch(path.replace(/^\/admin\//, "/api/admin/"), { cache: "no-store" });
}

interface ServiceCoverage {
  missingService: number;
  safeToDropSourceColumn: boolean;
  byService: { service: string | null; count: number }[];
  sampleMissing: { contractAddress: string; source: string | null }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HealthData = Record<string, any> | null;

export default function AdminMaintenancePage() {
  const [health, setHealth]                     = useState<HealthData>(null);
  const [healthLoading, setHealthLoading]       = useState(true);
  const [registryRunning, setRegistryRunning]   = useState(false);
  const [registryResult, setRegistryResult]     = useState<{ inserted: number; skipped: number } | null>(null);
  const [metaRunning, setMetaRunning]           = useState(false);
  const [metaResult, setMetaResult]             = useState<{ enqueued: number } | null>(null);
  const [transferContract, setTransferContract] = useState("");
  const [transferFromBlock, setTransferFromBlock] = useState("");
  const [transferRunning, setTransferRunning]   = useState(false);
  const [transferResult, setTransferResult]     = useState<{ inserted: number; skipped: number; metadataJobsEnqueued: number } | null>(null);
  const [coverage, setCoverage]                 = useState<ServiceCoverage | null>(null);
  const [coverageLoading, setCoverageLoading]   = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      setHealth(await res.json());
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 10000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  async function handleBackfillRegistry() {
    if (!confirm("Scan all CollectionCreated events onchain and upsert missing collections. This may take a minute. Continue?")) return;
    setRegistryRunning(true); setRegistryResult(null);
    try {
      const res = await adminPost("/admin/collections/backfill-registry");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRegistryResult(data.data);
      toast.success(`Registry backfill complete — ${data.data.inserted} inserted, ${data.data.skipped} skipped`);
    } catch { toast.error("Backfill registry failed"); }
    finally { setRegistryRunning(false); }
  }

  async function handleBackfillMetadata() {
    if (!confirm("Re-queue PENDING/FAILED collections for metadata fetch. Continue?")) return;
    setMetaRunning(true); setMetaResult(null);
    try {
      const res = await adminPost("/admin/collections/backfill-metadata");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMetaResult(data.data);
      toast.success(`Metadata backfill complete — ${data.data.enqueued} jobs enqueued`);
    } catch { toast.error("Backfill metadata failed"); }
    finally { setMetaRunning(false); }
  }

  async function handleBackfillTransfers() {
    if (!transferContract.trim()) { toast.error("Enter a contract address"); return; }
    if (!transferFromBlock.trim()) { toast.error("Enter the deployment block (check Voyager)"); return; }
    const fromBlock = Number(transferFromBlock);
    if (isNaN(fromBlock) || fromBlock < 0) { toast.error("Invalid block number"); return; }
    if (!confirm(`Scan Transfer events for ${transferContract.slice(0, 10)}… from block ${fromBlock}. This may take a minute.`)) return;
    setTransferRunning(true); setTransferResult(null);
    try {
      const res = await adminPost(`/admin/collections/${transferContract.trim()}/backfill-transfers`, { fromBlock });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTransferResult(data.data);
      toast.success(`Transfer backfill complete — ${data.data.inserted} tokens inserted, ${data.data.metadataJobsEnqueued} metadata jobs queued`);
    } catch { toast.error("Transfer backfill failed"); }
    finally { setTransferRunning(false); }
  }

  async function checkCoverage() {
    setCoverageLoading(true);
    try {
      const res = await adminGet("/admin/collections/service-coverage");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCoverage(data.data as ServiceCoverage);
      if (data.data.safeToDropSourceColumn) toast.success("Safe to drop source column — missingService = 0");
      else toast.error(`${data.data.missingService} collection(s) still missing a service`);
    } catch { toast.error("Coverage check failed"); }
    finally { setCoverageLoading(false); }
  }

  const lagBlocks = health?.indexer?.lagBlocks ?? null;
  const lagColor = lagBlocks === null ? "text-muted-foreground"
    : lagBlocks > 100 ? "text-destructive"
    : lagBlocks > 20  ? "text-yellow-500"
    : "text-green-500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Maintenance</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform health and one-click maintenance operations.</p>
      </div>

      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Indexer Health</h2>
          </div>
          <button onClick={fetchHealth} className="text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
            <RefreshCw className={cn("h-3.5 w-3.5", healthLoading && "animate-spin")} />
          </button>
        </div>

        {healthLoading && !health ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !health ? (
          <p className="text-sm text-destructive">Health check failed</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Status",     value: health.status,                    color: health.status === "ok" ? "text-green-500" : "text-destructive" },
              { label: "Database",   value: health.database,                  color: health.database === "ok" ? "text-green-500" : "text-destructive" },
              { label: "Last block", value: health.indexer?.lastBlock ?? "—", color: "text-foreground" },
              { label: "Lag",        value: lagBlocks !== null ? `${lagBlocks} blocks` : "—", color: lagColor },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className={`font-semibold font-mono text-sm ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Auto-refreshes every 10 seconds.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Operations</h2>

        <div className="glass rounded-xl p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <GitMerge className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Service Coverage</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Migration readiness for dropping the legacy <code>source</code> column.
                <code>missingService</code> must be <strong>0</strong> before the irreversible drop.
              </p>
              {coverage && (
                <div className="text-xs mt-1 space-y-0.5">
                  <p className={coverage.safeToDropSourceColumn ? "text-green-500 font-medium" : "text-destructive font-medium"}>
                    {coverage.safeToDropSourceColumn ? "✓ Safe to drop" : "✗ Not safe"} — missingService = {coverage.missingService}
                  </p>
                  <p className="text-muted-foreground">
                    {coverage.byService.map(b => `${b.service ?? "∅"}: ${b.count}`).join("  ·  ")}
                  </p>
                  {coverage.sampleMissing.length > 0 && (
                    <p className="text-destructive/80 font-mono break-all">
                      {coverage.sampleMissing.map(s => `${s.contractAddress.slice(0, 10)}…(${s.source ?? "null"})`).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={checkCoverage} disabled={coverageLoading} className="shrink-0">
            {coverageLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Check"}
          </Button>
        </div>

        <div className="glass rounded-xl p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Database className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Backfill Registry</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scans all <code>CollectionCreated</code> events onchain and upserts any collections missing from the database.
                Run this when collections were created but never indexed.
              </p>
              {registryResult && (
                <p className="text-xs text-green-500 mt-1 font-medium">
                  ✓ {registryResult.inserted} inserted, {registryResult.skipped} skipped
                </p>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleBackfillRegistry} disabled={registryRunning} className="shrink-0">
            {registryRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Run"}
          </Button>
        </div>

        <div className="glass rounded-xl p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Backfill Metadata</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Re-enqueues <code>COLLECTION_METADATA_FETCH</code> jobs for all collections that are
                PENDING, FAILED, missing a name, or missing an owner. Run when collection images are missing.
              </p>
              {metaResult && (
                <p className="text-xs text-green-500 mt-1 font-medium">✓ {metaResult.enqueued} jobs enqueued</p>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleBackfillMetadata} disabled={metaRunning} className="shrink-0">
            {metaRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Run"}
          </Button>
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <GitMerge className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Backfill Transfers</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scans historical ERC-721 Transfer events for a specific collection and inserts any missing token rows.
                Use when a collection was registered after its mints already happened. Get the deployment block from Voyager.
              </p>
              {transferResult && (
                <p className="text-xs text-green-500 mt-1 font-medium">
                  ✓ {transferResult.inserted} tokens inserted, {transferResult.skipped} skipped, {transferResult.metadataJobsEnqueued} metadata jobs queued
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <Label className="text-xs">Contract address</Label>
                  <Input placeholder="0x…" value={transferContract} onChange={e => setTransferContract(e.target.value)} className="h-8 text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Deployment block (from Voyager)</Label>
                  <Input placeholder="e.g. 7500000" value={transferFromBlock} onChange={e => setTransferFromBlock(e.target.value)} className="h-8 text-xs" type="number" min="0" />
                </div>
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleBackfillTransfers} disabled={transferRunning || !transferContract.trim() || !transferFromBlock.trim()}>
            {transferRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            {transferRunning ? "Running…" : "Run"}
          </Button>
        </div>
      </div>

      <MarketplaceOps />
      <PopAllowlist />
    </div>
  );
}

function MarketplaceOps() {
  const [orderHash, setOrderHash] = useState("");
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, path: string, confirmMsg?: string, body?: unknown) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusy(key);
    try {
      const res = await adminPost(path, body);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${key} complete`);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : `${key} failed`);
    } finally { setBusy(null); }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <ShoppingCart className="h-3.5 w-3.5" />Marketplace Ops
      </h2>

      <div className="glass rounded-xl p-5 space-y-3">
        <div>
          <p className="font-semibold text-sm">Order by hash</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Resync re-reads order details from chain (fixes a wrong price). Cancel marks an order the indexer
            missed as CANCELLED in the index — it does not touch the chain.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1 flex-1 min-w-[260px]">
            <Label className="text-xs">Order hash</Label>
            <Input placeholder="0x…" value={orderHash} onChange={e => setOrderHash(e.target.value)} className="h-8 text-xs font-mono" />
          </div>
          <Button size="sm" variant="outline" disabled={!orderHash.trim() || !!busy}
            onClick={() => run("Resync", `/admin/orders/${orderHash.trim()}/resync`)}>
            {busy === "Resync" ? "Running…" : "Resync"}
          </Button>
          <Button size="sm" variant="outline" className="text-destructive" disabled={!orderHash.trim() || !!busy}
            onClick={() => run("Cancel", `/admin/orders/${orderHash.trim()}/cancel`, "Mark this order CANCELLED in the index? Only do this if it is already cancelled on-chain.")}>
            {busy === "Cancel" ? "Running…" : "Force-cancel"}
          </Button>
        </div>
      </div>

      <div className="glass rounded-xl p-5 space-y-3">
        <div>
          <p className="font-semibold text-sm">Hydrate from transaction</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Re-index a transaction the indexer missed: pulls OrderCreated or NFT Transfer events from the
            receipt and writes the rows.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1 flex-1 min-w-[260px]">
            <Label className="text-xs">Transaction hash</Label>
            <Input placeholder="0x…" value={txHash} onChange={e => setTxHash(e.target.value)} className="h-8 text-xs font-mono" />
          </div>
          <Button size="sm" variant="outline" disabled={!txHash.trim() || !!busy}
            onClick={() => run("Order hydrate", `/admin/marketplace/tx/${txHash.trim()}/hydrate`)}>
            {busy === "Order hydrate" ? "Running…" : "Hydrate orders"}
          </Button>
          <Button size="sm" variant="outline" disabled={!txHash.trim() || !!busy}
            onClick={() => run("Transfer hydrate", `/admin/transfers/tx/${txHash.trim()}/hydrate`)}>
            {busy === "Transfer hydrate" ? "Running…" : "Hydrate transfers"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PopAllowlist() {
  const [collection, setCollection] = useState("");
  const [addresses, setAddresses] = useState("");
  const [busy, setBusy] = useState<"add" | "remove" | null>(null);

  function parseAddresses(): string[] {
    return addresses.split(/[\s,;]+/).map(a => a.trim()).filter(Boolean);
  }

  async function submit(action: "add" | "remove") {
    const list = parseAddresses();
    if (!collection.trim()) { toast.error("Enter the collection address"); return; }
    if (list.length === 0) { toast.error("Enter at least one wallet address"); return; }
    if (!confirm(`${action === "add" ? "Add" : "Remove"} ${list.length} wallet(s) ${action === "add" ? "to" : "from"} the allowlist?`)) return;
    setBusy(action);
    try {
      const res = await fetch("/api/admin/pop/allowlist", {
        method: action === "add" ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionAddress: collection.trim(), addresses: list }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(action === "add"
        ? `Allowlist updated — ${data.data.inserted} new of ${data.data.total}`
        : `Removed ${data.data.removed} entr${data.data.removed === 1 ? "y" : "ies"}`);
      setAddresses("");
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Allowlist update failed");
    } finally { setBusy(null); }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <ListChecks className="h-3.5 w-3.5" />POP / Drop Allowlist
      </h2>
      <div className="glass rounded-xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">
          Bulk add or remove wallets on a POP or Collection Drop allowlist. Paste addresses separated by
          newlines, commas, or spaces (max 10,000 per batch).
        </p>
        <div className="space-y-1">
          <Label className="text-xs">Collection address</Label>
          <Input placeholder="0x…" value={collection} onChange={e => setCollection(e.target.value)} className="h-8 text-xs font-mono" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Wallet addresses</Label>
          <Textarea placeholder={"0x…\n0x…"} value={addresses} onChange={e => setAddresses(e.target.value)} className="text-xs font-mono h-28 resize-y" />
          <p className="text-[10px] text-muted-foreground">{parseAddresses().length} address(es) detected</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={!!busy} onClick={() => submit("add")}>{busy === "add" ? "Adding…" : "Add to allowlist"}</Button>
          <Button size="sm" variant="outline" className="text-destructive" disabled={!!busy} onClick={() => submit("remove")}>
            {busy === "remove" ? "Removing…" : "Remove"}
          </Button>
        </div>
      </div>
    </div>
  );
}
