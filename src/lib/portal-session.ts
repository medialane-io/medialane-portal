import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type PortalSession = {
  accountId: string;
  chain: string;
  address: string;
  token: string;
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
    token: payload.token,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.token !== "string") return null;
    return {
      accountId: payload.sub as string,
      chain: (payload.chain as string) ?? "STARKNET",
      address: payload.address as string,
      token: payload.token,
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
