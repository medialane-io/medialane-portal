import type { SealedOwner } from "./passkey";

export type OwnerKind = "derived" | "sealed";

export function ownerKind(sealed: SealedOwner): OwnerKind {
  return sealed.iv && sealed.ciphertext ? "sealed" : "derived";
}

export function travelsWithThePasskey(sealed: SealedOwner): boolean {
  return ownerKind(sealed) === "derived";
}
