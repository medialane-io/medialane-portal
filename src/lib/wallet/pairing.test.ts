import { test, expect } from "bun:test";
import { encodePairingPayload, parsePairingPayload, parseAccountAddress, InvalidPairingPayloadError } from "./pairing";

const PUBKEY = "0x151c1fe8a4c7edba2dab3e168c4ab4638c606b5f6a14bdfdbd68c7f3241ac5";

test("round-trips a public key and label", () => {
  const encoded = encodePairingPayload({ publicKey: PUBKEY, label: "iPhone" });
  expect(parsePairingPayload(encoded)).toEqual({ publicKey: PUBKEY, label: "iPhone" });
});

test("normalises the public key so the same key never yields two guids", () => {
  const encoded = encodePairingPayload({ publicKey: PUBKEY.toUpperCase().replace("0X", "0x"), label: "a" });
  expect(parsePairingPayload(encoded).publicKey).toBe(PUBKEY);
});

test("rejects a payload that is not this scheme", () => {
  for (const bad of ["", "nonsense", "https://evil.example", "{}", '{"publicKey":"0x1"}']) {
    expect(() => parsePairingPayload(bad)).toThrow(InvalidPairingPayloadError);
  }
});

test("rejects a zero public key", () => {
  expect(() => encodePairingPayload({ publicKey: "0x0", label: "a" })).toThrow(InvalidPairingPayloadError);
});

test("rejects a public key at or above the stark field prime", () => {
  const prime = (1n << 251n) + 17n * (1n << 192n) + 1n;
  expect(() => encodePairingPayload({ publicKey: `0x${prime.toString(16)}`, label: "a" })).toThrow(
    InvalidPairingPayloadError,
  );
});

test("rejects a non-hex public key", () => {
  for (const bad of ["0xzz", "151c1fe8", "0x 1", "0x1n"]) {
    expect(() => encodePairingPayload({ publicKey: bad, label: "a" })).toThrow(InvalidPairingPayloadError);
  }
});

test("truncates an over-long label rather than trusting it", () => {
  const encoded = encodePairingPayload({ publicKey: PUBKEY, label: "x".repeat(500) });
  expect(parsePairingPayload(encoded).label.length).toBe(32);
});

test("collapses whitespace in the label so it cannot spoof the approval prompt", () => {
  const spoof = ["iPhone", "approved"].join(String.fromCharCode(10) + "  ");
  const encoded = encodePairingPayload({ publicKey: PUBKEY, label: spoof });
  expect(parsePairingPayload(encoded).label).toBe("iPhone approved");
});

test("accepts a well-formed account address", () => {
  expect(parseAccountAddress("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")).toBe(
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  );
});

test("rejects an address that is not valid", () => {
  for (const bad of ["", "0x0", "nonsense", "0xzz", "1234"]) {
    expect(() => parseAccountAddress(bad)).toThrow(InvalidPairingPayloadError);
  }
});

test("trims surrounding whitespace from a pasted address", () => {
  const addr = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
  expect(parseAccountAddress(`  ${addr}  `)).toBe(addr);
});
