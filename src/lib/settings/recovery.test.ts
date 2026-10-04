import { beforeEach, describe, expect, test } from "bun:test";
import { loadRecoveryKeySaved, recoveryState, saveRecoveryKeySaved } from "./recovery";

const WALLET = "0x01575d29b83d7828cd1d833ef785083b809adeb187b6ac14aab21db568f2bf02";

describe("whether an account can be recovered", () => {
  test("one device, no guardian and no saved key is missing recovery", () => {
    expect(recoveryState({ devices: 1, guardians: 0, keySaved: false })).toBe("missing");
  });

  test("a second device is enough", () => {
    expect(recoveryState({ devices: 2, guardians: 0, keySaved: false })).toBe("ready");
  });

  test("a guardian is enough", () => {
    expect(recoveryState({ devices: 1, guardians: 1, keySaved: false })).toBe("ready");
  });

  test("a saved recovery key is enough, even before the chain has been read", () => {
    expect(recoveryState({ devices: null, guardians: null, keySaved: true })).toBe("ready");
  });

  test("until the chain has been read, it is unknown rather than missing", () => {
    expect(recoveryState({ devices: null, guardians: null, keySaved: false })).toBe("unknown");
    expect(recoveryState({ devices: 1, guardians: null, keySaved: false })).toBe("unknown");
  });
});

describe("remembering that the recovery key was saved", () => {
  beforeEach(() => localStorage.clear());

  test("is false until saved, then true for that wallet only", () => {
    expect(loadRecoveryKeySaved(WALLET)).toBe(false);
    saveRecoveryKeySaved(WALLET);
    expect(loadRecoveryKeySaved(WALLET)).toBe(true);
    expect(loadRecoveryKeySaved("0x0222222222222222222222222222222222222222222222222222222222222222")).toBe(false);
  });

  test("matches the same wallet however its address is written", () => {
    saveRecoveryKeySaved(WALLET);
    expect(loadRecoveryKeySaved(WALLET.replace("0x0", "0x"))).toBe(true);
  });
});
