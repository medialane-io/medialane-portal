import { describe, expect, test } from "bun:test";
import { detectPasskeySupport } from "./passkey-support";

describe("asking the browser whether it can make a passkey here", () => {
  test("a browser that says yes is available", async () => {
    expect(await detectPasskeySupport({ isUserVerifyingPlatformAuthenticatorAvailable: async () => true })).toBe("available");
  });

  test("a browser that says no is unavailable", async () => {
    expect(await detectPasskeySupport({ isUserVerifyingPlatformAuthenticatorAvailable: async () => false })).toBe("unavailable");
  });

  test("a browser with no passkey support at all is unavailable", async () => {
    expect(await detectPasskeySupport(undefined)).toBe("unavailable");
  });

  test("a browser that cannot answer is unknown, never a guess", async () => {
    expect(await detectPasskeySupport({} as never)).toBe("unknown");
    expect(
      await detectPasskeySupport({
        isUserVerifyingPlatformAuthenticatorAvailable: async () => {
          throw new Error("denied");
        },
      }),
    ).toBe("unknown");
  });
});
