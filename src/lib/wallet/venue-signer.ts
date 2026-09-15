import type { StarknetVenueSigner } from "@medialane/sdk/starknet";
import type { SealedOwner } from "@medialane/sdk/starknet";
import { mediaWallet } from "./client";

export const lockVenueSigner = (address: string): void => mediaWallet.lock(address);

export function starknetVenueSigner(sealed: SealedOwner): StarknetVenueSigner {
  return mediaWallet.signerFor(sealed);
}
