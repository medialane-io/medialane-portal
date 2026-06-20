"use client";

import { stark, type TypedData, type Signature } from "starknet";

export interface WalletSigner {
  signMessage: (typedData: TypedData) => Promise<unknown>;
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

  const signature = await signer.signMessage(typedData);
  // Normalize every wallet's signature shape (Braavos's signer-prefixed array,
  // Argent's [r, s], object {r, s}) → decimal felt strings.
  const sigArray = stark.formatSignature(signature as Signature);

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
