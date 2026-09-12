import { test, expect } from "bun:test";

const CANONICAL_RP_ID = "www.medialane.io";
const relyingPartyId = (host: string) =>
  host === "medialane.io" || host.endsWith(".medialane.io") ? CANONICAL_RP_ID : host;

test("the canonical host keeps the value every existing passkey was registered with", () => {
  expect(relyingPartyId("www.medialane.io")).toBe("www.medialane.io");
});

test("the apex resolves to the same value, so moving the canonical host cannot orphan wallets", () => {
  expect(relyingPartyId("medialane.io")).toBe("www.medialane.io");
});

test("any medialane.io subdomain resolves to the same value", () => {
  expect(relyingPartyId("starknet.medialane.io")).toBe("www.medialane.io");
  expect(relyingPartyId("staging.medialane.io")).toBe("www.medialane.io");
});

test("non-production hosts keep their own, so local development still works", () => {
  expect(relyingPartyId("localhost")).toBe("localhost");
  expect(relyingPartyId("medialane-io-abc123.vercel.app")).toBe("medialane-io-abc123.vercel.app");
});

test("a lookalike domain does not inherit the canonical id", () => {
  expect(relyingPartyId("medialane.io.evil.com")).toBe("medialane.io.evil.com");
  expect(relyingPartyId("notmedialane.io")).toBe("notmedialane.io");
});
