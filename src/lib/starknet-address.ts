/**
 * Canonical form for Starknet addresses stored in the portal DB:
 * lowercase, 0x-prefixed, zero-padded to 64 hex chars.
 *
 * Wallets disagree on padding (0x0123… vs 0x123…), so every address must
 * pass through here before being stored, compared, or queried.
 */
export function normalizeStarknetAddress(address: string): string {
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(address)) {
    throw new Error(`Invalid Starknet address: ${address}`);
  }
  return `0x${BigInt(address).toString(16).padStart(64, "0")}`;
}
