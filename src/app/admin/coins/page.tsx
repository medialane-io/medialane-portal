"use client";

import { useState, useRef, useCallback } from "react";
import { useAdminCoins } from "@/src/hooks/use-admin";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
import { ExternalLink, RefreshCw, Plus, EyeOff, Eye, Pencil, Search } from "lucide-react";
import { ipfsToHttp } from "@/src/lib/utils";
import { EXPLORER_URL } from "@/src/lib/constants";
import type { AdminCoinRecord } from "@/src/types/admin";

const PAGE_SIZE = 20;

async function adminFetch(path: string, opts: RequestInit = {}) {
  const proxyPath = path.replace(/^\/admin\//, "/api/admin/");
  return fetch(proxyPath, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers as Record<string, string>) },
  });
}

function CoinThumb({ coin }: { coin: AdminCoinRecord }) {
  const src = coin.image ? ipfsToHttp(coin.image) : null;
  return (
    <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border border-border bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={coin.name ?? ""} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">
          {(coin.symbol ?? coin.name ?? "?").slice(0, 2)}
        </div>
      )}
    </div>
  );
}

export default function AdminCoinsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { coins, total, isLoading, mutate } = useAdminCoins({ search: debouncedSearch, page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onSearch = useCallback((val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
  }, []);

  // ── Add external coin ────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [addContract, setAddContract] = useState("");
  const [addOwner, setAddOwner] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!addContract.trim()) return;
    setAdding(true);
    try {
      const body: Record<string, unknown> = { contractAddress: addContract.trim() };
      if (addOwner.trim()) body.owner = addOwner.trim();
      const res = await adminFetch("/admin/coins/add-external", { method: "POST", body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("External coin added");
      setAddOpen(false); setAddContract(""); setAddOwner(""); await mutate();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Add failed"); }
    finally { setAdding(false); }
  }

  // ── Edit dialog ──────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editCoin, setEditCoin] = useState<AdminCoinRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editSymbol, setEditSymbol] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editService, setEditService] = useState("");
  const [editCreator, setEditCreator] = useState("");
  const [saving, setSaving] = useState(false);

  function openEdit(coin: AdminCoinRecord) {
    setEditCoin(coin);
    setEditName(coin.name ?? ""); setEditSymbol(coin.symbol ?? "");
    setEditImage(coin.image ?? ""); setEditDescription(coin.description ?? "");
    setEditService(coin.service ?? ""); setEditCreator(coin.creator ?? "");
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!editCoin) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/admin/coins/${editCoin.contractAddress}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(editName.trim() ? { name: editName.trim() } : {}),
          ...(editSymbol.trim() ? { symbol: editSymbol.trim() } : {}),
          ...(editImage.trim() ? { image: editImage.trim() } : {}),
          ...(editDescription.trim() ? { description: editDescription.trim() } : {}),
          ...(editService.trim() ? { service: editService.trim() } : {}),
          ...(editCreator.trim() ? { creator: editCreator.trim() } : {}),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Coin updated");
      setEditOpen(false); await mutate();
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  }

  async function handleHide(coin: AdminCoinRecord) {
    try {
      await adminFetch(`/admin/coins/${coin.contractAddress}`, { method: "PATCH", body: JSON.stringify({ isHidden: !coin.isHidden }) });
      toast.success(coin.isHidden ? "Coin visible on platform" : "Coin hidden from platform");
      await mutate();
    } catch { toast.error("Failed to update"); }
  }

  async function handleRefresh(coin: AdminCoinRecord) {
    try {
      await adminFetch(`/admin/coins/${coin.contractAddress}/refresh`, { method: "POST" });
      toast.success("Metadata refreshed");
      setTimeout(() => mutate(), 1500);
    } catch { toast.error("Refresh failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Coins</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${total.toLocaleString()} coin${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" />Add external coin</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input className="pl-8" placeholder="Search by name, symbol, or address…" value={search} onChange={(e) => onSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
      ) : coins.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No coins found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coins.map((coin) => (
            <div key={coin.id} className={`glass rounded-lg p-4 flex items-center gap-4 transition-opacity ${coin.isHidden ? "opacity-50" : ""}`}>
              <CoinThumb coin={coin} />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate max-w-[220px]">{coin.name ?? "Unnamed"}</span>
                  {coin.symbol && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{coin.symbol}</Badge>}
                  {coin.isHidden && <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">Hidden</Badge>}
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">{coin.contractAddress}</p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{coin.service}</Badge>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 justify-end">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleHide(coin)} title={coin.isHidden ? "Show on platform" : "Hide from platform"}>
                  {coin.isHidden ? <EyeOff className="h-3.5 w-3.5 text-destructive" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(coin)} title="Edit coin">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRefresh(coin)} title="Refresh metadata">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <a href={`${EXPLORER_URL}/contract/${coin.contractAddress}`} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost" className="h-8 w-8" title="View on Voyager"><ExternalLink className="h-3.5 w-3.5" /></Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add external coin</DialogTitle>
            <DialogDescription>Index an Unruggable-launched ERC-20 (verified via the factory).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Contract Address</Label>
              <Input placeholder="0x…" value={addContract} onChange={(e) => setAddContract(e.target.value)} /></div>
            <div className="space-y-2"><Label>Owner <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input placeholder="0x…" value={addOwner} onChange={(e) => setAddOwner(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={adding || !addContract.trim()} onClick={handleAdd}>{adding ? "Adding…" : "Add coin"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Coin</DialogTitle>
            <DialogDescription className="font-mono text-xs break-all">{editCoin?.contractAddress}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Symbol</Label><Input value={editSymbol} onChange={(e) => setEditSymbol(e.target.value)} /></div>
            <div className="space-y-2"><Label>Image (URL or ipfs://…)</Label>
              <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="ipfs://… or https://…" />
              {editImage.trim() && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editImage.trim().startsWith("ipfs://") ? `https://ipfs.io/ipfs/${editImage.trim().slice(7)}` : editImage.trim()}
                  alt="" className="mt-1 h-12 w-12 rounded-full border border-white/10 object-cover" />
              )}
            </div>
            <div className="space-y-2"><Label>Description</Label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
            <div className="space-y-2"><Label>Service</Label><Input value={editService} onChange={(e) => setEditService(e.target.value)} placeholder="creator-coin | external-erc20" /></div>
            <div className="space-y-2"><Label>Creator</Label><Input value={editCreator} onChange={(e) => setEditCreator(e.target.value)} placeholder="0x…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button disabled={saving} onClick={handleSaveEdit}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
