"use client";

import { type TypedData } from "starknet";

export interface WalletSigner {
  signMessage: (typedData: TypedData) => Promise<unknown>;
}

/**
 * Normalize a wallet signature to a felt-string array — the dapp's proven shape.
 * Pass arrays through raw (`.map(String)`): Braavos returns a longer, signer-
 * prefixed array that `stark.formatSignature` mangles, which breaks on-chain
 * `is_valid_signature`. Handle `{r,s}` objects too.
 */
function normalizeSignature(signature: unknown): string[] {
  if (Array.isArray(signature)) return signature.map(String);
  if (signature && typeof signature === "object") {
    const { r, s } = signature as { r?: unknown; s?: unknown };
    if (r !== undefined && s !== undefined) return [String(r), String(s)];
  }
  return [String(signature)];
}

/**
 * Runs the portal sign-in: fetch a challenge, sign it with the wallet, post the
 * signature to /api/auth/verify (which verifies on-chain, resolves the Account,
 * and sets the HttpOnly session cookie). Throws with a usable message on failure.
 */
export async function requestPortalSession(address: string, signer: WalletSigner): Promise<void> {
  const challengeRes = await fetch(`/api/auth/challenge?address=${address}`);
  const challengeData = await challengeRes.json();
  if (!challengeRes.ok) throw new Error(challengeData.error ?? "Failed to get challenge");
  const { nonce, typedData } = challengeData;

  const sigArray = normalizeSignature(await signer.signMessage(typedData));

  const verifyRes = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, nonce, signature: sigArray, chain: "STARKNET" }),
  });
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(err.error ?? "Sign-in failed");
  }
}
