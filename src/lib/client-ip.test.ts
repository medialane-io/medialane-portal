import { test, expect } from "bun:test";
import { trustedClientIp, isSpoofableForwardingHeader } from "./client-ip";

const req = (headers: Record<string, string>) =>
  new Request("https://www.medialane.io/api/proxy/v1/tokens", { headers });

test("the edge value is preferred over anything the caller sent", () => {
  expect(trustedClientIp(req({
    "x-vercel-forwarded-for": "203.0.113.9",
    "x-forwarded-for": "6.6.6.6",
  }))).toBe("203.0.113.9");
});

test("a spoofed leftmost forwarded-for entry is ignored", () => {
  expect(trustedClientIp(req({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
});

test("rotating the spoofed prefix cannot change the derived key", () => {
  const a = trustedClientIp(req({ "x-forwarded-for": "1.1.1.1, 203.0.113.9" }));
  const b = trustedClientIp(req({ "x-forwarded-for": "2.2.2.2, 203.0.113.9" }));
  expect(a).toBe(b);
});

test("every header a caller could use to assert an address is refused forwarding", () => {
  for (const h of [
    "x-forwarded-for", "X-Forwarded-For", "x-real-ip", "x-client-ip",
    "true-client-ip", "cf-connecting-ip", "x-medialane-client-ip",
  ]) {
    expect(isSpoofableForwardingHeader(h)).toBe(true);
  }
});

test("ordinary headers are still forwarded", () => {
  for (const h of ["authorization", "content-type", "accept", "user-agent"]) {
    expect(isSpoofableForwardingHeader(h)).toBe(false);
  }
});

test("no forwarding headers yields a stable sentinel rather than undefined", () => {
  expect(trustedClientIp(req({}))).toBe("unknown");
});
