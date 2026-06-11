import { jwtVerify } from "jose";

export type SessionPayload = {
  address: string;
  mdln_tier: number;
  is_admin: boolean;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function verifyTokenEdge(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const raw = payload.mdln_tier;
    const mdln_tier =
      typeof raw === "number" && raw >= 0 && raw <= 3 ? (raw as 0 | 1 | 2 | 3) : 0;
    return {
      address: payload.sub as string,
      mdln_tier,
      is_admin: payload.is_admin === true,
    };
  } catch {
    return null;
  }
}
