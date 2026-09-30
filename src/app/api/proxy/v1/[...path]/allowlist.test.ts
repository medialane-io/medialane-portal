import { test, expect } from "bun:test";
import { hasTraversalSegment, isPathAllowed } from "./allowlist";

test("an account reaches its own balance, keys, history and spend, and the legacy deposit nudge is gone", () => {
  expect(isPathAllowed("GET", "portal/me")).toBe(true);
  expect(isPathAllowed("GET", "portal/keys")).toBe(true);
  expect(isPathAllowed("GET", "portal/credits/history")).toBe(true);
  expect(isPathAllowed("GET", "portal/credits/spend")).toBe(true);
  expect(isPathAllowed("POST", "portal/keys")).toBe(true);
  expect(isPathAllowed("POST", "portal/credits/check")).toBe(false);
  expect(isPathAllowed("DELETE", "portal/keys/abc-123")).toBe(true);
});

test("signing in and verifying an email are reachable", () => {
  for (const path of ["auth/siws/nonce", "auth/siws/verify", "auth/email/request-code", "auth/email/verify-code"]) {
    expect(isPathAllowed("POST", path)).toBe(true);
  }
});

test("a ticketing run executes through the run routes", () => {
  const run = "portal/runs/run1";
  for (const path of [
    `${run}/files/upload-url`,
    `${run}/files/uploaded`,
    `${run}/metadata`,
    `${run}/wallets`,
    `${run}/wallets/resolve`,
    `${run}/wallets/build`,
    `${run}/collection/build`,
    `${run}/tier/execute`,
    `${run}/batches/2/confirm`,
  ]) {
    expect(isPathAllowed("POST", path)).toBe(true);
  }
  expect(isPathAllowed("POST", `${run}/anything-else`)).toBe(false);
  expect(isPathAllowed("GET", `${run}/metadata`)).toBe(false);
});

test("the old ticketing prefix is gone", () => {
  for (const path of ["wallets/resolve", "tier/build", "batches/0/confirm", "files/upload-url"]) {
    expect(isPathAllowed("POST", `portal/runs/run1/ticketing/${path}`)).toBe(false);
  }
});

test("the portal no longer provisions, issues, pins or builds intents on its own key: those run inside a paid run", () => {
  for (const path of [
    "business/provisioning",
    "business/issuance/emission",
    "metadata/upload",
    "metadata/upload-file",
    "intents/create-tier",
    "intents/create-collection",
    "tx/sync",
  ]) {
    expect(isPathAllowed("POST", path)).toBe(false);
  }
});

test("nothing unlisted gets through, whatever the method", () => {
  for (const method of ["GET", "POST", "PATCH", "PUT", "DELETE"]) {
    expect(isPathAllowed(method, "anything-unlisted")).toBe(false);
    expect(isPathAllowed(method, "admin/pricing")).toBe(false);
    expect(isPathAllowed(method, "orders")).toBe(false);
  }
});

test("a method with no list of its own allows nothing", () => {
  expect(isPathAllowed("PATCH", "portal/me")).toBe(false);
  expect(isPathAllowed("PUT", "portal/keys")).toBe(false);
});

test("a path cannot climb out of /v1", () => {
  expect(hasTraversalSegment("portal/../admin")).toBe(true);
  expect(hasTraversalSegment("portal/./me")).toBe(true);
  expect(hasTraversalSegment("portal/me")).toBe(false);
});

test("a launchpad run is drafted, paid for and executed through its own routes", () => {
  expect(isPathAllowed("GET", "portal/runs")).toBe(true);
  expect(isPathAllowed("POST", "portal/runs")).toBe(true);
  expect(isPathAllowed("GET", "portal/runs/run1")).toBe(true);
  expect(isPathAllowed("PATCH", "portal/runs/run1")).toBe(true);
  for (const step of [
    "cancel",
    "checkout",
    "files/upload-url",
    "files/uploaded",
    "items/0/metadata",
    "batches/0/build",
    "batches/0/execute",
    "batches/0/confirm",
    "collection/build",
    "collection/execute",
    "collection/confirm",
  ]) {
    expect(isPathAllowed("POST", `portal/runs/run1/${step}`)).toBe(true);
  }
  expect(isPathAllowed("GET", "portal/runs/run1/batches/0")).toBe(true);
});

test("a run route does not open anything beside it", () => {
  expect(isPathAllowed("PATCH", "portal/keys/k1")).toBe(false);
  expect(isPathAllowed("DELETE", "portal/runs/run1")).toBe(false);
  expect(isPathAllowed("POST", "portal/runs/run1/files/anything")).toBe(false);
  expect(isPathAllowed("POST", "portal/runs/run1/batches/0/transfer")).toBe(false);
  expect(isPathAllowed("GET", "portal/runs/run1/progress/secret")).toBe(false);
});

test("an account can run a funding: list methods, start, sign, authorize, submit, read and cancel", () => {
  expect(isPathAllowed("GET", "portal/funding/methods")).toBe(true);
  expect(isPathAllowed("GET", "portal/funding/fi_123")).toBe(true);
  expect(isPathAllowed("POST", "portal/funding")).toBe(true);
  for (const step of ["challenge", "authorize", "submit", "cancel"]) {
    expect(isPathAllowed("POST", `portal/funding/fi_123/${step}`)).toBe(true);
  }
});

test("funding cannot be used to reach anything else", () => {
  expect(isPathAllowed("POST", "portal/funding/fi_123/settle")).toBe(false);
  expect(isPathAllowed("POST", "portal/funding/fi_123/challenge/extra")).toBe(false);
  expect(isPathAllowed("DELETE", "portal/funding/fi_123")).toBe(false);
  expect(isPathAllowed("PATCH", "portal/funding/fi_123")).toBe(false);
});
