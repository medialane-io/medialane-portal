import { normalizeStarknetAddress } from "./starknet-address";

function rawAllowlist(): string {
  return (
    process.env.NEXT_PUBLIC_STARKNET_ADMIN_ADDRESSES ||
    process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ||
    ""
  );
}

function normalize(address: string): string {
  try {
    return normalizeStarknetAddress(address);
  } catch {
    return address.trim().toLowerCase();
  }
}

export function getAdminAllowlist(): Set<string> {
  return new Set(
    rawAllowlist()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(normalize),
  );
}

export function isAdminAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  const allow = getAdminAllowlist();
  if (allow.size === 0) return false;
  return allow.has(normalize(address));
}
