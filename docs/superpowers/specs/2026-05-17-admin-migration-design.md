# Admin Panel Migration: medialane-io → medialane-portal

**Date:** 2026-05-17  
**Status:** Approved  
**Scope:** Move the admin section from medialane-io (Clerk auth) to medialane-portal (web3/SIWS wallet auth)

---

## Background

The admin panel currently lives in medialane-io and relies on Clerk's `publicMetadata.role === "admin"` to gate access. As the platform migrates away from Clerk toward wallet-based identity, admin access must move to medialane-portal where SIWS (Sign In With Starknet) is the auth standard.

The backend (`medialane-backend`) is unchanged — it still validates admin requests via a shared `API_SECRET_KEY`. The portal becomes the new trusted gateway that holds and forwards that key.

---

## Auth Design

### Principle

**JWT = authentication only (who you are). DB = authorization (what you can do).**

Admin status is never embedded in the JWT. Every admin request performs a fresh DB check, guaranteeing instant revocation.

### Auth flow

```
1. User connects wallet → SIWS challenge/verify → JWT cookie issued (address only)
2. Request hits /admin/* page or /api/admin/* route
3. middleware.tsx redirects unauthenticated users to /?connect=1
4. Admin layout (server component): getSession() → SELECT is_admin FROM accounts WHERE address = ?
5. withAdmin middleware (API routes): getSession() → same DB query
6. If is_admin = false or missing → redirect (layout) or 403 (API)
7. If is_admin = true → proceed; proxy adds ADMIN_API_KEY header to backend call
```

### DB migration

```sql
ALTER TABLE accounts ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- One-time setup: grant admin to the platform wallet
UPDATE accounts SET is_admin = TRUE WHERE address = '0x<admin-wallet-address>';
```

No application code sets `is_admin = true`. It is set manually via SQL only.

---

## Architecture

```
Browser (portal)
  └── /admin/*                    ← server components, layout gates on is_admin
  └── /api/admin/[...path]        ← proxy: withAdmin + ADMIN_API_KEY forward

medialane-portal (new)
  ├── src/lib/with-admin.ts       ← withAuth + DB is_admin check
  ├── src/app/admin/layout.tsx    ← server component gate + nav
  ├── src/app/admin/*/page.tsx    ← 7 admin pages (ported from medialane-io)
  ├── src/app/api/admin/[...path]/route.ts  ← admin proxy
  ├── src/hooks/use-admin.ts      ← SWR hooks for admin data
  └── src/types/admin.ts          ← admin response types

medialane-backend (unchanged)
  └── /admin/* routes             ← still protected by API_SECRET_KEY
```

---

## Files

### New files in medialane-portal

| File | Purpose |
|---|---|
| `src/lib/with-admin.ts` | `withAdmin` HOF — `withAuth` + `SELECT is_admin` DB check |
| `src/app/admin/layout.tsx` | Server component — session + DB gate, 7-item nav |
| `src/app/admin/page.tsx` | Dashboard — stats cards + indexer health |
| `src/app/admin/claims/page.tsx` | Collection + username claims review |
| `src/app/admin/collections/page.tsx` | Collections list + metadata management |
| `src/app/admin/reports/page.tsx` | Content reports moderation |
| `src/app/admin/tokens/page.tsx` | Token management |
| `src/app/admin/creators/page.tsx` | Creator approval queue |
| `src/app/admin/maintenance/page.tsx` | Indexer health + maintenance ops |
| `src/app/api/admin/[...path]/route.ts` | Admin proxy — `withAdmin` + `ADMIN_API_KEY` |
| `src/hooks/use-admin.ts` | SWR hooks: claims, username-claims, collections, reports, tokens |
| `src/types/admin.ts` | Response types: `AdminReport`, `AdminCollectionClaimRecord`, etc. |

### Modified files in medialane-portal

| File | Change |
|---|---|
| `src/middleware.tsx` | Add `/admin` to `PROTECTED` array |
| `.env.local` + Railway env | Add `ADMIN_API_KEY` |

### Files removed from medialane-io (after validation)

- `src/app/admin/` (entire directory)
- `src/app/api/admin/` (entire directory)
- `src/types/admin.ts`
- Admin-specific exports from `src/hooks/use-claims.ts`
- `ADMIN_API_KEY` env var

---

## `withAdmin` middleware

```typescript
// src/lib/with-admin.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionPayload } from "@/src/lib/session";
import { pool } from "@/src/lib/db";

type AdminHandler = (
  req: NextRequest,
  session: SessionPayload,
  context?: { params: Promise<Record<string, string | string[]>> }
) => Promise<NextResponse>;

export function withAdmin(handler: AdminHandler) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
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

---

## Admin proxy route

Pattern mirrors `src/app/api/portal/[...path]/route.ts` but uses `withAdmin` and `ADMIN_API_KEY`.

- Path traversal validation (reject `..`, `.`, empty segments)
- Query param sanitization (reject `$`-prefixed keys and `{}` chars)
- Forwards `GET`, `POST`, `PATCH`, `DELETE`
- Target: `MEDIALANE_API_URL/admin/<path>`

---

## Admin layout (server component)

```
getSession()
  → null → redirect("/?connect=1")
  → session → SELECT is_admin FROM accounts WHERE address = ?
      → false → redirect("/")
      → true → render nav + children
```

Nav items (same 7 as medialane-io): Dashboard, Claims, Collections, Reports, Tokens, Creators, Maintenance. Reports badge shows pending count (fetched fresh via admin proxy).

---

## Component compatibility

Admin pages use: `shadcn/ui`, `swr`, `date-fns`, `sonner`, `lucide-react`. The portal has the same stack. Pages port with import path adjustments only:

- `@/hooks/use-claims` → `@/src/hooks/use-admin`
- `@/types/admin` → `@/src/types/admin`
- `@/components/ui/*` → `@/src/components/ui/*`

The dashboard page fetches directly from `NEXT_PUBLIC_MEDIALANE_BACKEND_URL` in medialane-io. In the portal it will route through `/api/admin/*` proxy instead, keeping `ADMIN_API_KEY` server-side only.

---

## Environment variables

| Variable | Where | Notes |
|---|---|---|
| `ADMIN_API_KEY` | medialane-portal server + Railway | Same value as medialane-io today |
| `MEDIALANE_API_URL` | Already present in portal | Used by proxy |
| `JWT_SECRET` | Already present in portal | Used by session verification |

---

## Security properties

| Concern | Mitigation |
|---|---|
| Admin key exposure | `ADMIN_API_KEY` is server-only, never in browser bundle or JWT |
| Privilege escalation | `is_admin` set only via SQL, never via API or user input |
| Revocation lag | Zero — DB checked fresh on every admin request |
| Path traversal | Proxy rejects `..`, `.`, empty path segments |
| NoSQL injection | Proxy rejects `$`-prefixed and `{}`-containing query params |
| Unauthenticated access | Middleware redirects before layout; `withAdmin` blocks at API level |
| Token theft | Stolen JWT alone is insufficient — `is_admin` DB check is required |

---

## Validation & cutover plan

1. Deploy admin section to portal, keep medialane-io admin live
2. Smoke-test all 7 sections in portal (dashboard stats, claims approve/reject, reports, maintenance ops)
3. Verify a non-admin wallet is correctly denied (403/redirect)
4. Once confirmed, remove admin section from medialane-io and rotate `ADMIN_API_KEY` on medialane-io
