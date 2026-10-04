import { describe, expect, test } from "bun:test";
import { emailRow, recoveryRow, walletRow } from "./rows";

describe("settings rows", () => {
  test("the email row waits for the status, then says set, confirmed or not confirmed", () => {
    expect(emailRow(null)).toBeNull();
    expect(emailRow({ email: null, verified: false })).toEqual({ value: "Not set", tone: "warn" });
    expect(emailRow({ email: "a@b.co", verified: true })).toEqual({ value: "Confirmed", tone: "ok" });
    expect(emailRow({ email: "a@b.co", verified: false })).toEqual({ value: "Not confirmed", tone: "warn" });
  });

  test("the wallet row only speaks while the wallet is setting up", () => {
    expect(walletRow(false)).toEqual({ value: "Setting up", tone: "warn" });
    expect(walletRow(true)).toBeUndefined();
    expect(walletRow(null)).toBeUndefined();
  });

  test("the recovery row says ready or not set up, and nothing while unknown", () => {
    expect(recoveryRow("ready")).toEqual({ value: "Ready", tone: "ok" });
    expect(recoveryRow("missing")).toEqual({ value: "Not set up", tone: "warn" });
    expect(recoveryRow("unknown")).toBeUndefined();
  });
});
