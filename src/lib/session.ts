import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID, createHash } from "crypto";
import { pool } from "./db";

export type SessionPayload = {
  address: string;
  mdln_tier: number;
};

const AUTH_TOKEN_COOKIE = "auth-token";
const REFRESH_TOKEN_COOKIE = "auth-refresh";
const TOKEN_TTL = "15m";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(payload: SessionPayload): Promise<{
  token: string;
  refreshToken: string;
}> {
  const token = await new SignJWT({
    sub: payload.address,
    mdln_tier: payload.mdln_tier,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());

  const refreshToken = randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  await pool.query(
    "INSERT INTO sessions (address, token_hash, expires_at) VALUES ($1, $2, $3)",
    [payload.address.toLowerCase(), hashToken(refreshToken), expiresAt]
  );

  return { token, refreshToken };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      address: payload.sub as string,
      mdln_tier: payload.mdln_tier as number,
    };
  } catch {
    return null;
  }
}

export async function refreshSession(
  refreshToken: string
): Promise<{ token: string; refreshToken: string } | null> {
  const hash = hashToken(refreshToken);
  const result = await pool.query<{ address: string }>(
    "DELETE FROM sessions WHERE token_hash = $1 AND expires_at > now() RETURNING address",
    [hash]
  );

  if ((result.rowCount ?? 0) === 0) return null;

  const { address } = result.rows[0];
  const wallet = await pool.query<{ mdln_tier: number }>(
    "SELECT mdln_tier FROM accounts WHERE address = $1",
    [address]
  );
  const mdln_tier = wallet.rows[0]?.mdln_tier ?? 0;

  return createSession({ address, mdln_tier });
}

export async function destroySession(refreshToken: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token_hash = $1", [
    hashToken(refreshToken),
  ]);
}

export function setSessionCookies(
  response: Response,
  token: string,
  refreshToken: string
) {
  const secure = process.env.NODE_ENV === "production";
  const base = `; Path=/; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
  response.headers.append("Set-Cookie", `${AUTH_TOKEN_COOKIE}=${token}; Max-Age=900${base}`);
  response.headers.append(
    "Set-Cookie",
    `${REFRESH_TOKEN_COOKIE}=${refreshToken}; Max-Age=${REFRESH_TTL_MS / 1000}${base}`
  );
}

export function clearSessionCookies(response: Response) {
  const base = "; Path=/; HttpOnly; SameSite=Strict; Max-Age=0";
  response.headers.append("Set-Cookie", `${AUTH_TOKEN_COOKIE}=${base}`);
  response.headers.append("Set-Cookie", `${REFRESH_TOKEN_COOKIE}=${base}`);
}
