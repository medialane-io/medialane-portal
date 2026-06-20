import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * The portal session. The wallet is authenticated by signature, then resolved to
 * its Account (07-identity §III) — the session carries the AccountID, never a
 * per-wallet backend key. `chain`/`address` record which wallet signed in (any
 * chain); `is_admin` is computed at verify time from the admin allowlist.
 */
export type PortalSession = {
  accountId: string;
  chain: string;
  address: string;
  is_admin: boolean;
};

const SESSION_COOKIE = "portal-session";
const TOKEN_TTL = "12h";
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: PortalSession): Promise<string> {
  return new SignJWT({
    sub: payload.accountId,
    chain: payload.chain,
    address: payload.address,
    is_admin: payload.is_admin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

/** Read + verify the session from the request cookies (server components / route handlers). */
export async function getPortalSession(): Promise<PortalSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      accountId: payload.sub as string,
      chain: (payload.chain as string) ?? "STARKNET",
      address: payload.address as string,
      is_admin: payload.is_admin === true,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === "production";
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}; Max-Age=${TOKEN_TTL_SECONDS}`,
  );
}

export function clearSessionCookie(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  );
}
