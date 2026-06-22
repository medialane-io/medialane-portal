import { createAdminSessionGrant, type AdminSession } from "@medialane/sdk";

const KEY = "ml-admin-session";

/** Read a non-expired session from sessionStorage, or null. */
export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as AdminSession;
    if (s.grant.expiresAt * 1000 <= Date.now()) { clearAdminSession(); return null; }
    return s;
  } catch { clearAdminSession(); return null; }
}

export function clearAdminSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
}

/**
 * Create a session: one wallet signature authorizing an ephemeral key for the
 * admin API. `signMessage` is the connected wallet's signer.
 */
export async function startAdminSession(
  wallet: string,
  signMessage: (typedData: unknown) => Promise<string[]>,
  ttlSeconds = 7200,
): Promise<AdminSession> {
  const session = await createAdminSessionGrant(
    (data) => signMessage(data),
    { wallet, ttlSeconds },
  );
  sessionStorage.setItem(KEY, JSON.stringify(session));
  return session;
}
