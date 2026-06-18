import { normalizeStarknetAddress } from "./starknet-address";

/**
 * Admin access = an env allowlist of wallet addresses. No DB, no signing.
 *
 * NOTE: the allowlist checks a CLIENT-SUPPLIED address (the connected wallet,
 * sent as the `x-admin-address` header). Without a signature this is spoofable
 * by anyone who knows an admin's public address — it's a deliberate
 * simplicity-over-strength choice. Harden later with a one-time signature if
 * the threat model needs it.
 *
 * Set one (or more, comma-separated) addresses via env. Checked in order:
 *   NEXT_PUBLIC_ADMIN_ADDRESSES, NEXT_PUBLIC_ADMIN_ADDRESS,
 *   ADMIN_ADDRESSES, ADMIN_ADDRESS
 * (NEXT_PUBLIC_* are needed so the client UI gate can read them too.)
 */
function rawAllowlist(): string {
  return (
    process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ||
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS ||
    process.env.ADMIN_ADDRESSES ||
    process.env.ADMIN_ADDRESS ||
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
