import { jwtVerify } from "jose";

export type SessionPayload = {
  address: string;
  mdln_tier: number;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function verifyTokenEdge(token: string): Promise<SessionPayload | null> {
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
