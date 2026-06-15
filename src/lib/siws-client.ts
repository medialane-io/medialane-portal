"use client";

import { stark, type TypedData } from "starknet";

export interface SiwsSigner {
  signMessage: (typedData: TypedData) => Promise<unknown>;
}

/**
 * Runs the portal sign-in: fetch a challenge, sign it with the wallet, post the
 * signature to the portal's verify endpoint (which sets the HttpOnly session
 * cookie). Throws with a usable message on any failure.
 */
export async function requestPortalSession(
  address: string,
  signer: SiwsSigner
): Promise<void> {
  const challengeRes = await fetch(`/api/auth/challenge?address=${address}`);
  const challengeData = await challengeRes.json();
  if (!challengeRes.ok) {
    throw new Error(challengeData.error ?? "Failed to get challenge");
  }
  const { nonce, typedData } = challengeData;

  const signature = await signer.signMessage(typedData);
  // Handles every wallet's signature shape (Braavos's longer signer-prefixed
  // array, Argent's [r, s], object {r, s}) → decimal felt strings.
  const sigArray = stark.formatSignature(signature);

  const verifyRes = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, nonce, signature: sigArray }),
  });
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(err.error ?? "Sign-in failed");
  }
}
