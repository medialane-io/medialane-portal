# Brand Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace medialane-portal's flat single-purple, plain-system-font look with the real brand system: an `Urbanist` display face for headlines, brand-color *combinations* per section (not one color everywhere), and a gradient-border/gradient-fill button hierarchy — across portal's own public pages, the account/developer dashboard, and (restrained) the admin console.

**Architecture:** Two shared, reusable primitives land first (the display font, and gradient Button variants driven by a finite set of named CSS pairing classes), then get applied page-by-page following the spec's section theming map. Each page task is the same repeatable recipe: display font on the headline, the section's pairing on the one primary CTA (gradient fill) and secondary actions (gradient border), pairing colors on 2-3 accent elements (icons, active-state indicators). No new dependencies beyond a Google Font already used elsewhere in the workspace.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4 (CSS-first `@theme`), `next/font/google`, existing shadcn-derived `src/components/ui/*` primitives.

**Spec:** `docs/superpowers/specs/2026-08-18-brand-visual-refresh-design.md`

## Global Constraints

- No gradient text anywhere (confirmed explicitly out of scope in the spec).
- No `shadow-*` on cards/buttons/panels; no `border` around content panels; no `bg-muted`/grey-tinted panel fills — carried forward from the earlier session pass, must not regress.
- Gradient **border** is the default for action buttons; exactly **one** primary CTA per page/section gets a gradient **fill** — both always use one of the named pairings below, never an arbitrary gradient.
- Named pairings (from the spec's section theming map), using the existing `--brand-*` CSS custom properties already defined in `src/app/globals.css:31-36`:
  | Pairing name | Colors | Used by |
  |---|---|---|
  | `blue-maeve` | `--brand-blue` ↔ `--brand-maeve` | Home, Enterprise |
  | `orange-maeve` | `--brand-orange` ↔ `--brand-maeve` | Developers |
  | `blue-orange` | `--brand-blue` ↔ `--brand-orange` | Services |
  | `rose-orange` | `--brand-rose` ↔ `--brand-orange` | Agents |
  | `navy-purple` | `--brand-navy` ↔ `--brand-purple` | Account/Developer portal |
  | `rose-purple` | `--brand-rose` ↔ `--brand-purple` | Platform |
  | `blue-navy` | `--brand-blue` ↔ `--brand-navy` | Infrastructure |
  | *(none)* | — | Pricing (neutral), Admin console (no gradient work at all) |
- Floating/overlay components (Dialog, Popover, DropdownMenu, Select, Tooltip, etc.) are out of scope — do not touch their shadow/border treatment.
- Verification for every task: `bun run build` must succeed (this project has no component-level test suite for UI; the build's type-check + lint is the correctness gate), plus a `grep` check confirming the old (non-brand / shadow / bordered-panel) classes were actually removed, not just new ones added alongside them.

---

### Task 1: Wire the Urbanist display font

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: a `font-display` utility class (via Tailwind's `@theme inline` font-family token, driven by the `--font-display` CSS variable set on `<html>`/`<body>` by `next/font`) usable by every later page task as `className="font-display"` on headline elements.

- [ ] **Step 1: Add the Urbanist import and instance**

In `src/app/layout.tsx`, find the existing font import line:
```ts
import { Inter } from "next/font/google"
```
Replace it with:
```ts
import { Inter, Urbanist } from "next/font/google"
```
Directly below the existing `const inter = Inter({ subsets: ["latin"], display: "swap" })` line, add:
```ts
const urbanist = Urbanist({ subsets: ["latin"], display: "swap", variable: "--font-display" })
```
This matches the exact pattern already used in `medialane-starknet/src/app/layout.tsx:12`.

- [ ] **Step 2: Apply the font variable to the document**

Find where `inter.className` (or similar) is applied to the root `<html>` or `<body>` element in `layout.tsx`. Add `urbanist.variable` alongside it so the CSS variable is available app-wide, e.g. if the current body tag is:
```tsx
<body className={inter.className}>
```
change it to:
```tsx
<body className={`${inter.className} ${urbanist.variable}`}>
```
(Keep `inter.className` as the base body face — only `--font-display` is added, not a base-font swap.)

- [ ] **Step 3: Register the `font-display` Tailwind utility**

In `src/app/globals.css`, inside the existing `@theme inline { ... }` block (around line 76 where `--color-background` etc. are declared), add:
```css
--font-display: var(--font-display), var(--font-sans), sans-serif;
```
This makes `font-display` available as a Tailwind utility class (`className="font-display"`) anywhere in the app, resolving to Urbanist with Inter/system fallback.

- [ ] **Step 4: Verify**

Run: `bun run build`
Expected: build succeeds with no new type or lint errors.

Run: `grep -n "font-display" src/app/globals.css src/app/layout.tsx`
Expected: both the `@theme inline` entry and the `urbanist.variable` usage are present.

- [ ] **Step 5: Commit**

```bash
cd ~/dev/medialane-portal
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat(brand): wire Urbanist as the display font, matching the dapp"
```

---

### Task 2: Gradient-border and gradient-fill Button variants

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`

**Interfaces:**
- Consumes: `--brand-blue`, `--brand-navy`, `--brand-rose`, `--brand-purple`, `--brand-orange`, `--brand-maeve` (already defined in `src/app/globals.css:31-36`).
- Produces:
  - Two new `Button` variants: `variant="gradient-border"` and `variant="gradient-fill"`.
  - Seven pairing modifier classes to combine with either variant via `className`: `.pair-blue-maeve`, `.pair-orange-maeve`, `.pair-blue-orange`, `.pair-rose-orange`, `.pair-navy-purple`, `.pair-rose-purple`, `.pair-blue-navy`.
  - Usage pattern later tasks rely on: `<Button variant="gradient-border" className="pair-blue-maeve">Secondary action</Button>` and `<Button variant="gradient-fill" className="pair-blue-maeve">Primary action</Button>`.

- [ ] **Step 1: Add the pairing custom-property classes**

In `src/app/globals.css`, after the `:root { ... }` block that defines `--brand-*` (ends at line 37), add:
```css
.pair-blue-maeve   { --pair-a: var(--brand-blue);   --pair-b: var(--brand-maeve); }
.pair-orange-maeve { --pair-a: var(--brand-orange); --pair-b: var(--brand-maeve); }
.pair-blue-orange  { --pair-a: var(--brand-blue);   --pair-b: var(--brand-orange); }
.pair-rose-orange  { --pair-a: var(--brand-rose);   --pair-b: var(--brand-orange); }
.pair-navy-purple  { --pair-a: var(--brand-navy);   --pair-b: var(--brand-purple); }
.pair-rose-purple  { --pair-a: var(--brand-rose);   --pair-b: var(--brand-purple); }
.pair-blue-navy    { --pair-a: var(--brand-blue);   --pair-b: var(--brand-navy); }
```

- [ ] **Step 2: Add the gradient-border base class**

Immediately after the pairing classes from Step 1, add:
```css
.btn-gradient-border {
  border: 1.5px solid transparent;
  background-image:
    linear-gradient(var(--background), var(--background)),
    linear-gradient(135deg, var(--pair-a, var(--primary)), var(--pair-b, var(--primary)));
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
```
`--background` already resolves to the correct value under `.dark` automatically via the custom-property cascade — no separate `.dark` override is needed.

- [ ] **Step 3: Add the two Button variants**

Open `src/components/ui/button.tsx`. In the `variants.variant` object (currently has `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`), add two entries:
```ts
"gradient-border": "btn-gradient-border text-foreground hover:opacity-90",
"gradient-fill": "bg-gradient-to-r text-white hover:opacity-90 border-0",
```
So the full `variants.variant` object reads:
```ts
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive/60 text-white hover:bg-destructive/90 focus-visible:ring-destructive/40",
  outline:
    "border bg-input/30 border-input hover:bg-input/50 hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost:
    "hover:bg-accent/50 hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  "gradient-border": "btn-gradient-border text-foreground hover:opacity-90",
  "gradient-fill": "bg-gradient-to-r text-white hover:opacity-90 border-0",
},
```
Note `gradient-fill` intentionally does NOT set `from-*`/`to-*` — `.pair-*` only sets `--pair-a`/`--pair-b` custom properties, which Tailwind's `from-*`/`to-*` utilities don't read. For `gradient-fill`, callers instead pass the matching Tailwind gradient-stop utilities directly, e.g. `className="from-brand-blue to-brand-maeve"`. Do not add a code comment explaining this in `button.tsx` — this plan document is the reference for that convention; the codebase itself carries no comments.

- [ ] **Step 4: Verify**

Run: `bun run build`
Expected: build succeeds.

Run:
```bash
grep -n "gradient-border\|gradient-fill" src/components/ui/button.tsx
grep -n "pair-blue-maeve\|btn-gradient-border" src/app/globals.css
```
Expected: both present.

Manually sanity-check the CSS logic by grepping for any other component already relying on `buttonVariants({ variant: ... })` with a hardcoded union type (some TS call sites may destructure `VariantProps<typeof buttonVariants>` and a strict union elsewhere could reject the new variant names):
```bash
grep -rn "VariantProps<typeof buttonVariants>" src
```
If any file re-declares its own narrower variant union (unlikely, but check), widen it to include the two new names.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/ui/button.tsx
git commit -m "feat(brand): add gradient-border/gradient-fill Button variants + named pairings"
```

---

### Task 3: Account / Developer portal — apply `navy-purple`

**Files:**
- Modify: `src/app/account/dashboard.tsx`
- Modify: `src/components/portal/api-keys-tab.tsx`
- Modify: `src/components/portal/credits-tab.tsx`

**Interfaces:**
- Consumes: `font-display` (Task 1), `gradient-border`/`gradient-fill` Button variants + `.pair-navy-purple` (Task 2).

- [ ] **Step 1: Headline + active-tab indicator**

In `src/app/account/dashboard.tsx`, find the `<h1>` ("Your API account") and add `font-display` to its className.

Find the three `TabsTrigger` elements' `data-[state=active]:border-primary` classes (added earlier this session) and change `border-primary` to a gradient by replacing the plain bottom-border approach: since a `border-b-2` can't itself be a two-color gradient without the same double-background technique, instead swap the active-state color to alternate between the pairing's two colors isn't practical for a 2px line — simplest faithful application: change `data-[state=active]:border-primary` to `data-[state=active]:border-brand-purple` (the pairing's second color) and `data-[state=active]:text-foreground` stays, giving the tab indicator the pairing's purple instead of generic `primary`. This keeps the indicator a solid, legible line (a gradient hairline at 2px is not visually distinguishable) while still pulling from the section's assigned pairing.

- [ ] **Step 2: Primary CTA — API Keys tab**

In `src/components/portal/api-keys-tab.tsx`, find the "New Key" `<Button>` (the one with `<Plus className="w-4 h-4 mr-1" />New Key`, appearing twice: in the header and in the empty state). Change both from the default variant to:
```tsx
<Button size="sm" variant="gradient-fill" className="from-brand-navy to-brand-purple" ...>
```
(Keep all existing props — `onClick`, `disabled`, `title` — unchanged, only add/change `variant` and `className`.)

- [ ] **Step 3: Secondary action — Revoke button stays as-is**

The destructive "revoke" button (`variant="ghost"` with `text-destructive`) is a destructive action, not a brand action — leave it unchanged. Do not apply gradient-border here; gradient treatment is for constructive/primary actions only.

- [ ] **Step 4: Primary CTA — Credits tab**

In `src/components/portal/credits-tab.tsx`, find the "Deposit" `<Button>` (`onClick={handleDeposit}`). Change it to:
```tsx
<Button variant="gradient-fill" className="from-brand-navy to-brand-purple" onClick={handleDeposit} disabled={depositing || !account || !usdcAmount || !treasuryAddress}>
```

- [ ] **Step 5: Verify**

Run: `bun run build`
Expected: succeeds.

Run: `grep -n "gradient-fill\|font-display\|brand-purple" src/app/account/dashboard.tsx src/components/portal/api-keys-tab.tsx src/components/portal/credits-tab.tsx`
Expected: matches in all three files.

- [ ] **Step 6: Commit**

```bash
git add src/app/account/dashboard.tsx src/components/portal/api-keys-tab.tsx src/components/portal/credits-tab.tsx
git commit -m "feat(brand): apply navy-purple pairing to the account/developer portal"
```

---

### Task 4: Home page (`/`) — apply `blue-maeve`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Read the file**

Run: `sed -n '1,80p' src/app/page.tsx` to find the hero `<h1>`/headline and its single primary CTA `<Link>`/`<Button>` (the top-of-page "get started"-style action — not the per-IP-type category cards already re-colored earlier this session, which stay as-is).

- [ ] **Step 2: Apply the display font**

Add `font-display` to the hero headline's className.

- [ ] **Step 3: Apply the pairing to the primary CTA**

Locate the page's single most prominent call-to-action (the hero's main button/link, not every nav link). Convert it to use the `gradient-fill` Button variant with `className="from-brand-blue to-brand-maeve"`, following the exact pattern from Task 3 Step 2. If the element is currently a plain `<Link>` styled to look like a button rather than a `<Button>` component, wrap it as `<Button asChild variant="gradient-fill" className="from-brand-blue to-brand-maeve"><Link href="...">...</Link></Button>` instead of restyling the raw `<Link>` by hand — reuse the shared primitive rather than duplicating its CSS.

- [ ] **Step 4: Apply the pairing to 2-3 secondary CTAs/icons**

Any other prominent action buttons on the page (not every link — use judgment per the spec's "gradient system is for emphasis, not applied to every clickable thing") get `variant="gradient-border" className="pair-blue-maeve"` instead of their current `variant="outline"`/`variant="secondary"`.

- [ ] **Step 5: Verify**

Run: `bun run build`
Expected: succeeds.

Run: `grep -n "font-display\|pair-blue-maeve\|from-brand-blue to-brand-maeve" src/app/page.tsx`
Expected: at least one match each for the font and the CTA.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(brand): apply blue-maeve pairing to the home page"
```

---

### Task 5: Developers page — apply `orange-maeve`

**Files:**
- Modify: `src/app/developers/page.tsx`

- [ ] **Step 1-5:** Follow the exact same recipe as Task 4 Steps 1-5, substituting:
  - Pairing: `orange-maeve` → `className="pair-orange-maeve"` (gradient-border) / `className="from-brand-orange to-brand-maeve"` (gradient-fill).
  - Note: this page already has the flat-window code-sample mockup redecorated earlier this session (`bg-brand-rose/70` / `bg-brand-orange/70` / `bg-brand-maeve/70` dots at `src/app/developers/page.tsx:114-116`) — leave those three dots alone, they're a decorative chrome mockup, not the headline/CTA this task targets.

- [ ] **Step 6: Verify**

Run: `bun run build`
Run: `grep -n "font-display\|pair-orange-maeve\|from-brand-orange to-brand-maeve" src/app/developers/page.tsx`

- [ ] **Step 7: Commit**

```bash
git add src/app/developers/page.tsx
git commit -m "feat(brand): apply orange-maeve pairing to the developers page"
```

---

### Task 6: Services page — apply `blue-orange`

**Files:**
- Modify: `src/app/services/page.tsx`

- [ ] **Step 1-5:** Same recipe as Task 4, substituting pairing `blue-orange` (`pair-blue-orange` / `from-brand-blue to-brand-orange`).

- [ ] **Step 6: Verify**

Run: `bun run build`
Run: `grep -n "font-display\|pair-blue-orange\|from-brand-blue to-brand-orange" src/app/services/page.tsx`

- [ ] **Step 7: Commit**

```bash
git add src/app/services/page.tsx
git commit -m "feat(brand): apply blue-orange pairing to the services page"
```

---

### Task 7: Agents page — apply `rose-orange`

**Files:**
- Modify: `src/app/agents/page.tsx`

- [ ] **Step 1-5:** Same recipe as Task 4, substituting pairing `rose-orange` (`pair-rose-orange` / `from-brand-rose to-brand-orange`). This is the smallest target page (77 lines) — expect one hero headline and one or two CTAs total.

- [ ] **Step 6: Verify**

Run: `bun run build`
Run: `grep -n "font-display\|pair-rose-orange\|from-brand-rose to-brand-orange" src/app/agents/page.tsx`

- [ ] **Step 7: Commit**

```bash
git add src/app/agents/page.tsx
git commit -m "feat(brand): apply rose-orange pairing to the agents page"
```

---

### Task 8: Enterprise pages — apply `blue-maeve`

**Files:**
- Modify: `src/app/enterprise/page.tsx`
- Modify: `src/app/enterprise/ai-data/page.tsx`
- Modify: `src/app/enterprise/clubs/page.tsx`
- Modify: `src/app/enterprise/editions/page.tsx`
- Modify: `src/app/enterprise/ip/page.tsx`
- Modify: `src/app/enterprise/sponsorship/page.tsx`
- Modify: `src/app/enterprise/tickets/page.tsx`
- Modify: `src/app/enterprise/tokenize/page.tsx`

- [ ] **Step 1: Read each file's structure first**

Run: `wc -l src/app/enterprise/*.tsx src/app/enterprise/*/page.tsx` to see sizes before starting — the seven sub-pages may share a common layout/section component (check for a shared `enterprise-*` component under `src/components/` via `grep -rl "enterprise" src/components`). If they share a common hero/section component, apply the pairing there once instead of in all 8 files separately — prefer editing the shared component if one exists.

- [ ] **Step 2: Apply the same recipe as Task 4** (font-display on headline, gradient-fill on the one primary CTA per page, gradient-border on secondary actions) to each of the 8 files (or the shared component found in Step 1), pairing `blue-maeve`.

- [ ] **Step 3: Verify**

Run: `bun run build`
Run: `grep -rln "font-display\|pair-blue-maeve\|from-brand-blue to-brand-maeve" src/app/enterprise`
Expected: matches across the enterprise route group (or the shared component, if that's where the change landed).

- [ ] **Step 4: Commit**

```bash
git add src/app/enterprise
git commit -m "feat(brand): apply blue-maeve pairing to the enterprise pages"
```

---

### Task 9: Platform page — apply `rose-purple`

**Files:**
- Modify: `src/app/platform/page.tsx`

- [ ] **Step 1-5:** Same recipe as Task 4, substituting pairing `rose-purple` (`pair-rose-purple` / `from-brand-rose to-brand-purple`).

- [ ] **Step 6: Verify**

Run: `bun run build`
Run: `grep -n "font-display\|pair-rose-purple\|from-brand-rose to-brand-purple" src/app/platform/page.tsx`

- [ ] **Step 7: Commit**

```bash
git add src/app/platform/page.tsx
git commit -m "feat(brand): apply rose-purple pairing to the platform page"
```

---

### Task 10: Infrastructure page — apply `blue-navy`

**Files:**
- Modify: `src/app/infrastructure/page.tsx`

- [ ] **Step 1-5:** Same recipe as Task 4, substituting pairing `blue-navy` (`pair-blue-navy` / `from-brand-blue to-brand-navy`). Note `brand-navy` is a dark color close to the dark-theme `--background` — verify in light mode the gradient-fill CTA text (`text-white`) still has sufficient contrast against a blue→navy fill; if the navy end looks too close to black-on-black in dark mode, that's expected (navy is meant to read as the "dark base," per the brand reference) but double-check the button's fill doesn't visually disappear against the page background in dark mode specifically — if it does, keep the gradient direction `to right` (not `to bottom`) so both colors stay visible along the button's width rather than one edge blending into the page.

- [ ] **Step 6: Verify**

Run: `bun run build`
Run: `grep -n "font-display\|pair-blue-navy\|from-brand-blue to-brand-navy" src/app/infrastructure/page.tsx`

- [ ] **Step 7: Commit**

```bash
git add src/app/infrastructure/page.tsx
git commit -m "feat(brand): apply blue-navy pairing to the infrastructure page"
```

---

### Task 11: Pricing page — neutral, font only

**Files:**
- Modify: `src/app/pricing/page.tsx`

**Interfaces:**
- Consumes: `font-display` only (Task 1). No pairing, no gradient buttons — this page is explicitly neutral per the spec.

- [ ] **Step 1: Apply the display font only**

Add `font-display` to the page's hero headline. Do not add any `gradient-border`/`gradient-fill` variant or `.pair-*` class anywhere on this page — leave existing buttons as their current `default`/`outline` variants. The earlier session's fix already replaced this page's one off-brand color (`text-green-400` → `text-primary` at line 58); that stays as-is.

- [ ] **Step 2: Verify**

Run: `bun run build`
Run: `grep -n "font-display" src/app/pricing/page.tsx`
Expected: present.
Run: `grep -n "gradient-fill\|gradient-border\|pair-" src/app/pricing/page.tsx`
Expected: no matches (confirms neutrality was respected).

- [ ] **Step 3: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat(brand): apply display font to pricing page (kept neutral, no pairing)"
```

---

### Task 12: Admin console — consistency verification pass

**Files:**
- Verify only (no expected changes): `src/app/admin/**/*.tsx`

**Interfaces:**
- Consumes: nothing new — this task only confirms the shared `Button`/`globals.css` changes from Tasks 1-2 didn't leak gradient styling into admin by way of any default-variant usage, and that the earlier session's shadow/border/color cleanup in `/admin` still holds.

- [ ] **Step 1: Confirm no gradient variants were added to admin**

Run: `grep -rln "gradient-border\|gradient-fill\|pair-" src/app/admin`
Expected: **no output** — admin stays restrained per the spec, this task adds nothing there.

- [ ] **Step 2: Confirm the earlier shadow/border/grey-panel/off-brand-color cleanup still holds**

Run:
```bash
grep -rn "shadow-\(sm\|md\|lg\|xl\)\b" src/app/admin | grep -v "shadow-none"
grep -rnE "(bg|text|border|ring|from|to|via)-(red|green|yellow|purple|pink|indigo|teal|cyan|amber|lime|emerald|sky|violet|fuchsia|slate|zinc|neutral|stone|gray)-[0-9]{2,3}" src/app/admin
```
Expected: **no output** from either command (both were already cleaned in this session's earlier color/shadow pass — this step exists to catch any regression introduced by an unrelated concurrent change, not to do new work).

- [ ] **Step 3: Build**

Run: `bun run build`
Expected: succeeds, no admin-route regressions.

- [ ] **Step 4: No commit needed**

This task is verification-only. If Steps 1-2 find any matches, fix them following the same rules as the earlier session's admin color pass (map to `primary`/`destructive`/`brand-*` tokens, drop the shadow utility), then commit that fix with:
```bash
git add src/app/admin
git commit -m "fix(admin): restore no-shadow/no-gradient/brand-token consistency"
```
Otherwise, skip straight to Task completion with no git action.

---

## Self-review notes

- **Spec coverage:** Typography (Task 1), gradient button system (Task 2), every section-theming-map row (Tasks 3-11), admin restraint (Task 12), no-shadow/no-border/no-grey-fill carried as a Global Constraint and re-verified in Task 12. The spec's "out of scope" items (overlay components, `@medialane/ui` itself, new illustration/motion) have no corresponding task, correctly.
- **Type consistency:** `variant="gradient-border"` / `variant="gradient-fill"` and the seven `.pair-*` class names are defined once in Task 2 and referenced identically (same strings) in every later task.
- **Ambiguity flagged:** Task 8 (Enterprise) explicitly tells the executor to check for a shared component before editing 8 files individually, since that wasn't verified during planning — this is a real open question for whoever executes it, not a placeholder.
