"use client";

import { useState, useEffect } from "react";
import { adminFetch, runAdminAction } from "@/src/lib/admin-fetch";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import { Search, RefreshCw, ExternalLink, Copy, Check, Clock, X, History } from "lucide-react";
import { ipfsToHttp, timeAgo } from "@/src/lib/utils";
import { EXPLORER_URL } from "@/src/lib/constants";

const STATUS_STYLE: Record<string, string> = {
  FETCHED:  "bg-green-500/20 text-green-400 border-green-500/30",
  DONE:     "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FAILED:   "bg-red-500/20 text-red-400 border-red-500/30",
  FETCHING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const RECENT_KEY = "admin-token-lookups";
const MAX_RECENT = 6;

interface RecentEntry { contract: string; tokenId: string; name?: string; ts: number }

function getRecent(): RecentEntry[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function saveRecent(entry: RecentEntry) {
  const list = [entry, ...getRecent().filter(r => !(r.contract === entry.contract && r.tokenId === entry.tokenId))].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  return (
    <button onClick={copy} className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-muted transition-colors shrink-0" title="Copy">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenData = Record<string, any>;

export default function AdminTokensPage() {
  const [contract, setContract] = useState("");
  const [tokenId, setTokenId]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken]       = useState<TokenData | null>(null);
  const [recent, setRecent]     = useState<RecentEntry[]>([]);

  useEffect(() => { setRecent(getRecent()); }, []);

  async function handleLookup(overrideContract?: string, overrideTokenId?: string) {
    const c = (overrideContract ?? contract).trim();
    const t = (overrideTokenId  ?? tokenId).trim();
    if (!c || !t) return;
    if (overrideContract) setContract(c);
    if (overrideTokenId)  setTokenId(t);
    setLoading(true); setToken(null);
    try {
      const res = await adminFetch(`/api/admin/tokens/${c}/${t}`, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) { toast.error(res.status === 404 ? "Token not found" : "Lookup failed"); return; }
      const data = await res.json();
      const tokenData: TokenData = data.data ?? data;
      setToken(tokenData);
      const entry: RecentEntry = { contract: c, tokenId: t, name: tokenData.metadata?.name ?? tokenData.name ?? undefined, ts: Date.now() };
      saveRecent(entry); setRecent(getRecent());
    } catch { toast.error("Lookup failed"); }
    finally { setLoading(false); }
  }

  async function handleRefresh() {
    const c = contract.trim(); const t = tokenId.trim();
    if (!c || !t) return;
    setRefreshing(true);
    const r = await runAdminAction<{ metadataStatus?: string }>(`/api/admin/tokens/${c}/${t}/refresh`, { method: "POST", errorPrefix: "Refresh failed" });
    if (r) { toast.success(`Refresh queued — status: ${r.metadataStatus ?? "updated"}`); await handleLookup(); }
    setRefreshing(false);
  }

  const imgUrl = token?.metadata?.image ? ipfsToHttp(token.metadata.image) : null;
  const tokenName = token?.metadata?.name ?? token?.name ?? `#${tokenId}`;
  const attributes: Array<{ trait_type?: string; value?: unknown }> = Array.isArray(token?.metadata?.attributes) ? token.metadata.attributes : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Token Lookup</h2>
        <p className="text-sm text-muted-foreground mt-1">Find any token by contract + ID and force-refresh its metadata.</p>
      </div>

      <div className="glass rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Contract address</Label>
            <Input placeholder="0x…" value={contract} onChange={e => setContract(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLookup()} />
          </div>
          <div className="space-y-1.5">
            <Label>Token ID</Label>
            <Input placeholder="1" value={tokenId} onChange={e => setTokenId(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLookup()} />
          </div>
        </div>
        <Button onClick={() => handleLookup()} disabled={loading || !contract.trim() || !tokenId.trim()}>
          <Search className="h-4 w-4 mr-2" />{loading ? "Looking up…" : "Lookup"}
        </Button>
      </div>

      {recent.length > 0 && !token && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><History className="h-3.5 w-3.5" />Recent lookups</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button key={`${r.contract}-${r.tokenId}`} onClick={() => handleLookup(r.contract, r.tokenId)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-xs text-left">
                <div className="min-w-0">
                  <p className="font-medium truncate max-w-[160px]">{r.name ?? `#${r.tokenId}`}</p>
                  <p className="text-muted-foreground font-mono truncate max-w-[160px]">{r.contract.slice(0, 10)}…{r.contract.slice(-4)}</p>
                </div>
                <span className="text-muted-foreground shrink-0 flex items-center gap-0.5"><Clock className="h-3 w-3" />{timeAgo(new Date(r.ts).toISOString())}</span>
              </button>
            ))}
            <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />Clear
            </button>
          </div>
        </div>
      )}

      {token && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-start gap-5 p-5">
            <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
              {imgUrl ? <img src={imgUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-muted to-muted-foreground/20" />}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-lg leading-tight truncate">{tokenName}</p>
                <button onClick={() => setToken(null)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={STATUS_STYLE[token.metadataStatus] ?? ""}>{token.metadataStatus}</Badge>
                {token.metadata?.ipType && <Badge variant="outline">{token.metadata.ipType}</Badge>}
                {token.standard && <Badge variant="outline" className="text-muted-foreground">{token.standard}</Badge>}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5"><span className="text-xs text-muted-foreground w-16 shrink-0">Contract</span><span className="text-xs font-mono truncate flex-1">{contract}</span><CopyButton text={contract} /></div>
                <div className="flex items-center gap-1.5"><span className="text-xs text-muted-foreground w-16 shrink-0">Token ID</span><span className="text-xs font-mono">{tokenId}</span><CopyButton text={tokenId} /></div>
                {token.owner && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground w-16 shrink-0">Owner</span>
                    <span className="text-xs font-mono truncate flex-1">{token.owner.slice(0, 12)}…{token.owner.slice(-6)}</span>
                    <CopyButton text={token.owner} />
                  </div>
                )}
              </div>
            </div>
          </div>
          {token.tokenUri && (
            <div className="px-5 pb-3">
              <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground shrink-0">URI</span>
                <span className="text-xs font-mono truncate flex-1 text-muted-foreground">{token.tokenUri}</span>
                <CopyButton text={token.tokenUri} />
              </div>
            </div>
          )}
          {attributes.length > 0 && (
            <div className="px-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Attributes</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {attributes.map((attr, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 px-2.5 py-1.5">
                    <p className="text-[10px] text-muted-foreground truncate">{attr.trait_type ?? "—"}</p>
                    <p className="text-xs font-medium truncate">{String(attr.value ?? "—")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 flex-wrap px-5 pb-5">
            <Button size="sm" onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing…" : "Force Refresh"}
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <a href={`${EXPLORER_URL}/nft/${contract}/${tokenId}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Voyager</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
