import { test, expect, afterEach } from "bun:test";
import { requestSelfFundConsent, registerSelfFundConsentHandler } from "./self-fund-consent";

afterEach(() => {
  registerSelfFundConsentHandler(null);
});

test("resolves false when no handler is registered — deny by default, never silently spend real funds", async () => {
  expect(await requestSelfFundConsent()).toBe(false);
});

test("delegates to the registered handler and returns its result", async () => {
  registerSelfFundConsentHandler(async () => true);
  expect(await requestSelfFundConsent()).toBe(true);

  registerSelfFundConsentHandler(async () => false);
  expect(await requestSelfFundConsent()).toBe(false);
});

test("a later registration replaces the earlier one", async () => {
  registerSelfFundConsentHandler(async () => true);
  registerSelfFundConsentHandler(async () => false);
  expect(await requestSelfFundConsent()).toBe(false);
});
