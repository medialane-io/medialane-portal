import { describe, expect, test } from "bun:test";
import { describeWalletFailure, isPasskeyCancelled } from "./failures";

const cancelled = Object.assign(new Error("Passkey prompt was cancelled."), { name: "PasskeyCancelledError" });

describe("telling a closed passkey prompt from other failures", () => {
  test("recognises the SDK's cancelled error by name, even from another copy of the package", () => {
    expect(isPasskeyCancelled(cancelled)).toBe(true);
    expect(isPasskeyCancelled(new Error("boom"))).toBe(false);
    expect(isPasskeyCancelled("boom")).toBe(false);
    expect(isPasskeyCancelled(null)).toBe(false);
  });
});

describe("a closed passkey prompt", () => {
  test("says the prompt was closed and what to try, and offers a retry", () => {
    const notice = describeWalletFailure(cancelled);
    expect(notice.kind).toBe("cancelled");
    expect(notice.canRetry).toBe(true);
    expect(notice.message).toContain("The passkey prompt was closed");
    expect(notice.message).toContain("regular browser window");
  });

  test("when the browser says passkeys are not available here, it says exactly that", () => {
    const notice = describeWalletFailure(cancelled, "unavailable");
    expect(notice.kind).toBe("no-passkeys");
    expect(notice.message).toContain("Passkeys aren't available in this window");
    expect(notice.message).toContain("regular browser window");
  });

  test("a browser that says passkeys are available keeps the plain closed-prompt message", () => {
    expect(describeWalletFailure(cancelled, "available").kind).toBe("cancelled");
  });
});

describe("other failures each get their own plain message", () => {
  test("a connection problem asks to check the connection", () => {
    for (const err of [new TypeError("Failed to fetch"), new Error("NetworkError when attempting to fetch resource."), new TypeError("Load failed")]) {
      const notice = describeWalletFailure(err);
      expect(notice.kind).toBe("network");
      expect(notice.message).toBe("We couldn't reach Medialane. Check your connection and try again.");
      expect(notice.canRetry).toBe(true);
    }
  });

  test("a programming error is not blamed on the connection", () => {
    expect(describeWalletFailure(new TypeError("Cannot read properties of undefined (reading 'x')")).kind).toBe("unknown");
  });

  test("a wallet that has not shown up yet is described as still being set up, and nothing is lost", () => {
    const notice = describeWalletFailure(
      new Error("Your wallet was submitted but has not appeared on Starknet yet. Please try again in a moment."),
    );
    expect(notice.kind).toBe("still-deploying");
    expect(notice.message).toBe("Your wallet is still being set up. Give it a minute, then try again. Nothing is lost.");
    expect(notice.message).not.toContain("Starknet");
  });

  test("a failed deployment says the wallet could not be finished, and to try again", () => {
    for (const msg of [
      "Sponsored deploy failed: sponsor down. Self-funded fallback failed: no funds",
      "We couldn't prepare your wallet deployment. Please try again.",
      "We couldn't complete your wallet deployment. Please try again.",
    ]) {
      const notice = describeWalletFailure(new Error(msg));
      expect(notice.kind).toBe("deployment");
      expect(notice.message).toBe("We couldn't finish setting up your wallet. Please try again in a moment.");
      expect(notice.canRetry).toBe(true);
    }
  });

  test("an unsupported browser still gets the short advice and no retry", () => {
    const notice = describeWalletFailure(new Error("This browser didn't return a passkey PRF secret."));
    expect(notice).toEqual({ kind: "unsupported-browser", message: "Browser not supported. Please try another browser.", canRetry: false });
  });

  test("anything else is the short generic message, with a retry", () => {
    expect(describeWalletFailure(new Error("socket hang up"))).toEqual({
      kind: "unknown",
      message: "We couldn't finish setting up your account. Please try again.",
      canRetry: true,
    });
    expect(describeWalletFailure("boom").kind).toBe("unknown");
  });
});

describe("what the messages never say", () => {
  const errors: unknown[] = [
    cancelled,
    new TypeError("Failed to fetch"),
    new Error("has not appeared on Starknet yet"),
    new Error("Sponsored deploy failed: x"),
    new Error("PRF"),
    new Error("nope"),
  ];

  test("no browser names, no technical terms", () => {
    for (const err of errors) {
      for (const support of ["available", "unavailable", "unknown"] as const) {
        const { message } = describeWalletFailure(err, support);
        for (const word of ["Safari", "Chrome", "Brave", "Firefox", "PRF", "WebAuthn", "Starknet", "ERC"]) {
          expect(message).not.toContain(word);
        }
      }
    }
  });
});
