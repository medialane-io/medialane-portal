import { test, expect } from "bun:test";
import { ownerKind, travelsWithThePasskey } from "./sealed-owner";
import type { SealedOwner } from "./passkey";

const base = { credentialId: "cred", ownerPubKey: "0x1", address: "0x2" };
const derived: SealedOwner = { ...base };
const sealed: SealedOwner = { ...base, iv: "aXY=", ciphertext: "Y3Q=" };

test("a wallet with no stored ciphertext is recomputed from its passkey", () => {
  expect(ownerKind(derived)).toBe("derived");
  expect(travelsWithThePasskey(derived)).toBe(true);
});

test("a wallet made before derivation keeps its sealed key and keeps working", () => {
  expect(ownerKind(sealed)).toBe("sealed");
  expect(travelsWithThePasskey(sealed)).toBe(false);
});

test("half a sealed record is not treated as sealed, since it could not be opened", () => {
  expect(ownerKind({ ...base, iv: "aXY=" })).toBe("derived");
  expect(ownerKind({ ...base, ciphertext: "Y3Q=" })).toBe("derived");
});
