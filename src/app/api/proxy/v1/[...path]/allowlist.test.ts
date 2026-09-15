import { test, expect } from "bun:test";
import { hasTraversalSegment, isPathAllowed } from "./allowlist";

test("an account reaches its own balance, keys, history and spend", () => {
  expect(isPathAllowed("GET", "portal/me")).toBe(true);
  expect(isPathAllowed("GET", "portal/keys")).toBe(true);
  expect(isPathAllowed("GET", "portal/credits/history")).toBe(true);
  expect(isPathAllowed("GET", "portal/credits/spend")).toBe(true);
  expect(isPathAllowed("POST", "portal/keys")).toBe(true);
  expect(isPathAllowed("POST", "portal/credits/check")).toBe(true);
  expect(isPathAllowed("DELETE", "portal/keys/abc-123")).toBe(true);
});

test("signing in and verifying an email are reachable", () => {
  for (const path of ["auth/siws/nonce", "auth/siws/verify", "auth/email/request-code", "auth/email/verify-code"]) {
    expect(isPathAllowed("POST", path)).toBe(true);
  }
});

test("a launchpad run can provision recipients and issue to them", () => {
  for (const path of [
    "business/provisioning",
    "business/issuance/emission",
    "metadata/upload",
    "metadata/upload-file",
  ]) {
    expect(isPathAllowed("POST", path)).toBe(true);
  }
});

test("only the two intents the launchpad builds are allowed", () => {
  expect(isPathAllowed("POST", "intents/create-tier")).toBe(true);
  expect(isPathAllowed("POST", "intents/create-collection")).toBe(true);
  for (const other of ["intents/mint", "intents/fulfill", "intents/listing", "intents/some-future-type"]) {
    expect(isPathAllowed("POST", other)).toBe(false);
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
