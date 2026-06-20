import { randomBytes } from "crypto";
import { RpcProvider, type TypedData } from "starknet";
import { pool } from "./db";
import { normalizeStarknetAddress } from "./starknet-address";
import { createFailoverFetch, PUBLIC_RPC_FALLBACKS } from "./rpc-failover";

/**
 * Sign-in challenge + Starknet signature verification. The portal verifies the
 * wallet signature itself (on-chain `is_valid_signature`) — the backend is never
 * a trust anchor for identity. Multichain-ready: the verify route picks the
 * scheme by chain; Starknet (SIWS) ships first, SIWE/Solana/Bitcoin slot in here.
 */
const DOMAIN = {
  name: "Medialane Portal",
  version: "1",
  chainId: "SN_MAIN",
  revision: "1",
} as const;

const TYPES = {
  StarknetDomain: [
    { name: "name", type: "shortstring" },
    { name: "version", type: "shortstring" },
    { name: "chainId", type: "shortstring" },
    { name: "revision", type: "shortstring" },
  ],
  SignIn: [
    { name: "nonce", type: "shortstring" },
    { name: "address", type: "felt" },
  ],
} as const;

export function buildTypedData(nonce: string, address: string): TypedData {
  return { types: TYPES, primaryType: "SignIn", domain: DOMAIN, message: { nonce, address } } as unknown as TypedData;
}

export async function generateNonce(address: string): Promise<string> {
  await pool.query("DELETE FROM nonces WHERE expires_at < now()");
  const nonce = randomBytes(15).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await pool.query(
    "INSERT INTO nonces (nonce, address, expires_at) VALUES ($1, $2, $3)",
    [nonce, normalizeStarknetAddress(address), expiresAt],
  );
  return nonce;
}

export async function consumeNonce(nonce: string, address: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM nonces WHERE nonce = $1 AND address = $2 AND expires_at > now() RETURNING nonce",
    [nonce, normalizeStarknetAddress(address)],
  );
  return (result.rowCount ?? 0) > 0;
}

export type VerifyResult = { ok: true } | { ok: false; reason: "invalid" | "not_deployed" | "rpc_error" };

/**
 * Verify a Starknet wallet signature over the sign-in challenge. Uses starknet.js's
 * `verifyMessageInStarknet` (the proven high-level path — handles Argent AND Braavos
 * signature shapes correctly, unlike a hand-rolled `is_valid_signature` call) with
 * RPC failover. Never swallows errors silently — the reason is logged + returned.
 */
export async function verifyStarknetSignature(
  address: string,
  nonce: string,
  signature: string[],
): Promise<VerifyResult> {
  const nodeUrl =
    process.env.STARKNET_RPC_URL ||
    process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
    "https://starknet-mainnet.public.blastapi.io/rpc/v0_8";
  const provider = new RpcProvider({
    nodeUrl,
    baseFetch: createFailoverFetch([nodeUrl, ...PUBLIC_RPC_FALLBACKS]),
  });

  const td = buildTypedData(nonce, address);
  // Normalize to decimal felt strings — tolerates hex / mixed wallet output.
  const sig = signature.map((v) => BigInt(v).toString());

  try {
    const ok = await provider.verifyMessageInStarknet(td as TypedData, sig, address);
    return ok ? { ok: true } : { ok: false, reason: "invalid" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Counterfactual smart wallet — no deployed contract to call is_valid_signature on.
    if (msg.includes("Contract not found") || msg.includes("not deployed")) {
      console.error("[portal-siws] wallet not deployed:", msg);
      return { ok: false, reason: "not_deployed" };
    }
    console.error("[portal-siws] signature verification error:", msg);
    return { ok: false, reason: "rpc_error" };
  }
}
