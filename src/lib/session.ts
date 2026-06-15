import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  address: string;
  mdln_tier: number;
  is_admin: boolean;
};

const AUTH_TOKEN_COOKIE = "auth-token";
const TOKEN_TTL = "12h";
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<{ token: string }> {
  const token = await new SignJWT({
    sub: payload.address,
    mdln_tier: payload.mdln_tier,
    is_admin: payload.is_admin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());

  return { token };
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
      is_admin: payload.is_admin === true,
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === "production";
  const base = `; Path=/; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
  response.headers.append(
    "Set-Cookie",
    `${AUTH_TOKEN_COOKIE}=${token}; Max-Age=${TOKEN_TTL_SECONDS}${base}`
  );
}

export function clearSessionCookie(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${AUTH_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
}
