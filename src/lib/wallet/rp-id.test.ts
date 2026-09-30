import { test, expect } from "bun:test";
import { relyingPartyId } from "./client";

test("the production host keeps the value every existing portal passkey was registered with", () => {
  expect(relyingPartyId("portal.medialane.io")).toBe("portal.medialane.io");
});

test("non-production hosts keep their own, so local development and previews still work", () => {
  expect(relyingPartyId("localhost")).toBe("localhost");
  expect(relyingPartyId("medialane-portal-abc123.vercel.app")).toBe("medialane-portal-abc123.vercel.app");
});

test("a lookalike domain does not inherit the production id", () => {
  expect(relyingPartyId("portal.medialane.io.evil.com")).toBe("portal.medialane.io.evil.com");
});
