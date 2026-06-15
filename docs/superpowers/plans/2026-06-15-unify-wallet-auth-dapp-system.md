# Unify Portal Wallet Auth with the Dapp System — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Subagents are disabled in this workspace — execute inline, sequentially.)

**Goal:** Replace the portal's bespoke auth (forced sign-at-connect + refresh-token rotation + `sessions` table) with the dapp's client wallet system (connect-only, lazy sign-on-demand), while keeping signature verification and admin authority inside the portal's own trust boundary.

**Architecture:** Connecting a wallet no longer signs anything. A short-lived, portal-issued HttpOnly cookie is the session; it is minted only when the user enters an authenticated area (lazy sign). The portal verifies the wallet signature itself on-chain (`is_valid_signature`) — the backend is never a trust anchor for identity. Admin stays gated by `accounts.is_admin` in the portal DB, enforced both by edge middleware (page gate) and `with-admin` (per-request API gate).

**Tech Stack:** Next.js 15 App Router, starknet.js v6, `@starknet-react/core`, `jose` (JWT), PostgreSQL (`pg`), Bun.

**Spec:** `docs/superpowers/specs/2026-06-15-unify-wallet-auth-dapp-system-design.md`

**Note on testing:** This repo has **no unit test runner** (`CLAUDE.md`: "No test runner is configured"). Verification per task is `bun run build` (must end `✓ Generating static pages (N/N)`) plus, where noted, manual prod smoke — auth/wallet flows are prod-only on this app (local dev can't exercise a real wallet signature reliably, and Vercel preview lacks the DB env). Pre-existing `@cartridge/connector` WASM async/await warnings during build are harmless.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/lib/session.ts` | Mint/verify the portal JWT cookie | Modify — drop refresh tokens, single cookie, 12h TTL |
| `src/lib/session-edge.ts` | Edge-safe JWT verify | Keep as-is |
| `src/lib/siws.ts` | Server-side challenge nonce + on-chain signature verify | Keep (already patched: RPC fallback) |
| `src/lib/siws-client.ts` | Client: challenge → sign → verify call | **Create** |
| `src/hooks/use-wallet.ts` | Thin `useWallet()` shim over starknet-react (dapp-shape, injected-only) | **Create** |
| `src/hooks/use-siws-auth.ts` | Lazy sign-on-demand: `session`, `ensureSession()`, `signIn()`, `signOut()` | **Create** |
| `src/components/wallet-connect-modal.tsx` | Connect-only wallet picker (Ready/Braavos), no forced sign | Rewrite |
| `src/components/floating-nav.tsx` | Connect button + lazy sign on dashboard entry | Modify |
| `src/app/api/auth/verify/route.ts` | Verify signature → issue single cookie | Modify |
| `src/app/api/auth/session/route.ts` | Report current session to client | Modify — include `is_admin` |
| `src/app/api/auth/signout/route.ts` | Clear cookie | Modify — drop `destroySession` |
| `src/app/api/auth/refresh/route.ts` | Refresh rotation | **Delete** |
| `scripts/migrate.ts` | Schema bootstrap | Modify — stop creating `sessions` |
| `CLAUDE.md` | Auth System docs | Modify |
| `sessions` DB table | — | Drop (manual, post-deploy) |

---

## Task 0: Commit the in-flight signature bug fixes as the baseline

The branch has three uncommitted edits from earlier debugging — the RPC fallback in `siws.ts`, the relaxed signature-format guard + graceful 503 in `verify/route.ts`, and `stark.formatSignature` in the modal. The first two are permanent keepers; the modal's sign code will be superseded in Task 6 but committing it now keeps the tree clean.

**Files:**
- Modify (already edited, uncommitted): `src/lib/siws.ts`, `src/app/api/auth/verify/route.ts`, `src/components/wallet-connect-modal.tsx`

- [ ] **Step 1: Confirm the build is green with the pending edits**

Run: `bun run build 2>&1 | grep -E "Generating static pages|error"`
Expected: `✓ Generating static pages (39/39)` and no `error` lines.

- [ ] **Step 2: Commit**

```bash
git add src/lib/siws.ts src/app/api/auth/verify/route.ts src/components/wallet-connect-modal.tsx
git commit -m "fix(auth): repair SIWS signature verification (format guard, RPC fallback, serialization)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 1: Simplify the session module — drop refresh tokens & `sessions` table

`createSession` will return only `{ token }` (no DB write), the refresh/destroy functions are removed, and cookie helpers manage a single `auth-token` cookie with a 12-hour TTL (re-signing on expiry is free, so no refresh machinery is needed).

**Files:**
- Modify: `src/lib/session.ts`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/lib/session.ts` with:

```ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  address: string;
  mdln_tier: number;
  is_admin: boolean;
};

const AUTH_TOKEN_COOKIE = "auth-token";
const TOKEN_TTL = "12h";
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<{ token: string }> {
  const token = await new SignJWT({
    sub: payload.address,
    mdln_tier: payload.mdln_tier,
    is_admin: payload.is_admin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());

  return { token };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      address: payload.sub as string,
      mdln_tier: payload.mdln_tier as number,
      is_admin: payload.is_admin === true,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === "production";
  const base = `; Path=/; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
  response.headers.append(
    "Set-Cookie",
    `${AUTH_TOKEN_COOKIE}=${token}; Max-Age=${TOKEN_TTL_SECONDS}${base}`
  );
}

export function clearSessionCookie(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${AUTH_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
}
```

This removes: `randomUUID`/`createHash`/`pool` imports, the `REFRESH_TOKEN_COOKIE` constant, `hashToken`, `refreshSession`, `destroySession`, `setSessionCookies`, `clearSessionCookies`.

- [ ] **Step 2: Verify nothing else imports the removed symbols yet**

Run: `grep -rn "refreshSession\|destroySession\|setSessionCookies\|clearSessionCookies" src/ --include='*.ts' --include='*.tsx'`
Expected: matches only in `src/app/api/auth/refresh/route.ts` and `src/app/api/auth/signout/route.ts` (both fixed/deleted in Tasks 2–3). Do **not** build yet — it will fail until those are updated.

---

## Task 2: Delete the refresh route and fix signout

`/api/auth/refresh` no longer exists (no refresh tokens). Signout just clears the cookie.

**Files:**
- Delete: `src/app/api/auth/refresh/route.ts`
- Modify: `src/app/api/auth/signout/route.ts`

- [ ] **Step 1: Delete the refresh route**

```bash
git rm src/app/api/auth/refresh/route.ts
```

- [ ] **Step 2: Replace signout route contents**

Replace the entire contents of `src/app/api/auth/signout/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/src/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
```

- [ ] **Step 3: Confirm no stale refresh callers remain**

Run: `grep -rn "auth/refresh\|auth-refresh" src/ --include='*.ts' --include='*.tsx'`
Expected: no matches.

---

## Task 3: Update verify route to issue a single cookie

The verify route keeps its (already-patched) format guard and graceful-503 try/catch, but now mints just the auth-token cookie.

**Files:**
- Modify: `src/app/api/auth/verify/route.ts`

- [ ] **Step 1: Update the import**

Change:
```ts
import { createSession, setSessionCookies } from "@/src/lib/session";
```
to:
```ts
import { createSession, setSessionCookie } from "@/src/lib/session";
```

- [ ] **Step 2: Update session creation + cookie set**

Change:
```ts
  const { token, refreshToken } = await createSession({
    address: normalizedAddress,
    mdln_tier,
    is_admin,
  });

  const response = NextResponse.json({ ok: true, address: normalizedAddress });
  setSessionCookies(response, token, refreshToken);
  return response;
```
to:
```ts
  const { token } = await createSession({
    address: normalizedAddress,
    mdln_tier,
    is_admin,
  });

  const response = NextResponse.json({ ok: true, address: normalizedAddress });
  setSessionCookie(response, token);
  return response;
```

- [ ] **Step 3: Build (session module now consistent)**

Run: `bun run build 2>&1 | grep -E "Generating static pages|error"`
Expected: `✓ Generating static pages` with one fewer route (refresh gone), no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/session.ts src/app/api/auth/signout/route.ts src/app/api/auth/verify/route.ts
git commit -m "refactor(auth): drop refresh-token rotation, single short-lived session cookie

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Add `is_admin` to the session endpoint

The client needs to know admin status (to show an admin entry) without reading the HttpOnly cookie.

**Files:**
- Modify: `src/app/api/auth/session/route.ts`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/app/api/auth/session/route.ts` with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/src/lib/session-edge";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const session = await verifyTokenEdge(token);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({
    ok: true,
    address: session.address,
    is_admin: session.is_admin,
    mdln_tier: session.mdln_tier,
  });
}
```

- [ ] **Step 2: Build**

Run: `bun run build 2>&1 | grep -E "Generating static pages|error"`
Expected: `✓ Generating static pages`, no errors.

---

## Task 5: Create the client SIWS helper + hooks

Three new client files: the low-level challenge→sign→verify call, a `useWallet()` shim matching the dapp's hook shape (injected-only — no StarkZap slot machinery needed in the portal), and the lazy `useSiwsAuth()`.

**Files:**
- Create: `src/lib/siws-client.ts`
- Create: `src/hooks/use-wallet.ts`
- Create: `src/hooks/use-siws-auth.ts`

- [ ] **Step 1: Create `src/lib/siws-client.ts`**

```ts
"use client";

import { stark, type TypedData } from "starknet";

export interface SiwsSigner {
  signMessage: (typedData: TypedData) => Promise<unknown>;
}

/**
 * Runs the portal sign-in: fetch a challenge, sign it with the wallet, post the
 * signature to the portal's verify endpoint (which sets the HttpOnly session
 * cookie). Throws with a usable message on any failure.
 */
export async function requestPortalSession(
  address: string,
  signer: SiwsSigner
): Promise<void> {
  const challengeRes = await fetch(`/api/auth/challenge?address=${address}`);
  const challengeData = await challengeRes.json();
  if (!challengeRes.ok) {
    throw new Error(challengeData.error ?? "Failed to get challenge");
  }
  const { nonce, typedData } = challengeData;

  const signature = await signer.signMessage(typedData);
  // Handles every wallet's signature shape (Braavos's longer signer-prefixed
  // array, Argent's [r, s], object {r, s}) → decimal felt strings.
  const sigArray = stark.formatSignature(signature);

  const verifyRes = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, nonce, signature: sigArray }),
  });
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(err.error ?? "Sign-in failed");
  }
}
```

- [ ] **Step 2: Create `src/hooks/use-wallet.ts`**

```ts
"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

/**
 * Thin wallet hook for the portal — mirrors the dapp's useWallet() surface but
 * over starknet-react directly. The portal is injected-only (Ready/Braavos), so
 * there is no multi-rail active-slot referee to maintain.
 */
export function useWallet() {
  const { address, status, account } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address: address ?? null,
    account,
    isConnected: status === "connected" && Boolean(address),
    isConnecting: status === "connecting",
    connectors,
    connect,
    disconnect,
  };
}
```

- [ ] **Step 3: Create `src/hooks/use-siws-auth.ts`**

```ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { requestPortalSession } from "@/src/lib/siws-client";

export interface PortalSession {
  address: string;
  is_admin: boolean;
  mdln_tier: number;
}

function sameAddress(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  try {
    return BigInt(a) === BigInt(b);
  } catch {
    return a.toLowerCase() === b.toLowerCase();
  }
}

/**
 * Lazy sign-on-demand auth. Connecting a wallet does NOT sign. A session is
 * minted only when ensureSession()/signIn() is called (entering the dashboard
 * or admin, provisioning a key). The session lives in an HttpOnly cookie; this
 * hook reads its state via /api/auth/session.
 */
export function useSiwsAuth() {
  const { address, account } = useAccount();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<PortalSession | null> => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        setSession(null);
        return null;
      }
      const data = await res.json();
      // A cookie for a different wallet than the one now connected is not "our"
      // session — treat it as signed-out so the UI prompts a fresh sign-in.
      if (address && !sameAddress(data.address, address)) {
        setSession(null);
        return null;
      }
      const s: PortalSession = {
        address: data.address,
        is_admin: data.is_admin === true,
        mdln_tier: data.mdln_tier ?? 0,
      };
      setSession(s);
      return s;
    } catch {
      setSession(null);
      return null;
    }
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (): Promise<PortalSession | null> => {
    if (!address || !account) {
      const msg = "Connect your wallet first";
      setError(msg);
      throw new Error(msg);
    }
    setIsSigningIn(true);
    setError(null);
    try {
      await requestPortalSession(address, account);
      return await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(msg);
      throw err instanceof Error ? err : new Error(msg);
    } finally {
      setIsSigningIn(false);
    }
  }, [address, account, refresh]);

  const ensureSession = useCallback(async (): Promise<PortalSession | null> => {
    const existing = await refresh();
    if (existing) return existing;
    return signIn();
  }, [refresh, signIn]);

  const signOut = useCallback(async (): Promise<void> => {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
  }, []);

  return {
    session,
    isSignedIn: session !== null,
    isSigningIn,
    error,
    signIn,
    ensureSession,
    signOut,
    refresh,
  };
}
```

- [ ] **Step 4: Build**

Run: `bun run build 2>&1 | grep -E "Generating static pages|error"`
Expected: `✓ Generating static pages`, no errors. (New files compile even though nothing imports them yet.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/siws-client.ts src/hooks/use-wallet.ts src/hooks/use-siws-auth.ts src/app/api/auth/session/route.ts
git commit -m "feat(auth): client SIWS helper + useWallet/useSiwsAuth (lazy sign-on-demand)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Rewrite the connect modal as a connect-only picker

The modal no longer signs. It is a wallet picker (Ready/Braavos); once a wallet connects, it closes. Signing moves to the lazy `useSiwsAuth` flow (Task 7).

**Files:**
- Rewrite: `src/components/wallet-connect-modal.tsx`

- [ ] **Step 1: Replace the entire file contents**

```tsx
"use client";

import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Wallet, CheckCircle2, ChevronRight } from "lucide-react";

const WALLET_META: Record<string, { label: string; icon: string }> = {
  argentX: { label: "Ready (Argent)", icon: "🔷" },
  braavos: { label: "Braavos", icon: "🔵" },
};

// Portal wallet kinds are intentionally Ready / Braavos only.
const ALLOWED_CONNECTORS = ["argentX", "braavos"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectModal({ open, onOpenChange }: Props) {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Connect-only: as soon as a wallet is connected, close the picker. Signing
  // happens later, lazily, when the user enters an authenticated area.
  useEffect(() => {
    if (open && status === "connected" && address) {
      onOpenChange(false);
    }
  }, [open, status, address, onOpenChange]);

  const pickable = connectors.filter((c) => ALLOWED_CONNECTORS.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white backdrop-blur-xl">
        <DialogHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-1">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Your Starknet wallet is your account. No email or password needed.
          </DialogDescription>
        </DialogHeader>

        {status === "connected" && address ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Connected</p>
                <p className="text-sm font-mono text-white truncate">
                  {address.slice(0, 10)}...{address.slice(-6)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-white"
              onClick={() => disconnect()}
            >
              Use a different wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {pickable.map((connector) => {
              const meta = WALLET_META[connector.id] ?? {
                label: connector.name,
                icon: "🔌",
              };
              return (
                <Button
                  key={connector.id}
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 hover:bg-white/10 justify-between text-white h-12"
                  onClick={() => connect({ connector })}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="font-medium">{meta.label}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              );
            })}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Don&apos;t have a wallet?{" "}
              <a
                href="https://www.argent.xyz/argent-x/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get a Starknet wallet
              </a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Build**

Run: `bun run build 2>&1 | grep -E "Generating static pages|error"`
Expected: `✓ Generating static pages`, no errors.

---

## Task 7: Wire lazy sign into the nav

`WalletButton` now reflects wallet-connection state from `useWallet()` and signs lazily via `useSiwsAuth().ensureSession()` only when the user clicks into the dashboard. The `?connect=1` redirect (from the middleware gate) triggers `ensureSession` when a wallet is already connected, otherwise opens the picker.

**Files:**
- Modify: `src/components/floating-nav.tsx`

- [ ] **Step 1: Update imports**

Change:
```tsx
import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Wallet, LogOut, LayoutDashboard } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"
import { LogoMedialane } from "./logo-medialane"
import Link from "next/link"
import { useAccount, useDisconnect } from "@starknet-react/core"
import { WalletConnectModal } from "./wallet-connect-modal"
```
to:
```tsx
import { useState, useEffect, Suspense, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Wallet, LogOut, LayoutDashboard, Loader2 } from "lucide-react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"
import { LogoMedialane } from "./logo-medialane"
import Link from "next/link"
import { useWallet } from "@/src/hooks/use-wallet"
import { useSiwsAuth } from "@/src/hooks/use-siws-auth"
import { WalletConnectModal } from "./wallet-connect-modal"
```

- [ ] **Step 2: Replace the `WalletButton` component**

Replace the entire `WalletButton` function with:

```tsx
function WalletButton({ onOpenChange }: { onOpenChange: (v: boolean) => void }) {
  const { address, isConnected, disconnect } = useWallet()
  const { isSignedIn, ensureSession, signOut, isSigningIn } = useSiwsAuth()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const goToDashboard = useCallback(async () => {
    try {
      await ensureSession()
      router.push("/account")
    } catch {
      // ensureSession surfaces the reason via the hook's error state; a
      // declined signature simply leaves the user connected-but-not-signed.
    }
  }, [ensureSession, router])

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full text-white hover:bg-white/20 gap-2 hidden md:flex"
          onClick={goToDashboard}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LayoutDashboard className="w-4 h-4" />
          )}
          <span className="font-mono text-xs">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-white hover:bg-white/10 h-8 w-8 p-0"
          onClick={() => {
            disconnect()
            if (isSignedIn) signOut()
          }}
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const handleOpen = () => {
    setOpen(true)
    onOpenChange(true)
  }

  return (
    <>
      <Button
        size="sm"
        className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 text-xs font-semibold px-4"
        onClick={handleOpen}
      >
        <Wallet className="w-3.5 h-3.5" />
        Connect
      </Button>
      <WalletConnectModal open={open} onOpenChange={(v) => { setOpen(v); onOpenChange(v) }} />
    </>
  )
}
```

- [ ] **Step 3: Make the `?connect=1` watcher sign lazily when already connected**

Replace the `ConnectParamWatcher` component with:

```tsx
// Isolated to avoid wrapping entire nav in Suspense. When redirected here from
// a protected page (?connect=1): if a wallet is already connected, trigger the
// lazy sign-in; otherwise open the wallet picker.
function ConnectParamWatcher({
  onNeedConnect,
  onNeedSignIn,
}: {
  onNeedConnect: () => void
  onNeedSignIn: () => void
}) {
  const searchParams = useSearchParams()
  const { isConnected } = useWallet()
  useEffect(() => {
    if (searchParams.get("connect") === "1") {
      if (isConnected) onNeedSignIn()
      else onNeedConnect()
    }
  }, [searchParams, isConnected, onNeedConnect, onNeedSignIn])
  return null
}
```

- [ ] **Step 4: Wire the watcher in `FloatingNav`**

Inside the `FloatingNav` component, add the auth hook and a sign-in handler. Just after the existing `const [connectOpen, setConnectOpen] = useState(false)` line, add:

```tsx
  const { ensureSession } = useSiwsAuth()
  const router = useRouter()
  const handleNeedSignIn = useCallback(async () => {
    try {
      await ensureSession()
      router.push("/account")
    } catch {
      /* declined — stay put */
    }
  }, [ensureSession, router])
```

Then change the watcher usage from:
```tsx
      <Suspense fallback={null}>
        <ConnectParamWatcher onDetected={() => setConnectOpen(true)} />
      </Suspense>
```
to:
```tsx
      <Suspense fallback={null}>
        <ConnectParamWatcher
          onNeedConnect={() => setConnectOpen(true)}
          onNeedSignIn={handleNeedSignIn}
        />
      </Suspense>
```

- [ ] **Step 5: Build**

Run: `bun run build 2>&1 | grep -E "Generating static pages|error"`
Expected: `✓ Generating static pages`, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/wallet-connect-modal.tsx src/components/floating-nav.tsx
git commit -m "feat(auth): connect-only picker + lazy sign-on-demand in nav

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Stop creating the `sessions` table in the migration script

New installs should not create `sessions`. (The live table is dropped manually in Task 10 after deploy.)

**Files:**
- Modify: `scripts/migrate.ts`

- [ ] **Step 1: Inspect the script**

Run: `grep -n "sessions" scripts/migrate.ts`
Expected: a `CREATE TABLE ... sessions ...` block (around line 15+).

- [ ] **Step 2: Remove the `sessions` table creation**

Open `scripts/migrate.ts` and delete the SQL statement that creates the `sessions` table (the `CREATE TABLE IF NOT EXISTS sessions (...)` block and any index creation that targets `sessions`). Leave `accounts`, `nonces`, and `rate_limits` untouched.

- [ ] **Step 3: Verify no remaining references to the sessions table in code**

Run: `grep -rn "FROM sessions\|INTO sessions\|TABLE.*sessions\|sessions WHERE" src/ scripts/ --include='*.ts'`
Expected: no matches (all reads/writes were removed in Tasks 1–2).

- [ ] **Step 4: Build + commit**

Run: `bun run build 2>&1 | grep -E "Generating static pages|error"`
Expected: `✓ Generating static pages`, no errors.

```bash
git add scripts/migrate.ts
git commit -m "chore(db): stop provisioning the sessions table (refresh tokens removed)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Update CLAUDE.md auth documentation

Keep the repo's guide truthful — the next agent must not rebuild what we deleted.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Rewrite the "Auth System (SIWS)" section**

In `CLAUDE.md`, update the Auth System section to describe the new model:
- Connecting a wallet does **not** sign. Sign is **lazy** — minted on entering an authenticated area via `useSiwsAuth().ensureSession()`.
- Session = a single short-lived (12h) HttpOnly `auth-token` cookie, portal-issued (JWT via `jose`, `JWT_SECRET`). **No refresh tokens, no `sessions` table.**
- The portal verifies signatures itself on-chain (`is_valid_signature`); the backend is never trusted for identity.
- Update the **Key files** table: remove `refreshSession`/refresh route; add `src/lib/siws-client.ts`, `src/hooks/use-wallet.ts`, `src/hooks/use-siws-auth.ts`; note the connect modal is now connect-only.
- Update the **Cookies** subsection: only `auth-token` (12h) remains; remove `auth-refresh`.
- Update the **Database** "Tables used" list: remove `sessions`.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update auth system to lazy SIWS, single cookie, no refresh tokens

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Deploy + prod verification (USER-AUTHORIZED ONLY)

Auth/wallet flows are prod-only on this app. Do **not** push or drop the table without explicit user authorization for each action.

- [ ] **Step 1: Open a PR (do not merge without approval)**

```bash
git push -u origin feat/unify-wallet-auth-dapp-system
gh pr create --title "Unify portal wallet auth with the dapp system (lazy SIWS, single cookie)" \
  --body "$(cat <<'EOF'
Replaces the portal's forced sign-at-connect + refresh-token/sessions machinery with the dapp's connect-only + lazy sign-on-demand model. Portal still verifies signatures on-chain itself (admin trust stays off the backend). Token is a single 12h HttpOnly cookie.

Spec: docs/superpowers/specs/2026-06-15-unify-wallet-auth-dapp-system-design.md
Plan: docs/superpowers/plans/2026-06-15-unify-wallet-auth-dapp-system.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: After merge + Vercel deploy, smoke test on portal.medialane.io**

Verify in order:
1. Connect Braavos → modal closes, no signature prompt, nav shows the address. (This is the original "Invalid signature format" failure path — confirm it no longer occurs.)
2. Click the address/dashboard chip → wallet prompts to sign once → lands on `/account`.
3. Reload `/account` → no re-sign (cookie valid).
4. As the admin wallet (`accounts.is_admin = true`) → `/admin` loads.
5. As a non-admin connected+signed wallet → `/admin` redirects to `/`.
6. Disconnect → `/account` and `/admin` redirect to `/?connect=1`.

- [ ] **Step 3: Drop the live `sessions` table (after the deploy is confirmed healthy)**

Verify against prod first (per the prod-DB rule), then drop:

```bash
# Confirm nothing reads it anymore and see its size:
DATABASE_PUBLIC_URL="<railway prod public url>" \
  psql "$DATABASE_PUBLIC_URL" -c "SELECT count(*) FROM sessions;"
# Drop:
DATABASE_PUBLIC_URL="<railway prod public url>" \
  psql "$DATABASE_PUBLIC_URL" -c "DROP TABLE IF EXISTS sessions;"
```

- [ ] **Step 4: Record the cross-repo decision in medialane-core**

Add a short note under `medialane-core/docs/architecture/` capturing: "portal and dapp share one client wallet system; the portal verifies identity locally (never via the backend) for admin security." This is the source-of-truth location for cross-repo decisions.

---

## Self-Review

- **Spec coverage:** connect-only UX (Task 6), lazy sign (Tasks 5, 7), `useWallet()` parity (Task 5), portal-local on-chain verification (kept; Task 0 baseline), single HttpOnly cookie + 12h TTL (Tasks 1, 3), admin gate unchanged (verified — `middleware.tsx`/`with-admin.ts` untouched), removal of refresh/sessions (Tasks 1, 2, 8, 10), wallet kinds Ready/Braavos only (Task 6), docs (Task 9), prod-DB-verified table drop (Task 10). All covered.
- **Type consistency:** `createSession` → `{ token }` used consistently (Tasks 1, 3). `setSessionCookie`/`clearSessionCookie` names match across session.ts, verify, signout. `useSiwsAuth` exposes `ensureSession`/`signIn`/`signOut`/`isSignedIn`/`isSigningIn` — all consumed as defined in Task 7. `requestPortalSession(address, signer)` signature matches its call in `use-siws-auth.ts`.
- **Known follow-up (out of scope):** Argent's "Ready" rebrand may expose the extension under id `ready` rather than `argentX`; the dapp solved this with an `idResolvedReady` alias connector. If Ready users can't connect after deploy, port that connector setup. Not blocking — Braavos (the reported failure) and classic Argent X work with the current `InjectedConnector` ids.
