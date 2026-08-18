# medialane-portal brand visual refresh — design spec

Date: 2026-08-18
Status: approved by user, pending implementation plan

## Why

Portal's UI over-relies on a single flat `primary` purple across every
surface, plain system fonts, and (until this session's earlier fixes)
shadowed/bordered/grey-tinted panels. It reads as generic and doesn't
match the rest of the Medialane brand (DAO site, dapp, docs), which use
bold display type and vivid *combinations* of the brand palette per
section, not one color everywhere.

This spec covers all of `medialane-portal`: its own public pages, the
account/developer dashboard, and the internal admin console.

## Foundations

### Typography

Portal currently loads only `Inter` with no display face wired at all —
this is the single biggest driver of the "generic" look. Match the
established cross-app pattern (confirmed in `medialane-starknet` and in
`@medialane/ui`'s shared stylesheet comment):

- Add `Urbanist` via `next/font/google` as `--font-display`
  (`subsets: ["latin"], display: "swap", variable: "--font-display"`),
  alongside the existing `Inter` body face.
- `h1` picks up the display face automatically (`@medialane/ui`'s shared
  CSS already sets `h1 { font-family: var(--font-display, inherit) }`).
  Extend this to `h2`/section headlines on public pages via a utility
  class (e.g. `font-display`), not a blanket app-wide override.
- Bigger, bolder sizes/weights on headlines wherever a section wants
  visual weight — this is the primary lever for "bold typography", not
  new decoration.

### Color: combinations, not one purple

The brand palette is `brand-blue`, `brand-purple`, `brand-rose`,
`brand-orange`, `brand-maeve`, `brand-navy` (already wired as Tailwind
utilities from this session's earlier cleanup). The fix is *pairing*
two of these per section instead of defaulting every accent to
`primary`. See Section Theming Map below for the assignments.

### No gradient text

Confirmed explicitly out of scope — gradient text on headlines is not
part of the design system (the DAO site's use of it was a mistake being
removed there too). Headlines use solid brand colors, not
`bg-clip-text` gradients.

### No shadows, no panel borders, no grey fills

Carried forward from this session's earlier fixes and confirmed as a
standing rule, not a one-page fix:

- No `shadow-*` utilities on cards, buttons, or general panels.
- No `border` around content panels/cards — grouping comes from
  spacing and typography hierarchy, not an outline.
- No `bg-muted`/grey-tinted panel fills. Where a surface genuinely needs
  visual separation (a code block, a stat), use a brand-tinted flat fill
  (e.g. `bg-primary/5`) or no fill at all, never a neutral grey box.
- This does **not** apply to floating/overlay UI (Dialog, Popover,
  DropdownMenu, Select, Tooltip, etc.) — those keep their existing
  elevation treatment since they need a depth cue to read as "floating
  above" the page. Out of scope for this pass.

### Buttons: gradient border, not gradient fill, as the default

Matches the pattern in the reference screenshots exactly (the asset
page's "Make offer" / "Remix" vs. "Submit offer"):

- **Default action buttons** get a gradient **border** (2-color, from
  the section's assigned pairing) with a transparent/dark fill — not a
  solid gradient background.
- **Exactly one primary CTA per page or section** — the single most
  important action there — gets a solid gradient **fill**, using the
  same section pairing. This must always be a named, approved pairing;
  never an arbitrary/generic gradient.
- Everything else (ghost, plain outline, destructive) stays as today's
  solid-color treatment — the gradient system is for emphasis, not
  applied to every clickable thing.

## Section theming map (medialane-portal)

| Area | Routes | Pairing |
|---|---|---|
| Home | `/` | blue ↔ maeve |
| Enterprise | `/enterprise/*` (ai-data, clubs, editions, ip, sponsorship, tickets, tokenize) | blue ↔ maeve |
| Developers | `/developers` | orange ↔ maeve |
| Services | `/services` | blue ↔ orange (matches Launchpad elsewhere) |
| Agents | `/agents` | rose ↔ orange |
| Pricing | `/pricing` | neutral — no fixed pairing |
| Account / Developer portal | `/account/*` | navy ↔ purple |
| Platform | `/platform` | rose ↔ purple |
| Infrastructure | `/infrastructure` | blue ↔ navy |
| Admin console | `/admin/*` | none — restrained, solid tokens only (see below) |

`Platform` and `Infrastructure` pairings were left to my judgment per
the user's "other pages, make combinations you like" — flagged here so
they're easy to override before implementation.

## Per-area application

### Portal's own public pages (Home, Enterprise, Developers, Services,
Agents, Pricing, Platform, Infrastructure)

Full vivid treatment: display-face headlines, the section's brand
pairing applied to accents/icons/gradient-border CTAs, bold type scale.
This is the highest-visibility, most currently-generic part of the app.

### Account / Developer portal (`/account`)

Already partially reworked this session (flat panels, no shadows, richer
copy). This pass: apply the navy↔purple pairing to the tab-active
indicator and the one primary CTA per tab (New Key / Deposit), replace
the plain `text-primary` accents with the pairing where it reads as a
deliberate choice rather than noise.

### Admin console (`/admin/*`)

Restrained by design (confirmed earlier): same tokens, same
no-shadow/no-border-panel rules as everywhere else, but **no** gradient
buttons, no display-face headlines, no oversized type. It stays a
data-dense working tool for staff, not a brand moment.

## Rollout order

1. Foundations: wire `Urbanist`, confirm brand-color utilities are
   complete (they are, from this session's earlier cleanup).
2. Account/Developer portal: apply navy↔purple to the already-reworked
   tabs (smallest, already-touched surface — good place to validate the
   button/pairing pattern before spreading it wider).
3. Portal's own public pages, one route group at a time: Home →
   Developers → Services → Agents → Enterprise → Platform →
   Infrastructure → Pricing.
4. Admin console: token/shadow/border consistency pass only (no new
   gradient work).

## Out of scope

- Floating/overlay component elevation (Dialog, Popover, etc.).
- Any change to `@medialane/ui`'s own shared components (e.g. its
  `IP_TYPE_DATA` non-brand colors, flagged earlier this session) — that
  package is a separate repo/release.
- New illustration, imagery, or motion work beyond what's needed to
  support the type/color system above.
