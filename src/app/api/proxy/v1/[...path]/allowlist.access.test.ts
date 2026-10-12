import { expect, test } from "bun:test";
import { isPublicAppRoute } from "@medialane/sdk";

test("portal's visitor calls are public", () => {
  for (const [m, p] of [["GET", "prices"], ["GET", "collections"], ["GET", "auth/email/exists"], ["POST", "auth/email/request-code"], ["POST", "auth/email/verify-code"]]) {
    expect([m, p, isPublicAppRoute(m, p)]).toEqual([m, p, true]);
  }
});

test("portal account routes need an account", () => {
  for (const [m, p] of [["GET", "portal/me"], ["POST", "portal/keys"], ["POST", "rpc"], ["POST", "paymaster/invoke/build"], ["GET", "wallet-activity"]]) {
    expect(isPublicAppRoute(m, p)).toBe(false);
  }
});
