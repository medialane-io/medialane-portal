"use client";

import { useState, useRef, useCallback } from "react";
import { useAdminCollections } from "@/src/hooks/use-admin";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
import {
  ExternalLink, RefreshCw, Plus, Download, EyeOff, Eye,
  Trash2, Pencil, BarChart3, ChevronLeft, ChevronRight,
  Star, Search, SlidersHorizontal, Users, Layers,
} from "lucide-react";
import { ipfsToHttp, formatDisplayPrice } from "@/src/lib/utils";
import { EXPLORER_URL } from "@/src/lib/constants";
import type { AdminCollectionRecord } from "@/src/types/admin";

const PAGE_SIZE = 20;

const SOURCE_STYLE: Record<string, string> = {
  MEDIALANE_ERC721:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MEDIALANE_ERC1155:  "bg-teal-500/20 text-teal-400 border-teal-500/30",
  EXTERNAL_ERC721:    "bg-gray-500/20 text-gray-400 border-gray-500/30",
  EXTERNAL_ERC1155:   "bg-slate-500/20 text-slate-400 border-slate-500/30",
  MEDIALANE_REGISTRY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EXTERNAL:           "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PARTNERSHIP:        "bg-purple-500/20 text-purple-400 border-purple-500/30",
  GAME:               "bg-green-500/20 text-green-400 border-green-500/30",
  IP_TICKET:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  IP_CLUB:            "bg-pink-500/20 text-pink-400 border-pink-500/30",
  POP_PROTOCOL:       "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  COLLECTION_DROP:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};
const STATUS_STYLE: Record<string, string> = {
  FETCHED:  "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FETCHING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  FAILED:   "bg-red-500/20 text-red-400 border-red-500/30",
};
const STANDARD_STYLE: Record<string, string> = {
  ERC721:  "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  ERC1155: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  UNKNOWN: "bg-muted/50 text-muted-foreground",
};
const SOURCES = [
  "MEDIALANE_ERC721", "MEDIALANE_ERC1155",
  "EXTERNAL_ERC721", "EXTERNAL_ERC1155",
  "EXTERNAL", "PARTNERSHIP", "GAME",
  "IP_TICKET", "IP_CLUB", "MEDIALANE_REGISTRY",
  "POP_PROTOCOL", "COLLECTION_DROP",
];

async function adminFetch(path: string, opts: RequestInit = {}) {
  const proxyPath = path.replace(/^\/admin\//, "/api/admin/");
  return fetch(proxyPath, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers as Record<string, string>) },
  });
}

function CollectionThumb({ col }: { col: AdminCollectionRecord }) {
  const src = col.image ? ipfsToHttp(col.image) : null;
  const srcStyle = SOURCE_STYLE[col.source] ?? SOURCE_STYLE.EXTERNAL;
  return (
    <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-border bg-muted">
      {src ? (
        <img src={src} alt={col.name ?? ""} className="h-full w-full object-cover" />
      ) : (
        <div className={`h-full w-full flex items-center justify-center text-[10px] font-bold uppercase ${srcStyle}`}>
          {(col.name ?? col.source).slice(0, 2)}
        </div>
      )}
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="glass rounded-lg p-4 flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-72" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-8 rounded-md" />)}
      </div>
    </div>
  );
}

function CollectionRow({
  col, onFeature, onHide, onBackfill, onRefresh, onStatsRefresh, onEdit, onDelete,
}: {
  col: AdminCollectionRecord;
  onFeature: (addr: string, current: boolean) => void;
  onHide: (addr: string, current: boolean) => void;
  onBackfill: (addr: string) => void;
  onRefresh: (addr: string) => void;
  onStatsRefresh: (addr: string) => void;
  onEdit: (col: AdminCollectionRecord) => void;
  onDelete: (col: AdminCollectionRecord) => void;
}) {
  return (
    <div className={`glass rounded-lg p-4 flex items-center gap-4 transition-opacity ${col.isHidden ? "opacity-50" : ""}`}>
      <CollectionThumb col={col} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold truncate max-w-[220px]">{col.name ?? "Unnamed"}</span>
          {col.isFeatured && (
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
              <Star className="h-2.5 w-2.5" />Featured
            </Badge>
          )}
          {col.isHidden && (
            <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">Hidden</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">{col.contractAddress}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${SOURCE_STYLE[col.source] ?? SOURCE_STYLE.EXTERNAL}`}>
            {col.source.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${STATUS_STYLE[col.metadataStatus]}`}>
            {col.metadataStatus}
          </Badge>
          {col.standard && col.standard !== "UNKNOWN" && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${STANDARD_STYLE[col.standard]}`}>
              {col.standard}
            </Badge>
          )}
          {col.totalSupply != null && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Layers className="h-3 w-3" />{col.totalSupply.toLocaleString()}
            </span>
          )}
          {col.holderCount != null && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Users className="h-3 w-3" />{col.holderCount.toLocaleString()}
            </span>
          )}
          {col.floorPrice && (
            <span className="text-[10px] text-muted-foreground">Floor: {formatDisplayPrice(col.floorPrice)}</span>
          )}
          {col.claimedBy && (
            <span className="text-[10px] text-muted-foreground">Claimed: {col.claimedBy.slice(0, 8)}…</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
        <div className="flex items-center gap-1 mr-1">
          <Switch checked={col.isFeatured} onCheckedChange={() => onFeature(col.contractAddress, col.isFeatured)} id={`feat-${col.id}`} className="scale-75" />
          <Label htmlFor={`feat-${col.id}`} className="text-xs cursor-pointer text-muted-foreground">Featured</Label>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onHide(col.contractAddress, col.isHidden)} title={col.isHidden ? "Show" : "Hide"}>
          {col.isHidden ? <EyeOff className="h-3.5 w-3.5 text-destructive" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(col)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onStatsRefresh(col.contractAddress)} title="Refresh stats"><BarChart3 className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onBackfill(col.contractAddress)} title="Backfill transfers"><Download className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onRefresh(col.contractAddress)} title="Refresh metadata"><RefreshCw className="h-3.5 w-3.5" /></Button>
        <a href={`${EXPLORER_URL}/contract/${col.contractAddress}`} target="_blank" rel="noopener noreferrer">
          <Button size="icon" variant="ghost" className="h-8 w-8" title="Voyager"><ExternalLink className="h-3.5 w-3.5" /></Button>
        </a>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(col)} title="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminCollectionsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [page, setPage] = useState(1);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { collections, total, isLoading, mutate } = useAdminCollections({
    search: debouncedSearch, source: sourceFilter || undefined,
    metadataStatus: statusFilter || undefined,
    isFeatured: featuredOnly ? true : undefined,
    isHidden: showHidden ? true : undefined, page,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onSearch = useCallback((val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
  }, []);

  function resetFilters() {
    setSearch(""); setDebouncedSearch(""); setSourceFilter("");
    setStatusFilter(""); setFeaturedOnly(false); setShowHidden(false); setPage(1);
  }

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerContract, setRegisterContract] = useState("");
  const [registerSource, setRegisterSource] = useState("EXTERNAL");
  const [registerStartBlock, setRegisterStartBlock] = useState("");
  const [registering, setRegistering] = useState(false);

  async function handleRegister() {
    if (!registerContract.trim()) return;
    setRegistering(true);
    try {
      const body: Record<string, unknown> = { contractAddress: registerContract.trim(), source: registerSource };
      if (registerStartBlock.trim()) body.startBlock = parseInt(registerStartBlock.trim(), 10);
      const res = await adminFetch("/admin/collections", { method: "POST", body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success("Collection registered");
      setRegisterOpen(false); setRegisterContract(""); setRegisterStartBlock(""); setRegisterSource("EXTERNAL");
      await mutate();
    } catch { toast.error("Registration failed"); }
    finally { setRegistering(false); }
  }

  const [backfillOpen, setBackfillOpen] = useState(false);
  const [backfillContract, setBackfillContract] = useState("");
  const [backfillFromBlock, setBackfillFromBlock] = useState("");
  const [backfilling, setBackfilling] = useState(false);

  function openBackfill(contractAddress: string) { setBackfillContract(contractAddress); setBackfillFromBlock(""); setBackfillOpen(true); }

  async function handleBackfillTransfers() {
    if (!backfillContract) return;
    setBackfilling(true);
    try {
      const body: Record<string, unknown> = {};
      if (backfillFromBlock.trim()) body.fromBlock = parseInt(backfillFromBlock.trim(), 10);
      const res = await adminFetch(`/admin/collections/${backfillContract}/backfill-transfers`, { method: "POST", body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({})) as { data?: { inserted?: number; skipped?: number; metadataJobsEnqueued?: number }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      const { inserted, skipped, metadataJobsEnqueued } = json.data ?? {};
      toast.success(`Backfill complete — ${inserted} inserted, ${skipped} skipped, ${metadataJobsEnqueued} metadata jobs queued`);
      setBackfillOpen(false); await mutate();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Backfill failed"); }
    finally { setBackfilling(false); }
  }

  const [editOpen, setEditOpen] = useState(false);
  const [editCol, setEditCol] = useState<AdminCollectionRecord | null>(null);
  const [editSource, setEditSource] = useState("");
  const [saving, setSaving] = useState(false);

  function openEdit(col: AdminCollectionRecord) { setEditCol(col); setEditSource(col.source); setEditOpen(true); }

  async function handleSaveEdit() {
    if (!editCol) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/admin/collections/${editCol.contractAddress}`, { method: "PATCH", body: JSON.stringify({ source: editSource }) });
      if (!res.ok) throw new Error();
      toast.success("Collection updated"); setEditOpen(false); await mutate();
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCol, setDeleteCol] = useState<AdminCollectionRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openDelete(col: AdminCollectionRecord) { setDeleteCol(col); setDeleteOpen(true); }

  async function handleConfirmDelete() {
    if (!deleteCol) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/admin/collections/${deleteCol.contractAddress}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({})) as { data?: { deleted?: { tokens?: { count: number }; transfers?: { count: number } } }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      const { tokens, transfers } = json.data?.deleted ?? {};
      toast.success(`Deleted — ${tokens?.count ?? 0} tokens, ${transfers?.count ?? 0} transfers removed`);
      setDeleteOpen(false); await mutate();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Delete failed"); }
    finally { setDeleting(false); }
  }

  async function handleRefresh(contractAddress: string) {
    try { await adminFetch(`/admin/collections/${contractAddress}/refresh`, { method: "POST" }); toast.success("Metadata refresh queued"); }
    catch { toast.error("Refresh failed"); }
  }

  async function handleStatsRefresh(contractAddress: string) {
    try { await adminFetch(`/admin/collections/${contractAddress}/stats-refresh`, { method: "POST" }); toast.success("Stats refresh queued"); setTimeout(() => mutate(), 3000); }
    catch { toast.error("Stats refresh failed"); }
  }

  async function handleIsFeatured(contractAddress: string, current: boolean) {
    try { await adminFetch(`/admin/collections/${contractAddress}`, { method: "PATCH", body: JSON.stringify({ isFeatured: !current }) }); toast.success(current ? "Removed from featured" : "Added to featured"); await mutate(); }
    catch { toast.error("Failed to update"); }
  }

  async function handleIsHidden(contractAddress: string, current: boolean) {
    try { await adminFetch(`/admin/collections/${contractAddress}`, { method: "PATCH", body: JSON.stringify({ isHidden: !current }) }); toast.success(current ? "Collection visible" : "Collection hidden"); await mutate(); }
    catch { toast.error("Failed to update"); }
  }

  const hasFilters = !!(debouncedSearch || sourceFilter || statusFilter || featuredOnly || showHidden);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Collections</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${total.toLocaleString()} collection${total !== 1 ? "s" : ""}${hasFilters ? " matching filters" : ""}`}
          </p>
        </div>
        <Button onClick={() => setRegisterOpen(true)}><Plus className="mr-2 h-4 w-4" />Register</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input className="pl-8" placeholder="Search by name or address…" value={search} onChange={(e) => onSearch(e.target.value)} />
        </div>
        <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All sources" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All sources</SelectItem>
            {SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="FETCHED">Fetched</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FETCHING">Fetching</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={featuredOnly ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => { setFeaturedOnly(!featuredOnly); setPage(1); }}>
          <Star className="h-3.5 w-3.5" />Featured
        </Button>
        <Button variant={showHidden ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => { setShowHidden(!showHidden); setPage(1); }}>
          <EyeOff className="h-3.5 w-3.5" />Hidden
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <CollectionSkeleton key={i} />)}</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <SlidersHorizontal className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No collections found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {collections.map((col) => (
            <CollectionRow key={col.id} col={col} onFeature={handleIsFeatured} onHide={handleIsHidden} onBackfill={openBackfill} onRefresh={handleRefresh} onStatsRefresh={handleStatsRefresh} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" />Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register Collection</DialogTitle><DialogDescription>Add a contract to the platform index.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Contract Address</Label><Input placeholder="0x…" value={registerContract} onChange={(e) => setRegisterContract(e.target.value)} /></div>
            <div className="space-y-2"><Label>Source</Label>
              <Select value={registerSource} onValueChange={setRegisterSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Block <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input type="number" placeholder="e.g. 7488087" value={registerStartBlock} onChange={(e) => setRegisterStartBlock(e.target.value)} />
              <p className="text-xs text-muted-foreground">Deployment block — used for historical transfer backfill.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button disabled={registering || !registerContract.trim()} onClick={handleRegister}>{registering ? "Registering…" : "Register"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={backfillOpen} onOpenChange={setBackfillOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Backfill Transfers</DialogTitle><DialogDescription className="font-mono text-xs break-all">{backfillContract}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Scans onchain Transfer events and creates Token records for any tokens missed by the indexer.</p>
            <div className="space-y-2">
              <Label>From Block <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input type="number" placeholder="e.g. 7488087 (defaults to block 0)" value={backfillFromBlock} onChange={(e) => setBackfillFromBlock(e.target.value)} />
              <p className="text-xs text-muted-foreground">Set to the deployment block to avoid scanning the entire chain.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackfillOpen(false)}>Cancel</Button>
            <Button disabled={backfilling} onClick={handleBackfillTransfers}>{backfilling ? "Backfilling…" : "Backfill Transfers"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Edit Collection</DialogTitle><DialogDescription className="font-mono text-xs break-all">{editCol?.contractAddress}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Source</Label>
              <Select value={editSource} onValueChange={setEditSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button disabled={saving} onClick={handleSaveEdit}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete collection?</DialogTitle>
            <DialogDescription>This permanently deletes <span className="font-semibold text-foreground">{deleteCol?.name ?? "this collection"}</span> and all its tokens and transfers. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 mt-1">
            <p className="text-xs font-mono text-muted-foreground break-all">{deleteCol?.contractAddress}</p>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleConfirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />{deleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
