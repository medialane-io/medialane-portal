# Admin Coin Settings Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. (Subagents are disabled in this workspace — execute inline.)

**Goal:** Replace the cramped "Edit Coin" modal with a dedicated `/admin/coins/[contract]` settings page that lets the admin upload a feature image (file → IPFS) or paste a URL.

**Architecture:** A new client page reuses existing pieces — `MediaUploader` (upload/URL tabs + preview), `useIpfsUpload` (Pinata signed-URL upload), `useAdminCoins` (load by address, incl. hidden), and the signed `adminFetch` (PATCH). The coins list's pencil navigates to the page; the modal is removed.

**Tech Stack:** Next.js 15 App Router (client component), `@medialane/sdk` (indirect), Pinata, Tailwind/Radix UI. No backend/SDK change. No test runner → verify with `bun run build`.

**Spec:** `docs/superpowers/specs/2026-06-22-admin-coin-settings-page-design.md`

**Verified facts:** `MediaUploader` is `export default` with props `{ label?, initialUrl?, onChange:(url, file?)=>void }`; on file-select it calls `onChange(dataURL, file)`, on URL it calls `onChange(url)`. `useIpfsUpload().uploadToIpfs(file, meta)` returns `{ fileUrl, metadataUrl, cid }` (`fileUrl` = gateway URL). `AdminCoinRecord` has `{ id, contractAddress, chain, standard:"ERC20", service, name?, symbol?, decimals, totalSupply?, description?, image?, creator?, isHidden }`. `useAdminCoins({search})` → `{ coins, total, isLoading, error, mutate }`. Explorer link: `${EXPLORER_URL}/contract/${address}`. `ipfsToHttp` from `@/src/lib/utils`; `EXPLORER_URL` from `@/src/lib/constants`. UI primitives `textarea/switch/badge/skeleton` exist.

---

### Task 1: Create the coin settings page

**Files:**
- Create: `src/app/admin/coins/[contract]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
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
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
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
    try {
      // Resolve the image: uploaded file wins; else a real (non-preview), changed URL; else leave as-is.
      let image: string | undefined;
      if (imageFile) {
        const { fileUrl } = await uploadToIpfs(imageFile, { name: name || coin.contractAddress, description: description || "" });
        image = fileUrl;
      } else if (
        imageUrl &&
        imageUrl !== (coin.image ?? "") &&
        !imageUrl.startsWith("data:") &&
        !imageUrl.startsWith("blob:")
      ) {
        image = imageUrl;
      }

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
      if (!res.ok) throw new Error();
      toast.success("Coin updated");
      await mutate();
      router.push("/admin/coins");
    } catch {
      toast.error("Update failed");
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

      {saving && progress > 0 && progress < 100 && (
        <p className="text-xs text-muted-foreground">Uploading image… {Math.round(progress)}%</p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/coins")} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `cd /Users/medialane/dev/medialane-portal && bun run build`
Expected: `✓ Compiled successfully` + `✓ Generating static pages` (the new `/admin/coins/[contract]` route appears as dynamic `ƒ`).

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add "src/app/admin/coins/[contract]/page.tsx"
git commit -m "feat(admin): dedicated coin settings page with feature-image upload"
```

---

### Task 2: Point the coins list at the page; remove the Edit modal

**Files:**
- Modify: `src/app/admin/coins/page.tsx`

- [ ] **Step 1: Make the pencil navigate to the settings page**

Add `import Link from "next/link";` near the top imports. Replace the edit button (currently `<Button … onClick={() => openEdit(coin)} title="Edit coin"><Pencil … /></Button>`) with a `Link`-wrapped button to the settings route:

```tsx
<Button asChild size="icon" variant="ghost" className="h-8 w-8" title="Coin settings">
  <Link href={`/admin/coins/${coin.contractAddress}`}><Pencil className="h-3.5 w-3.5" /></Link>
</Button>
```

- [ ] **Step 2: Remove the Edit modal + its state**

Delete from `src/app/admin/coins/page.tsx`:
- the edit state: `editOpen, editCoin, editName, editSymbol, editImage, editDescription, editService, editCreator` (the `useState` lines) and their `setEdit*` usages;
- the `openEdit(coin)` function;
- the `handleSaveEdit()` function;
- the entire `<Dialog open={editOpen} onOpenChange={setEditOpen}> … </Dialog>` block (the **Edit Coin** dialog only — KEEP the separate **Add external coin** `<Dialog open={addOpen}>`).

Then remove any now-unused imports (e.g. `Pencil` stays — still used in the link; drop `Dialog`/`DialogContent`/… only if the Add dialog no longer needs them — it does, so keep them; remove `Label`/`Input` only if unused after — the Add dialog uses them, so keep). Let the build flag unused symbols.

- [ ] **Step 3: Build (catches any leftover references to removed state/imports)**

Run: `cd /Users/medialane/dev/medialane-portal && bun run build`
Expected: `✓ Compiled successfully` + `✓ Generating static pages`. If it errors on an undefined `editX`/unused import, fix that exact reference and re-run.

- [ ] **Step 4: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/coins/page.tsx
git commit -m "feat(admin): coins list pencil opens settings page; remove edit modal"
```

---

## Self-review

**Spec coverage:**
- §IV new page `/admin/coins/[contract]` → Task 1 ✓
- §IV load via `useAdminCoins({search})` + address match → Task 1 ✓
- §IV read-only header (image, name, symbol, service, standard, decimals, address, explorer) → Task 1 ✓
- §IV `<MediaUploader>` feature image (upload/URL/preview) → Task 1 ✓
- §IV fields + visibility toggle → Task 1 ✓
- §IV save: file → `uploadToIpfs` → `fileUrl`; else changed non-preview URL; PATCH via `adminFetch`; `isHidden` always sent → Task 1 ✓
- §IV modified list: pencil → page, modal removed (Add dialog kept) → Task 2 ✓
- §V error handling (not-found, upload fail, PATCH fail) → Task 1 (`toast`, not-found block) ✓
- §VI verification via `bun run build` → Tasks 1 & 2 ✓

**Placeholder scan:** none — full page code given; Task 2 deletions are enumerated by exact symbol/block.

**Type consistency:** `AdminCoinRecord` fields used (`name?,symbol?,description?,service,creator?,isHidden,image?,standard,decimals,contractAddress`) match the type. `useAdminCoins({search})` → `{coins,isLoading,mutate}` used as returned. `uploadToIpfs` destructured `{ fileUrl }` matches its return. `MediaUploader` default import + `onChange(url,file?)` matches its export/props. `adminFetch(path, {method,body})` matches the shared helper.

**Note for executor:** confirm `EXPLORER_URL` has no trailing slash (constants.ts) so `${EXPLORER_URL}/contract/…` is well-formed — the coins list already uses this exact pattern, so it's consistent.
