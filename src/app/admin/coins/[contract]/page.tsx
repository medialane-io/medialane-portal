"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminCoins } from "@/src/hooks/use-admin";
import { adminFetch } from "@/src/lib/admin-fetch";
import { useIpfsUpload } from "@/src/hooks/useIpfs";
import MediaUploader from "@/src/components/mediaUploader";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { ipfsToHttp } from "@/src/lib/utils";
import { EXPLORER_URL } from "@/src/lib/constants";

export default function CoinSettingsPage() {
  const router = useRouter();
  const params = useParams<{ contract: string }>();
  const contract = params.contract;

  const { coins, isLoading, mutate } = useAdminCoins({ search: contract });
  const coin = coins.find((c) => c.contractAddress.toLowerCase() === contract.toLowerCase());

  const { uploadToIpfs, progress } = useIpfsUpload();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [service, setService] = useState("");
  const [creator, setCreator] = useState("");
  const [hidden, setHidden] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

  // Seed the form once the coin record arrives.
  useEffect(() => {
    if (coin && !seeded) {
      setName(coin.name ?? "");
      setSymbol(coin.symbol ?? "");
      setDescription(coin.description ?? "");
      setService(coin.service ?? "");
      setCreator(coin.creator ?? "");
      setHidden(coin.isHidden);
      setImageUrl(coin.image ?? "");
      setSeeded(true);
    }
  }, [coin, seeded]);

  async function handleSave() {
    if (!coin) return;
    setSaving(true);
    setStatus(null);

    // 1) Resolve the image — upload the chosen file (or use a pasted URL).
    //    A failed upload aborts the save with a specific reason; nothing is persisted.
    let image: string | undefined;
    if (imageFile) {
      try {
        const { fileUrl } = await uploadToIpfs(imageFile, { name: name || coin.contractAddress, description: description || "" });
        image = fileUrl;
      } catch (err) {
        setSaving(false);
        setStatus({ type: "error", message: `Image upload failed: ${err instanceof Error ? err.message : "unknown error"}. No changes were saved.` });
        return;
      }
    } else if (
      imageUrl &&
      imageUrl !== (coin.image ?? "") &&
      !imageUrl.startsWith("data:") &&
      !imageUrl.startsWith("blob:")
    ) {
      image = imageUrl;
    }

    // 2) Persist the coin fields.
    try {
      const patch: Record<string, unknown> = { isHidden: hidden };
      if (name.trim()) patch.name = name.trim();
      if (symbol.trim()) patch.symbol = symbol.trim();
      if (description.trim()) patch.description = description.trim();
      if (service.trim()) patch.service = service.trim();
      if (creator.trim()) patch.creator = creator.trim();
      if (image) patch.image = image;

      const res = await adminFetch(`/admin/coins/${coin.contractAddress}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server responded ${res.status}`);
      }
      await mutate();
      setImageFile(null);
      setStatus({ type: "success", message: "Changes saved." });
    } catch (err) {
      setStatus({ type: "error", message: `Save failed: ${err instanceof Error ? err.message : "unknown error"}` });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading && !coin) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/coins")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to coins
        </Button>
        <p className="text-sm text-muted-foreground">
          Coin not found for <span className="font-mono break-all">{contract}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2" onClick={() => router.push("/admin/coins")}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to coins
      </Button>

      {/* Read-only header */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
        {coin.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ipfsToHttp(coin.image)} alt={coin.name ?? ""} className="h-14 w-14 rounded-lg object-cover border border-border" />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
            {(coin.symbol ?? coin.name ?? "?").slice(0, 3).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold truncate">{coin.name ?? "Unnamed coin"}</h1>
            {coin.symbol && <Badge variant="secondary" className="text-xs">{coin.symbol}</Badge>}
            <Badge className="text-xs">{coin.service}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{coin.standard} · {coin.decimals} decimals</p>
          <a
            href={`${EXPLORER_URL}/contract/${coin.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-0.5 break-all"
          >
            {coin.contractAddress} <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      </div>

      {/* Feature image — upload or paste, with preview */}
      <MediaUploader
        label="Feature image"
        initialUrl={coin.image ? ipfsToHttp(coin.image) : ""}
        onChange={(url, file) => { setImageUrl(url); setImageFile(file ?? null); }}
      />

      {/* Editable fields */}
      <div className="space-y-4">
        <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label>Symbol</Label><Input value={symbol} onChange={(e) => setSymbol(e.target.value)} /></div>
        <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
        <div className="space-y-2"><Label>Service</Label><Input value={service} onChange={(e) => setService(e.target.value)} placeholder="creator-coin | external-erc20" /></div>
        <div className="space-y-2"><Label>Creator</Label><Input value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="0x…" /></div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label className="cursor-pointer">Visible on platform</Label>
            <p className="text-xs text-muted-foreground">When off, the coin is hidden from discovery.</p>
          </div>
          <Switch checked={!hidden} onCheckedChange={(v) => setHidden(!v)} />
        </div>
      </div>

      {status && (
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            status.type === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-green-500/30 bg-green-500/10 text-green-500"
          }`}
          role="status"
        >
          {status.type === "error"
            ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
          <span className="break-words">{status.message}</span>
        </div>
      )}

      {saving && progress > 0 && progress < 100 && (
        <p className="text-xs text-muted-foreground">Uploading image… {Math.round(progress)}%</p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/coins")} disabled={saving}>Back to coins</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}
