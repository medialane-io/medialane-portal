"use client";

import {
  createMediaWallet,
  createOwnerStore,
  createPasskeyOwner,
  createSelfFundConsent,
  estimateSelfFundedFee,
  sponsoredExecutor,
} from "@medialane/sdk/starknet";
import { walletProvider } from "./provider";
import { loadAccountEmail } from "./account-wallet";

const bytes = (value: string): Uint8Array<ArrayBuffer> =>
  new TextEncoder().encode(value) as Uint8Array<ArrayBuffer>;

const STORE_KEY = "medialane-io.wallet.owner.v1";
const CHANGE_EVENT = "mlio-wallet";

export const ownerStore = createOwnerStore({ storeKey: STORE_KEY, changeEvent: CHANGE_EVENT });

async function stableUserId(email: string): Promise<Uint8Array<ArrayBuffer>> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return new Uint8Array(digest);
}

export const passkeyOwner = createPasskeyOwner({
  appName: "Medialane Portal",
  relyingPartyName: "Medialane Portal",
  relyingPartyId: () => location.hostname,
  prfSalt: bytes("medialane://portal/owner-key/v1"),
  hkdfInfo: bytes("medialane-portal-owner-key"),
  passkeyUser: async () => {
    const email = loadAccountEmail();
    if (!email) {
      return {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "Medialane Portal",
        displayName: "Medialane Portal",
      };
    }
    return { id: await stableUserId(email), name: email, displayName: email };
  },
  knownCredentials: () => {
    const id = ownerStore.load()?.credentialId;
    if (!id) return [];
    const binary = atob(id);
    const raw = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) raw[i] = binary.charCodeAt(i);
    return [{ type: "public-key", id: raw }];
  },
});

export const walletConsent = createSelfFundConsent((address, calls) =>
  estimateSelfFundedFee(walletProvider(), address, calls),
);

export const mediaWallet = createMediaWallet({
  store: ownerStore,
  passkey: passkeyOwner,
  executor: sponsoredExecutor({
    provider: walletProvider,
    proxyUrl: "/api/wallet/sponsored-invoke",
    consent: walletConsent,
  }),
  provider: walletProvider,
  backendUrl: "/api/proxy",
  deployProxyUrl: "/api/wallet/deploy-sponsored",
});
