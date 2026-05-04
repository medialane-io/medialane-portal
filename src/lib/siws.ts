import { randomBytes } from "crypto";
import { RpcProvider, typedData as sdkTypedData } from "starknet";
import { pool } from "./db";

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

export function buildTypedData(nonce: string, address: string) {
  return {
    types: TYPES,
    primaryType: "SignIn",
    domain: DOMAIN,
    message: { nonce, address },
  };
}

export async function generateNonce(address: string): Promise<string> {
  await pool.query("DELETE FROM nonces WHERE expires_at < now()");

  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await pool.query(
    "INSERT INTO nonces (nonce, address, expires_at) VALUES ($1, $2, $3)",
    [nonce, address.toLowerCase(), expiresAt]
  );

  return nonce;
}

export async function consumeNonce(nonce: string, address: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM nonces WHERE nonce = $1 AND address = $2 AND expires_at > now() RETURNING nonce",
    [nonce, address.toLowerCase()]
  );
  return (result.rowCount ?? 0) > 0;
}

// Magic bytes returned by Argent X account contracts for a valid signature
const FELT_VALID = "0x56414c4944";

export async function verifySignature(
  address: string,
  nonce: string,
  signature: string[]
): Promise<boolean> {
  const rpcUrl = process.env.STARKNET_RPC_URL;
  if (!rpcUrl) throw new Error("STARKNET_RPC_URL is not set");

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const typedDataPayload = buildTypedData(nonce, address);
  const msgHash = sdkTypedData.getMessageHash(typedDataPayload, address);

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
