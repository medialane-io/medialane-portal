import { normalizeStarknetAddress } from "./starknet-address";

/**
 * Client-side UI hint ONLY — decides whether to show the admin nav + sign-in
 * affordance. NOT a security boundary: the real authority is the backend's
 * `STARKNET_ADMIN_ADDRESSES` (checked after a verified SNIP-12 signature in
 * `adminSignatureAuth`). A wallet that passes this client check still gets a
 * 403 from the backend unless it's in the backend allowlist.
 *
 * Set comma-separated addresses via `NEXT_PUBLIC_STARKNET_ADMIN_ADDRESSES`
 * (NEXT_PUBLIC_ so the client bundle can read it). `NEXT_PUBLIC_ADMIN_ADDRESSES`
 * is a transitional fallback — drop it once Vercel env is migrated.
 */
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
