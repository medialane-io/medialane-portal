import { describe, expect, test } from "bun:test";
import { accountStatus, type StatusInput } from "./status";

const base: StatusInput = {
  address: "0x01575d29b83d7828cd1d833ef785083b809adeb187b6ac14aab21db568f2bf02",
  email: { email: "team@example.com", verified: true },
  walletDeployed: true,
  devices: 2,
  recovery: "ready",
};

describe("the headline", () => {
  test("is empty until the email and the wallet are known", () => {
    expect(accountStatus({ ...base, email: null }).headline).toBeNull();
    expect(accountStatus({ ...base, walletDeployed: null }).headline).toBeNull();
    expect(accountStatus({ ...base, recovery: "unknown" }).headline).toBeNull();
  });

  test("asks for an email first, then its confirmation", () => {
    expect(accountStatus({ ...base, email: { email: null, verified: false } }).headline).toMatchObject({
      tone: "warn",
      href: "/settings/email",
    });
    expect(accountStatus({ ...base, email: { email: "team@example.com", verified: false } }).headline?.text).toContain("Confirm your email");
  });

  test("says the wallet is setting up before it asks about recovery", () => {
    expect(accountStatus({ ...base, walletDeployed: false, recovery: "missing" }).headline).toMatchObject({ tone: "muted" });
  });

  test("asks for recovery when it is missing", () => {
    expect(accountStatus({ ...base, recovery: "missing" }).headline).toMatchObject({
      tone: "warn",
      href: "/settings/recovery",
    });
  });

  test("says everything works when it does", () => {
    expect(accountStatus(base).headline).toEqual({ tone: "ok", text: "Everything is working" });
  });
});

describe("the lines", () => {
  test("show the address shortened, the devices counted and the recovery state", () => {
    const { lines } = accountStatus({ ...base, devices: 1, recovery: "missing" });
    expect(lines.find((l) => l.id === "wallet")?.value).toBe("0x0157…bf02");
    expect(lines.find((l) => l.id === "devices")?.value).toBe("1 signing device");
    expect(lines.find((l) => l.id === "recovery")).toMatchObject({ value: "Not set up", action: { href: "/settings/recovery" } });
  });

  test("show nothing for a value that has not loaded", () => {
    const { lines } = accountStatus({ ...base, email: null, devices: null, recovery: "unknown", walletDeployed: null });
    expect(lines.map((l) => l.value)).toEqual([null, null, null, null]);
  });
});
