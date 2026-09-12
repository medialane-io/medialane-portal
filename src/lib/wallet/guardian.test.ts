import { describe, expect, test, mock, afterEach } from "bun:test";
import {
  buildSetFirstGuardianCall,
  buildTriggerEscapeOwnerCall,
  buildCompleteEscapeOwnerCall,
  buildCancelEscapeCall,
} from "@medialane/sdk/starknet";
import type { SealedOwner } from "./passkey";
import { registerSelfFundConsentHandler } from "./self-fund-consent";

const FAKE_SEALED: SealedOwner = {
  credentialId: "cred1", ownerPubKey: "0xabc", address: "0xdeadbeef", iv: "iv1", ciphertext: "ct1",
};

afterEach(() => registerSelfFundConsentHandler(null));

describe("io guardian module", () => {
  test("re-exports the SDK's guardian calldata builders unchanged", async () => {
    const guardian = await import("./guardian");
    expect(guardian.buildSetFirstGuardianCall).toBe(buildSetFirstGuardianCall);
    expect(guardian.buildTriggerEscapeOwnerCall).toBe(buildTriggerEscapeOwnerCall);
    expect(guardian.buildCompleteEscapeOwnerCall).toBe(buildCompleteEscapeOwnerCall);
    expect(guardian.buildCancelEscapeCall).toBe(buildCancelEscapeCall);
  });

  test("exposes the AVNU-sponsored execution wrappers", async () => {
    const guardian = await import("./guardian");
    expect(typeof guardian.setFirstGuardian).toBe("function");
    expect(typeof guardian.triggerEscapeOwner).toBe("function");
    expect(typeof guardian.completeEscapeOwner).toBe("function");
    expect(typeof guardian.cancelEscape).toBe("function");
    expect(typeof guardian.getGuardians).toBe("function");
    expect(typeof guardian.getEscape).toBe("function");
    expect(typeof guardian.getEscapeSecurityPeriod).toBe("function");
  });

  test("setFirstGuardian self-funds when sponsorship is unavailable and the user consents", async () => {
    mock.module("./passkey", () => ({
      unlockOwnerKey: async () => "0xprivkey",
      signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
    }));
    mock.module("./sponsored-executor", () => ({
      executeSponsored: async () => ({ status: "unavailable", reason: "no credits" }),
      SponsoredCallRejectedError: class extends Error {},
    }));
    registerSelfFundConsentHandler(async () => true);
    let selfFundedCalls = 0;
    mock.module("./self-funded", () => ({
      executeSelfFunded: async () => {
        selfFundedCalls++;
        return { transactionHash: "0xselffunded" };
      },
    }));

    const { setFirstGuardian } = await import("./guardian");
    const txHash = await setFirstGuardian(FAKE_SEALED, "0xabc");

    expect(selfFundedCalls).toBe(1);
    expect(txHash).toBe("0xselffunded");
  });

  test("setFirstGuardian throws without self-funding when the user declines", async () => {
    mock.module("./passkey", () => ({
      unlockOwnerKey: async () => "0xprivkey",
      signWithPrivateKey: () => ["0xr", "0xs"] as [string, string],
    }));
    mock.module("./sponsored-executor", () => ({
      executeSponsored: async () => ({ status: "unavailable", reason: "no credits" }),
      SponsoredCallRejectedError: class extends Error {},
    }));
    registerSelfFundConsentHandler(async () => false);
    let selfFundedCalls = 0;
    mock.module("./self-funded", () => ({
      executeSelfFunded: async () => {
        selfFundedCalls++;
        return { transactionHash: "0xselffunded" };
      },
    }));

    const { setFirstGuardian } = await import("./guardian");
    await expect(setFirstGuardian(FAKE_SEALED, "0xabc")).rejects.toThrow("no credits");
    expect(selfFundedCalls).toBe(0);
  });
});
