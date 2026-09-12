import { test, expect } from "bun:test";
import { isPathAllowed } from "./allowlist";

const INTENT_TYPES = [
  "mint", "create-collection", "create-tier",
  "listing", "offer", "cancel", "fulfill", "checkout", "counter-offer",
];

test("POST /v1/intents/<type> is allowed for every known intent type", () => {
  for (const type of INTENT_TYPES) {
    expect(isPathAllowed("POST", `intents/${type}`)).toBe(true);
  }
});

test("POST /v1/intents/<type> is allowed for a hypothetical future intent type", () => {
  expect(isPathAllowed("POST", "intents/some-future-type")).toBe(true);
});

test("POST /v1/intents/:id/hydrate is allowed for any intent id", () => {
  expect(isPathAllowed("POST", "intents/abc-123/hydrate")).toBe(true);
});

test("PATCH /v1/intents/:id/signature and /confirm are allowed for any intent id", () => {
  expect(isPathAllowed("PATCH", "intents/abc-123/signature")).toBe(true);
  expect(isPathAllowed("PATCH", "intents/abc-123/confirm")).toBe(true);
});

test("GET /v1/intents/:id is allowed", () => {
  expect(isPathAllowed("GET", "intents/abc-123")).toBe(true);
});

test("GET /v1/portal/* and /v1/business/provisioning are rejected (internal/admin data)", () => {
  expect(isPathAllowed("GET", "portal/me")).toBe(false);
  expect(isPathAllowed("GET", "portal/keys")).toBe(false);
  expect(isPathAllowed("GET", "portal/usage")).toBe(false);
  expect(isPathAllowed("GET", "portal/webhooks")).toBe(false);
  expect(isPathAllowed("GET", "business/provisioning")).toBe(false);
});

test("GET reads discovered from @medialane/ui and app hooks are allowed", () => {
  expect(isPathAllowed("GET", "orders/received/0xabc")).toBe(true);
  expect(isPathAllowed("GET", "tokens")).toBe(true);
  expect(isPathAllowed("GET", "collections/0xabc/gated-content")).toBe(true);
  expect(isPathAllowed("GET", "collection-slug-claims/me")).toBe(true);
  expect(isPathAllowed("GET", "drop/0xabc/info")).toBe(true);
  expect(isPathAllowed("GET", "drop/0xabc/state")).toBe(true);
  expect(isPathAllowed("GET", "club/0xabc/1")).toBe(true);
  expect(isPathAllowed("GET", "club/0xabc/1/member/0xdef")).toBe(true);
  expect(isPathAllowed("GET", "tickets/0xabc/1")).toBe(true);
  expect(isPathAllowed("GET", "tickets/0xabc/count")).toBe(true);
  expect(isPathAllowed("GET", "ipnft/0xabc/1")).toBe(true);
  expect(isPathAllowed("GET", "username-claims/me")).toBe(true);
  expect(isPathAllowed("GET", "username-claims/check/alice")).toBe(true);
  expect(isPathAllowed("GET", "stats")).toBe(true);
  expect(isPathAllowed("GET", "prices")).toBe(true);
  expect(isPathAllowed("GET", "remix-offers")).toBe(true);
  expect(isPathAllowed("GET", "remix-offers/abc-123")).toBe(true);
  expect(isPathAllowed("GET", "sponsorship/offers")).toBe(true);
  expect(isPathAllowed("GET", "sponsorship/offers/abc")).toBe(true);
  expect(isPathAllowed("GET", "sponsorship/offers/abc/bids")).toBe(true);
  expect(isPathAllowed("GET", "sponsorship/proposals")).toBe(true);
  expect(isPathAllowed("GET", "sponsorship/proposals/abc")).toBe(true);
  expect(isPathAllowed("GET", "sponsorship/licenses")).toBe(true);
});

test("known public GET reads used by the io app are allowed", () => {
  expect(isPathAllowed("GET", "orders")).toBe(true);
  expect(isPathAllowed("GET", "orders/token/0xabc/1")).toBe(true);
  expect(isPathAllowed("GET", "orders/user/0xabc")).toBe(true);
  expect(isPathAllowed("GET", "tokens/owned/0xabc")).toBe(true);
  expect(isPathAllowed("GET", "tokens/0xabc/1")).toBe(true);
  expect(isPathAllowed("GET", "tokens/0xabc/1/history")).toBe(true);
  expect(isPathAllowed("GET", "collections/0xabc")).toBe(true);
  expect(isPathAllowed("GET", "collections/0xabc/tokens")).toBe(true);
  expect(isPathAllowed("GET", "activities/0xabc")).toBe(true);
  expect(isPathAllowed("GET", "search")).toBe(true);
  expect(isPathAllowed("GET", "creators/0xabc/profile")).toBe(true);
  expect(isPathAllowed("GET", "creators/by-username/alice")).toBe(true);
  expect(isPathAllowed("GET", "creators/0xabc/hidden")).toBe(true);
  expect(isPathAllowed("GET", "collection-slug-claims/check/alice")).toBe(true);
  expect(isPathAllowed("GET", "users/me")).toBe(true);
  expect(isPathAllowed("GET", "auth/email/exists")).toBe(true);
  expect(isPathAllowed("GET", "pop/eligibility/0xabc/0xdef")).toBe(true);
  expect(isPathAllowed("GET", "coins")).toBe(true);
  expect(isPathAllowed("GET", "coins/prices")).toBe(true);
  expect(isPathAllowed("GET", "coins/0xabc")).toBe(true);
  expect(isPathAllowed("GET", "drop/mint-status/0xabc/0xdef")).toBe(true);
  expect(isPathAllowed("GET", "rewards/0xabc")).toBe(true);
  expect(isPathAllowed("GET", "rewards/config")).toBe(true);
});

test("POST /v1/intents/<type> with extra path segments (other than /hydrate) is rejected", () => {
  expect(isPathAllowed("POST", "intents/listing/extra")).toBe(false);
});

test("unrelated POST routes are still rejected", () => {
  expect(isPathAllowed("POST", "admin/accounts/1/credits/grant")).toBe(false);
});

test("POST /v1/wallet/deploy is no longer allowed (removed — see AVNU-sponsored deploy)", () => {
  expect(isPathAllowed("POST", "wallet/deploy")).toBe(false);
});

test("POST /v1/auth/email/request-code and /verify-code are allowed", () => {
  expect(isPathAllowed("POST", "auth/email/request-code")).toBe(true);
  expect(isPathAllowed("POST", "auth/email/verify-code")).toBe(true);
});

test("POST /v1/auth/email/something-else is rejected", () => {
  expect(isPathAllowed("POST", "auth/email/something-else")).toBe(false);
});

test("POST /v1/auth/email/register-account is allowed", () => {
  expect(isPathAllowed("POST", "auth/email/register-account")).toBe(true);
});

test("POST /v1/users/me/generate-wallet is allowed", () => {
  expect(isPathAllowed("POST", "users/me/generate-wallet")).toBe(true);
});

test("POST /v1/users/me/email is allowed", () => {
  expect(isPathAllowed("POST", "users/me/email")).toBe(true);
});
