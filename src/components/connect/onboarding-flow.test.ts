import { describe, expect, test } from "bun:test";
import { isWalletStep, walletStepLabel, type OnboardingStep } from "./onboarding-flow";

describe("which steps are wallet setup", () => {
  test("the three wallet steps are wallet steps", () => {
    for (const step of ["creating-passkey", "deploying", "signing-in"] as OnboardingStep[]) {
      expect(isWalletStep(step)).toBe(true);
    }
  });

  test("the email, pairing and finished steps are not", () => {
    for (const step of [
      "email",
      "checking-email",
      "code",
      "verifying-code",
      "add-email",
      "pair-or-recover",
      "setup-elsewhere",
      "done",
    ] as OnboardingStep[]) {
      expect(isWalletStep(step)).toBe(false);
    }
  });
});

describe("what the person is told while the wallet is made", () => {
  test("each stage says what is happening", () => {
    expect(walletStepLabel("creating-passkey")).toBe("Creating passkey…");
    expect(walletStepLabel("deploying")).toBe("Setting up your wallet…");
    expect(walletStepLabel("signing-in")).toBe("Signing in…");
  });
});
