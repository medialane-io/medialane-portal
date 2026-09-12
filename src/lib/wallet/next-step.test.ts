import { test, expect } from "bun:test";
import { destinationAfterSignIn } from "./next-step";

test("somebody new gets a wallet made for them", () => {
  expect(destinationAfterSignIn({ accountExisted: false, walletAdopted: false, hasLocalKey: false })).toBe("onboard");
});

test("an account that turns out to have no wallet yet gets one", () => {
  expect(destinationAfterSignIn({ accountExisted: true, walletAdopted: false, hasLocalKey: false })).toBe("onboard");
});

test("arriving from another site, the account is known but its key is not here, so pair", () => {
  expect(destinationAfterSignIn({ accountExisted: true, walletAdopted: true, hasLocalKey: false })).toBe("pair");
});

test("signing in again where the key already lives just carries on", () => {
  expect(destinationAfterSignIn({ accountExisted: true, walletAdopted: true, hasLocalKey: true })).toBe("continue");
});

test("an existing account is never sent to onboarding once its wallet is known", () => {
  for (const hasLocalKey of [true, false]) {
    expect(destinationAfterSignIn({ accountExisted: true, walletAdopted: true, hasLocalKey })).not.toBe("onboard");
  }
});
