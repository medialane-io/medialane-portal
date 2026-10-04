import { describe, expect, test } from "bun:test";
import { resolveOnboardingRedirect, type OnboardingGateState } from "./onboarding-gate";

const ready: OnboardingGateState = {
  pathname: "/account",
  hasWallet: true,
  isDeployed: true,
  isDeploying: false,
  emailStatus: { email: "team@example.com", emailVerified: true },
};

const at = (state: Partial<OnboardingGateState>) => resolveOnboardingRedirect({ ...ready, ...state });

describe("someone with no wallet", () => {
  test("is never redirected, so the sign-in and recovery screens stay reachable", () => {
    expect(at({ hasWallet: false })).toBeNull();
    expect(at({ hasWallet: false, isDeployed: false })).toBeNull();
  });
});

describe("public pages", () => {
  test("are never gated, even for a wallet that is not deployed or has no email", () => {
    for (const pathname of ["/", "/pricing", "/services", "/services/ip", "/developers", "/platform"]) {
      expect(at({ pathname, isDeployed: false, emailStatus: { email: null, emailVerified: false } })).toBeNull();
    }
  });

  test("the account setup screens are never gated", () => {
    for (const pathname of ["/connect", "/wallet-onboarding", "/settings", "/settings/email", "/link-device", "/recover"]) {
      expect(at({ pathname, isDeployed: false, emailStatus: { email: null, emailVerified: false } })).toBeNull();
    }
  });
});

describe("the gated pages", () => {
  test("a ready account passes", () => {
    expect(at({})).toBeNull();
    expect(at({ pathname: "/launchpad/ip-ticketing" })).toBeNull();
  });

  test("an undeployed wallet is sent to finish setting up, then back", () => {
    expect(at({ isDeployed: false })).toBe("/wallet-onboarding?redirect_url=%2Faccount");
    expect(at({ pathname: "/launchpad/data-tokenization", isDeployed: false })).toBe(
      "/wallet-onboarding?redirect_url=%2Flaunchpad%2Fdata-tokenization",
    );
  });

  test("not while the deployment is already running", () => {
    expect(at({ isDeployed: false, isDeploying: true })).toBeNull();
  });

  test("a wallet whose deployment is not known yet passes", () => {
    expect(at({ isDeployed: null })).toBeNull();
  });

  test("an account with no email is asked for one, then sent back", () => {
    expect(at({ emailStatus: { email: null, emailVerified: false } })).toBe("/connect?redirect_url=%2Faccount");
  });

  test("an email status that has not loaded passes", () => {
    expect(at({ emailStatus: null })).toBeNull();
  });

  test("the deployment comes before the email", () => {
    expect(at({ isDeployed: false, emailStatus: { email: null, emailVerified: false } })).toBe(
      "/wallet-onboarding?redirect_url=%2Faccount",
    );
  });

  test("a look-alike path is not gated", () => {
    expect(at({ pathname: "/accounts", isDeployed: false })).toBeNull();
  });
});
