# Admin Panel Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the 7-section admin panel from medialane-io (Clerk auth) to medialane-portal (SIWS wallet auth), gating access via a fresh DB `is_admin` check on every request.

**Architecture:** An `is_admin BOOLEAN` column is added to the portal's `accounts` table and set manually via SQL for the admin wallet. A `withAdmin` middleware verifies the session JWT then checks `is_admin` fresh from the DB on every admin API call. The admin layout does the same check server-side; the Next.js middleware pre-redirects unauthenticated visitors. The backend (`medialane-backend`) is untouched — it still validates via `API_SECRET_KEY`.

**Tech Stack:** Next.js 15 App Router, PostgreSQL (`pg` pool), `jose` JWT, `swr`, `sonner`, `shadcn/ui`, `lucide-react`, `date-fns`

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Create | `src/lib/with-admin.ts` | `withAdmin` HOF — session verify + DB `is_admin` check |
| Create | `src/app/api/admin/[...path]/route.ts` | Admin proxy — `withAdmin` + `ADMIN_API_KEY` forward |
| Create | `src/app/admin/layout.tsx` | Server component gate + 7-item nav |
| Create | `src/app/admin/page.tsx` | Dashboard — stats + indexer health |
| Create | `src/app/admin/claims/page.tsx` | Collection + username claims review |
| Create | `src/app/admin/collections/page.tsx` | Collections list + metadata ops |
| Create | `src/app/admin/reports/page.tsx` | Content reports moderation |
| Create | `src/app/admin/tokens/page.tsx` | Token lookup + refresh |
| Create | `src/app/admin/creators/page.tsx` | Creator approval queue |
| Create | `src/app/admin/maintenance/page.tsx` | Indexer + maintenance ops |
| Create | `src/hooks/use-admin.ts` | SWR hooks for all admin data |
| Create | `src/types/admin.ts` | Admin response types |
| Modify | `src/lib/utils.ts` | Add `ipfsToHttp`, `timeAgo`, `formatDisplayPrice` |
| Modify | `src/lib/constants.ts` | Add `EXPLORER_URL` |
| Modify | `src/middleware.tsx` | Add `/admin` to `PROTECTED` |
| Modify | `.env.local` | Add `ADMIN_API_KEY`, `NEXT_PUBLIC_EXPLORER_URL` |
| DB | migration SQL | `ALTER TABLE accounts ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE` |

---

## Task 1: DB Migration

**Files:**
- DB: run SQL against the Railway Postgres instance

- [ ] **Step 1: Run the migration**

Connect to the production database and run:

```sql
ALTER TABLE accounts ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
```

Verify:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'accounts' AND column_name = 'is_admin';
```
Expected output: one row — `is_admin | boolean | false`

- [ ] **Step 2: Grant admin to the platform wallet**

```sql
-- Replace with the actual admin wallet address (lowercase, full hex)
UPDATE accounts SET is_admin = TRUE WHERE address = '0x<admin-wallet-address>';
```

Verify:
```sql
SELECT address, is_admin FROM accounts WHERE is_admin = TRUE;
```
Expected: one row with the admin wallet address.

---

## Task 2: `withAdmin` Middleware

**Files:**
- Create: `src/lib/with-admin.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/with-admin.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionPayload } from "@/src/lib/session";
import { pool } from "@/src/lib/db";

type AdminContext = { params: Promise<Record<string, string | string[]>> };
type AdminHandler = (
  req: NextRequest,
  session: SessionPayload,
  context?: AdminContext
) => Promise<NextResponse>;

export function withAdmin(handler: AdminHandler) {
  return async (req: NextRequest, context?: AdminContext): Promise<NextResponse> => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await pool.query<{ is_admin: boolean }>(
      "SELECT is_admin FROM accounts WHERE address = $1",
      [session.address]
    );
    if (!result.rows[0]?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(req, session, context);
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no TypeScript errors related to `with-admin.ts`.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/lib/with-admin.ts
git commit -m "feat: add withAdmin middleware — session + DB is_admin gate"
```

---

## Task 3: Admin API Proxy

**Files:**
- Create: `src/app/api/admin/[...path]/route.ts`

- [ ] **Step 1: Add `ADMIN_API_KEY` to `.env.local`**

Open `.env.local` and add (copy the value from medialane-io's environment):
```
ADMIN_API_KEY=<copy from medialane-io>
```

- [ ] **Step 2: Create the proxy route**

```typescript
// src/app/api/admin/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/src/lib/with-admin";
import { SessionPayload } from "@/src/lib/session";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY!;
const API_URL = process.env.MEDIALANE_API_URL!;

async function handler(
  req: NextRequest,
  _session: SessionPayload,
  context?: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context!.params;

  if (path.some((seg) => seg === "" || seg === "." || seg === "..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const url = req.nextUrl;
  const safeParams = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (/^\$/.test(key) || /[{}]/.test(key)) return;
    safeParams.append(key, value);
  });
  const search = safeParams.toString() ? `?${safeParams.toString()}` : "";
  const targetUrl = `${API_URL}/admin/${path.join("/")}${search}`;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      "x-api-key": ADMIN_API_KEY,
      "Content-Type": "application/json",
    },
    body,
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = withAdmin(handler);
export const POST = withAdmin(handler);
export const PATCH = withAdmin(handler);
export const DELETE = withAdmin(handler);
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add "src/app/api/admin/[...path]/route.ts" .env.local
git commit -m "feat: add admin API proxy with withAdmin gate and ADMIN_API_KEY forward"
```

---

## Task 4: Protect `/admin` in Middleware

**Files:**
- Modify: `src/middleware.tsx`

- [ ] **Step 1: Add `/admin` to PROTECTED**

In `src/middleware.tsx`, change:
```typescript
const PROTECTED = ["/account"];
```
to:
```typescript
const PROTECTED = ["/account", "/admin"];
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/middleware.tsx
git commit -m "feat: protect /admin routes in edge middleware"
```

---

## Task 5: Add Utility Helpers

**Files:**
- Modify: `src/lib/utils.ts`
- Modify: `src/lib/constants.ts`

The admin pages use `ipfsToHttp`, `timeAgo`, `formatDisplayPrice`, and `EXPLORER_URL` — none of which exist in the portal yet.

- [ ] **Step 1: Add helpers to `src/lib/utils.ts`**

Append to the end of `src/lib/utils.ts`:

```typescript
function adaptiveDecimals(num: number): number {
  if (num === 0 || num >= 1) return 2;
  if (num >= 0.01) return 4;
  const leadingZeros = Math.floor(-Math.log10(Math.abs(num)));
  return leadingZeros + 2;
}

export function formatDisplayPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined) return "";
  const priceStr = String(price);
  const parts = priceStr.split(" ");
  const numericPart = parts[0];
  const currencyPart = parts.length > 1 ? parts.slice(1).join(" ") : "";
  const num = Number(numericPart);
  if (isNaN(num)) return priceStr;
  const maxDecimals = adaptiveDecimals(num);
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(2, maxDecimals),
    maximumFractionDigits: maxDecimals,
  });
  return currencyPart ? `${formatted} ${currencyPart}` : formatted;
}

export function ipfsToHttp(uri: string | null | undefined): string {
  if (!uri) return "/placeholder.svg";
  if (uri.startsWith("ipfs://")) {
    const host = process.env.NEXT_PUBLIC_PINATA_HOST ?? "https://ipfs.io/ipfs";
    return `${host}/${uri.slice(7)}`;
  }
  if (uri.startsWith("https://") || uri.startsWith("http://")) return uri;
  return "/placeholder.svg";
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
```

- [ ] **Step 2: Add `EXPLORER_URL` to `src/lib/constants.ts`**

Append to the end of `src/lib/constants.ts`:

```typescript
export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://voyager.online";
```

- [ ] **Step 3: Add `NEXT_PUBLIC_EXPLORER_URL` to `.env.local`** (if not already present)

```
NEXT_PUBLIC_EXPLORER_URL=https://voyager.online
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/lib/utils.ts src/lib/constants.ts .env.local
git commit -m "feat: add ipfsToHttp, timeAgo, formatDisplayPrice helpers and EXPLORER_URL constant"
```

---

## Task 6: Admin Types

**Files:**
- Create: `src/types/admin.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/types/admin.ts
export type ReportStatus = "PENDING" | "UNDER_REVIEW" | "HIDDEN" | "DISMISSED" | "RESTORED";

export interface AdminReport {
  id: string;
  targetType: "COLLECTION" | "TOKEN" | "CREATOR";
  targetKey: string;
  targetContract: string | null;
  targetTokenId: string | null;
  targetAddress: string | null;
  reporterUserId: string;
  categories: string[];
  description: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  targetName: string | null;
  targetImage: string | null;
}

export interface AdminCollectionClaimRecord {
  id: string;
  contractAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verificationMethod: "ONCHAIN" | "SIGNATURE" | "MANUAL";
  claimantAddress?: string;
  claimantEmail?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface AdminUsernameClaimRecord {
  id: string;
  username: string;
  walletAddress: string;
  status: "PENDING" | "APPROVED" | "AUTO_APPROVED" | "REJECTED";
  adminNotes?: string;
  createdAt: string;
}

export interface AdminCreatorRecord {
  id: string;
  username: string;
  walletAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface AdminCollectionRecord {
  id: string;
  name?: string;
  symbol?: string | null;
  contractAddress: string;
  source: string;
  metadataStatus: "FETCHED" | "PENDING" | "FETCHING" | "FAILED";
  standard?: "ERC721" | "ERC1155" | "UNKNOWN";
  isFeatured: boolean;
  isHidden: boolean;
  claimedBy?: string | null;
  image?: string | null;
  totalSupply?: number | null;
  holderCount?: number | null;
  floorPrice?: string | null;
  createdAt?: string;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/types/admin.ts
git commit -m "feat: add admin response types"
```

---

## Task 7: Admin SWR Hooks

**Files:**
- Create: `src/hooks/use-admin.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/hooks/use-admin.ts
import useSWR from "swr";
import type {
  AdminCollectionClaimRecord,
  AdminUsernameClaimRecord,
  AdminCreatorRecord,
  AdminCollectionRecord,
  AdminReport,
} from "@/src/types/admin";

const adminFetch = (url: string, options?: RequestInit) =>
  fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) },
  });

export function useAdminClaims(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-claims-${status}-${page}`,
    () => adminFetch(`/api/admin/claims?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    claims: (data?.claims ?? []) as AdminCollectionClaimRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminUsernameClaims(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-username-claims-${status}-${page}`,
    () => adminFetch(`/api/admin/username-claims?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    claims: (data?.claims ?? []) as AdminUsernameClaimRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminCreators(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-creators-${status}-${page}`,
    () => adminFetch(`/api/admin/username-claims?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    creators: (data?.claims ?? []) as AdminCreatorRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminReports(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const { data, error, isLoading, mutate } = useSWR(
    `admin-reports-${status}-${page}`,
    () => adminFetch(`/api/admin/reports?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    reports: (data?.reports ?? []) as AdminReport[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAdminCollections(
  filters: {
    source?: string;
    metadataStatus?: string;
    search?: string;
    page?: number;
    isFeatured?: boolean;
    isHidden?: boolean;
  } = {}
) {
  const params = new URLSearchParams({ page: String(filters.page ?? 1), limit: "20" });
  if (filters.source) params.set("source", filters.source);
  if (filters.metadataStatus) params.set("metadataStatus", filters.metadataStatus);
  if (filters.search) params.set("search", filters.search);
  if (filters.isFeatured != null) params.set("isFeatured", String(filters.isFeatured));
  if (filters.isHidden != null) params.set("isHidden", String(filters.isHidden));
  const { data, error, isLoading, mutate } = useSWR(
    `admin-collections-${JSON.stringify(filters)}`,
    () => adminFetch(`/api/admin/collections?${params}`).then((r) => r.json()),
    { revalidateOnFocus: false }
  );
  return {
    collections: (data?.collections ?? []) as AdminCollectionRecord[],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/hooks/use-admin.ts
git commit -m "feat: add admin SWR hooks"
```

---

## Task 8: Admin Layout

**Files:**
- Create: `src/app/admin/layout.tsx`

The layout is a server component. It calls `getSession()`, checks `is_admin` from the DB, and redirects non-admins. It also pre-fetches the pending report count for the Reports badge.

- [ ] **Step 1: Create the file**

```typescript
// src/app/admin/layout.tsx
import { getSession } from "@/src/lib/session";
import { pool } from "@/src/lib/db";
import { redirect } from "next/navigation";

const API_URL = process.env.MEDIALANE_API_URL!;
const ADMIN_KEY = process.env.ADMIN_API_KEY!;

async function getPendingReportCount(): Promise<number> {
  try {
    const res = await fetch(
      `${API_URL}/admin/reports?status=PENDING,UNDER_REVIEW&limit=1`,
      { headers: { "x-api-key": ADMIN_KEY }, cache: "no-store" }
    );
    const data = await res.json();
    return data.total ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/?connect=1");

  const result = await pool.query<{ is_admin: boolean }>(
    "SELECT is_admin FROM accounts WHERE address = $1",
    [session.address]
  );
  if (!result.rows[0]?.is_admin) redirect("/");

  const pendingReports = await getPendingReportCount();

  const navItems = [
    { label: "Dashboard",   href: "/admin" },
    { label: "Claims",      href: "/admin/claims" },
    { label: "Collections", href: "/admin/collections" },
    { label: "Reports",     href: "/admin/reports",     badge: pendingReports > 0 ? pendingReports : undefined },
    { label: "Tokens",      href: "/admin/tokens" },
    { label: "Creators",    href: "/admin/creators" },
    { label: "Maintenance", href: "/admin/maintenance" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 pt-28">
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</p>
        <nav className="flex gap-4 mt-3 border-b border-border pb-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
              {item.badge !== undefined && (
                <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/layout.tsx
git commit -m "feat: add admin layout with server-side DB auth gate and nav"
```

---

## Task 9: Admin Dashboard Page

**Files:**
- Create: `src/app/admin/page.tsx`

Server component — fetches stats directly from backend using `ADMIN_API_KEY` (server-side only).

- [ ] **Step 1: Copy the page from medialane-io and update imports**

Copy `medialane-io/src/app/admin/page.tsx` to `medialane-portal/src/app/admin/page.tsx`, then apply these changes:

1. Change `process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL!` → `process.env.MEDIALANE_API_URL!`
2. Remove the `const TENANT_KEY` line and update the creators fetch to use a public endpoint or remove it if not critical
3. Update the creators fetch header from `TENANT_KEY` to use `ADMIN_KEY`:

Replace:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL!;
const ADMIN_KEY = process.env.ADMIN_API_KEY!;
const TENANT_KEY = process.env.NEXT_PUBLIC_MEDIALANE_API_KEY!;
```
With:
```typescript
const BACKEND_URL = process.env.MEDIALANE_API_URL!;
const ADMIN_KEY = process.env.ADMIN_API_KEY!;
```

4. In `getStats()`, update the creators fetch from `{ "x-api-key": TENANT_KEY }` to `{ "x-api-key": ADMIN_KEY }`.

5. No import path changes needed (dashboard page has no component imports from the hooks/types).

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/page.tsx
git commit -m "feat: add admin dashboard page (stats + indexer health)"
```

---

## Task 10: Admin Claims Page

**Files:**
- Create: `src/app/admin/claims/page.tsx`

- [ ] **Step 1: Copy and update imports**

Copy `medialane-io/src/app/admin/claims/page.tsx` to `medialane-portal/src/app/admin/claims/page.tsx`.

Apply these import substitutions:
```
@/hooks/use-claims        →  @/src/hooks/use-admin
@/types/admin             →  @/src/types/admin
@/components/ui/button    →  @/src/components/ui/button
@/components/ui/badge     →  @/src/components/ui/badge
@/components/ui/textarea  →  @/src/components/ui/textarea
@/components/ui/dialog    →  @/src/components/ui/dialog
@/components/ui/select    →  @/src/components/ui/select
```

No logic changes required.

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/claims/page.tsx
git commit -m "feat: add admin claims page"
```

---

## Task 11: Admin Collections Page

**Files:**
- Create: `src/app/admin/collections/page.tsx`

- [ ] **Step 1: Copy and update imports**

Copy `medialane-io/src/app/admin/collections/page.tsx` to `medialane-portal/src/app/admin/collections/page.tsx`.

Apply these import substitutions:
```
@/hooks/use-claims           →  @/src/hooks/use-admin
@/types/admin                →  @/src/types/admin
@/components/ui/button       →  @/src/components/ui/button
@/components/ui/badge        →  @/src/components/ui/badge
@/components/ui/input        →  @/src/components/ui/input
@/components/ui/label        →  @/src/components/ui/label
@/components/ui/dialog       →  @/src/components/ui/dialog
@/components/ui/select       →  @/src/components/ui/select
@/components/ui/switch       →  @/src/components/ui/switch
@/components/ui/skeleton     →  @/src/components/ui/skeleton
@/lib/utils                  →  @/src/lib/utils
@/lib/constants              →  @/src/lib/constants
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/collections/page.tsx
git commit -m "feat: add admin collections page"
```

---

## Task 12: Admin Reports Page

**Files:**
- Create: `src/app/admin/reports/page.tsx`

- [ ] **Step 1: Copy and update imports**

Copy `medialane-io/src/app/admin/reports/page.tsx` to `medialane-portal/src/app/admin/reports/page.tsx`.

Apply these import substitutions:
```
@/hooks/use-claims           →  @/src/hooks/use-admin
@/types/admin                →  @/src/types/admin
@/components/ui/dialog       →  @/src/components/ui/dialog
@/components/ui/button       →  @/src/components/ui/button
@/components/ui/badge        →  @/src/components/ui/badge
@/components/ui/skeleton     →  @/src/components/ui/skeleton
@/components/ui/textarea     →  @/src/components/ui/textarea
@/components/ui/label        →  @/src/components/ui/label
@/lib/utils                  →  @/src/lib/utils
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/reports/page.tsx
git commit -m "feat: add admin reports page"
```

---

## Task 13: Admin Tokens Page

**Files:**
- Create: `src/app/admin/tokens/page.tsx`

- [ ] **Step 1: Copy and update imports**

Copy `medialane-io/src/app/admin/tokens/page.tsx` to `medialane-portal/src/app/admin/tokens/page.tsx`.

Apply these import substitutions:
```
@/components/ui/button   →  @/src/components/ui/button
@/components/ui/input    →  @/src/components/ui/input
@/components/ui/label    →  @/src/components/ui/label
@/components/ui/badge    →  @/src/components/ui/badge
@/lib/utils              →  @/src/lib/utils
@/lib/constants          →  @/src/lib/constants
```

Note: the tokens page does not use any admin SWR hooks — it fetches directly via `fetch` to `/api/admin/tokens/:contract/:tokenId`. No hook import needed.

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/tokens/page.tsx
git commit -m "feat: add admin tokens page"
```

---

## Task 14: Admin Creators Page

**Files:**
- Create: `src/app/admin/creators/page.tsx`

- [ ] **Step 1: Copy and update imports**

Copy `medialane-io/src/app/admin/creators/page.tsx` to `medialane-portal/src/app/admin/creators/page.tsx`.

Apply these import substitutions:
```
@/hooks/use-claims        →  @/src/hooks/use-admin
@/types/admin             →  @/src/types/admin
@/components/ui/button    →  @/src/components/ui/button
@/components/ui/input     →  @/src/components/ui/input
@/components/ui/label     →  @/src/components/ui/label
@/components/ui/dialog    →  @/src/components/ui/dialog
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/creators/page.tsx
git commit -m "feat: add admin creators page"
```

---

## Task 15: Admin Maintenance Page

**Files:**
- Create: `src/app/admin/maintenance/page.tsx`

- [ ] **Step 1: Copy and update imports**

Copy `medialane-io/src/app/admin/maintenance/page.tsx` to `medialane-portal/src/app/admin/maintenance/page.tsx`.

Apply these import substitutions:
```
@/components/ui/button   →  @/src/components/ui/button
@/components/ui/input    →  @/src/components/ui/input
@/components/ui/label    →  @/src/components/ui/label
```

Also update the `BACKEND_URL` reference: the maintenance page uses `process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL` for the health fetch only (which is a public endpoint). Either keep it as-is (it's public data) or switch to `process.env.MEDIALANE_API_URL`. Prefer `MEDIALANE_API_URL` for consistency:

Replace:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL!;
```
With:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL ?? process.env.MEDIALANE_API_URL ?? "";
```

The `adminPost` helper calls `/api/admin/...` which routes through the portal proxy — no change needed there.

- [ ] **Step 2: Verify build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/medialane/dev/medialane-portal
git add src/app/admin/maintenance/page.tsx
git commit -m "feat: add admin maintenance page"
```

---

## Task 16: Final Build Verification & Smoke Test

- [ ] **Step 1: Full production build**

```bash
cd /Users/medialane/dev/medialane-portal && bun run build
```
Expected: `✓ Generating static pages` with no TypeScript or build errors. WASM warnings from `@cartridge/connector` are pre-existing and harmless.

- [ ] **Step 2: Start dev server and smoke-test**

```bash
cd /Users/medialane/dev/medialane-portal && bun dev
```

Open `http://localhost:3000/admin` in browser. Verify:

| Test | Expected result |
|---|---|
| Visit `/admin` without wallet connected | Redirect to `/?connect=1` |
| Connect a non-admin wallet, visit `/admin` | Redirect to `/` |
| Connect the admin wallet, visit `/admin` | Dashboard loads with stats cards |
| Click each nav item | All 7 sections render without errors |
| Reports badge | Shows pending count if > 0 |
| Claims: approve a pending claim | Action succeeds, list refreshes |
| Collections: toggle featured flag | Toggle persists after page reload |
| Maintenance: fetch health | Indexer status visible |

- [ ] **Step 3: Verify non-admin API rejection**

```bash
# Should return 403 — no session
curl -s http://localhost:3000/api/admin/collections | jq .
```
Expected: `{"error":"Unauthorized"}`

- [ ] **Step 4: Add `ADMIN_API_KEY` to Railway**

In the Railway dashboard for `medialane-portal`, add the `ADMIN_API_KEY` environment variable (same value used in medialane-io today). Trigger a redeploy.

- [ ] **Step 5: Smoke-test on production**

Visit `https://portal.medialane.io/admin` with the admin wallet connected and verify the dashboard loads.

---

## Task 17: Remove Admin from medialane-io

Only execute after Task 16 is fully validated on production.

- [ ] **Step 1: Delete admin files from medialane-io**

```bash
cd /Users/medialane/dev/medialane-io
rm -rf src/app/admin
rm -rf src/app/api/admin
rm src/types/admin.ts
```

- [ ] **Step 2: Remove admin hook exports from `src/hooks/use-claims.ts`**

Open `medialane-io/src/hooks/use-claims.ts` and remove the functions:
`useAdminClaims`, `useAdminUsernameClaims`, `useAdminCreators`, `useAdminReports`, `useAdminCollections`

Also remove the import block at the top that imports from `@/types/admin`.

- [ ] **Step 3: Verify medialane-io build still passes**

```bash
cd /Users/medialane/dev/medialane-io && bun run build 2>&1 | grep -E "error|Error|✓" | head -20
```
Expected: no errors (no remaining references to admin files).

- [ ] **Step 4: Commit medialane-io changes**

```bash
cd /Users/medialane/dev/medialane-io
git add src/app/admin src/app/api/admin src/types/admin.ts src/hooks/use-claims.ts
git commit -m "chore: remove admin panel (moved to medialane-portal)"
```

- [ ] **Step 5: Remove `ADMIN_API_KEY` from medialane-io Railway environment**

In Railway, delete `ADMIN_API_KEY` from the `medialane-io` service variables. Trigger a redeploy to confirm it builds and runs without the key.

---

## Summary

| Task | Deliverable |
|---|---|
| 1 | DB `is_admin` column + admin wallet seeded |
| 2 | `withAdmin` middleware |
| 3 | Admin proxy route + `ADMIN_API_KEY` env |
| 4 | Middleware protects `/admin` |
| 5 | `ipfsToHttp`, `timeAgo`, `formatDisplayPrice`, `EXPLORER_URL` in portal |
| 6 | Admin types |
| 7 | Admin SWR hooks |
| 8 | Admin layout (server-side DB gate + nav) |
| 9–15 | 7 admin pages ported to portal |
| 16 | Build verified + smoke-tested on prod |
| 17 | Admin removed from medialane-io |
