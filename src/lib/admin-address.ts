/**
 * Module-level holder for the connected admin wallet address, so the plain
 * `adminFetch` helper (not a hook) can attach it as the `x-admin-address`
 * header on every /api/admin/* request. Set by the admin layout when an
 * allowlisted wallet is connected.
 */
let current: string | null = null;

export function setAdminAddress(address: string | null): void {
  current = address;
}

export function getAdminAddress(): string | null {
  return current;
}
