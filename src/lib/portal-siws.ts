import { randomBytes } from "crypto";
import { RpcProvider, typedData as sdkTypedData, type TypedData } from "starknet";
import { pool } from "./db";
import { normalizeStarknetAddress } from "./starknet-address";

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

const FELT_VALID = "0x56414c4944";

export async function verifyStarknetSignature(
  address: string,
  nonce: string,
  signature: string[],
): Promise<boolean> {
  // Public RPC fallback so a missing STARKNET_RPC_URL can't take sign-in down.
  const rpcUrl =
    process.env.STARKNET_RPC_URL ||
    process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
    process.env.NEXT_PUBLIC_RPC_URL ||
    "https://free-rpc.nethermind.io/mainnet-juno";

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const msgHash = sdkTypedData.getMessageHash(buildTypedData(nonce, address), address);

  try {
    const result = await provider.callContract({
      contractAddress: address,
      entrypoint: "is_valid_signature",
      calldata: [msgHash, signature.length.toString(), ...signature],
    });
    return result[0] === FELT_VALID || result[0] === "0x1";
  } catch {
    return false;
  }
}
