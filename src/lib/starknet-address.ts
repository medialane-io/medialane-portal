
export function normalizeStarknetAddress(address: string): string {
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(address)) {
    throw new Error(`Invalid Starknet address: ${address}`);
  }
  return `0x${BigInt(address).toString(16).padStart(64, "0")}`;
}
