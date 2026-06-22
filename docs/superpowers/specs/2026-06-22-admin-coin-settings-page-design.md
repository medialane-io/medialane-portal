# Admin Coin Settings Page — Design

**Date:** 2026-06-22
**Status:** Draft for review.
**Scope:** `medialane-portal` admin only. Coins (`/admin/coins`). Collections shares the same modal pattern and is a deliberate fast-follow, out of scope here.

---

## I. Problem

Editing a coin's metadata happens in a cramped `Edit Coin` `<Dialog>` on `/admin/coins`. The image field is a single text input — `Image (URL or ipfs://...)` — so an admin can only paste an IPFS/HTTP link. There is no way to **upload** a feature image; they must upload it elsewhere first and paste the resulting URI.

## II. Goals / Non-goals

**Goals**
- A dedicated, deep-linkable coin **settings page** (replaces the modal).
- Let the admin **upload a feature image** (file → IPFS) *or* paste a URL, with a live preview.
- Reuse existing infrastructure; no new backend endpoints, no new upload service.

**Non-goals**
- Collections (same treatment later).
- New editable fields beyond what the backend `PATCH /admin/coins/:contract` already accepts.
- Any backend or SDK change.

## III. Reused building blocks (all already exist)

- **`src/components/mediaUploader.tsx`** — `<MediaUploader label initialUrl onChange={(url, file?) => …} />` with **Upload (dropzone)** and **URL (paste)** tabs, live preview + progress. Exposes `getFileAsync()` via ref.
- **`src/hooks/useIpfs.tsx`** — `useIpfsUpload().uploadToIpfs(file, metadata)` → uploads via the Pinata signed URL, returns the `ipfs://` file URL.
- **`/api/pinata`** — GET returns a short-lived Pinata signed upload URL (no auth gate; client uploads directly).
- **`useAdminCoins({ search })`** (`src/hooks/use-admin.ts`) — admin coin list; `?search=` matches the **full address** and **includes hidden** coins.
- **`adminFetch`** (`src/lib/admin-fetch.ts`) — the single signed admin fetch (SNIP-12 session-key auth).
- **`ipfsToHttp`** (`src/lib/utils.ts`), `EXPLORER_URL` (`src/lib/constants.ts`).

Backend contract (unchanged): `PATCH /admin/coins/:contract` accepts `{ name?, symbol?, description?, image?, service?, creator?, isHidden? }`.

## IV. Components & data flow

### New: `src/app/admin/coins/[contract]/page.tsx` (client)
1. Read `contract` from route params. Load the coin via `useAdminCoins({ search: contract })`; pick the record whose `contractAddress` matches (normalized). Loading + not-found states.
2. Local form state seeded from the coin: `name, symbol, description, service, creator, isHidden`, plus `imageUrl` (current `coin.image`) and `imageFile: File | null`.
3. **Read-only header:** thumbnail (`ipfsToHttp(coin.image)`), name, symbol, `service` badge, `standard` (ERC20), `decimals`, truncated address, Explorer link (`${EXPLORER_URL}/contract/<address>`).
4. **Feature image:** `<MediaUploader label="Feature image" initialUrl={ipfsToHttp(coin.image)} onChange={(url, file) => { setImageUrl(url); setImageFile(file ?? null); }} />`.
5. **Fields:** Name, Symbol, Description, Service, Creator inputs + a "Visible on platform" switch bound to `!isHidden`.
6. **Save** (`handleSave`):
   - Resolve the image: if `imageFile` → `const ipfs = await uploadToIpfs(imageFile, { name, description })` → use `ipfs`; else if `imageUrl` is set, is **not** a `blob:` URL (the upload tab emits a local `blob:` preview that must never be persisted), and differs from `coin.image` → use `imageUrl`; else omit `image`.
   - `await adminFetch('/admin/coins/' + contract, { method: 'PATCH', body: JSON.stringify(patch) })` where `patch` includes only changed fields (image resolved above; `isHidden` always sent since the toggle is authoritative).
   - On success: `toast.success`, `router.push('/admin/coins')`. On failure: `toast.error`, stay.
   - Disable Save while uploading/saving; show progress from the uploader.
7. **Cancel / ← Back:** `router.push('/admin/coins')`.

### Modified: `src/app/admin/coins/page.tsx`
- Remove the `Edit Coin` `<Dialog>`, its open/close state, and the `editName/editSymbol/editImage/editDescription/editService/editCreator` state + `handleSaveEdit`.
- The pencil (edit) row action becomes a navigation to `/admin/coins/<contractAddress>` (Next `<Link>` or `router.push`).
- Keep the other row actions (refresh, view, hide) as-is.

## V. Error handling
- Coin not found (bad address / not indexed): render a "Coin not found" state with a back link.
- Upload failure: `useIpfsUpload` error → `toast.error`, do not PATCH.
- PATCH failure: `toast.error`, keep the form populated.
- No admin session (expired): `adminFetch` throws `NoAdminSessionError` → caught → toast; the `/admin` layout already gates on a session, so this is an edge case.

## VI. Testing
- No test runner in the portal → verify with `bun run build` (must pass clean: `✓ Generating static pages`).
- Manual prod smoke (admin session required): open a coin's settings, (a) paste a URL → Save → image updates; (b) upload a file → Save → `ipfs://` image updates; (c) edit name/description → Save → list reflects it; (d) toggle visibility → Save → hidden state changes.

## VII. Out of scope / follow-ups
- Apply the identical page + `MediaUploader` treatment to `/admin/collections` (same modal today).
- Optional: a live price/links section sourced from the dapp coin page.
