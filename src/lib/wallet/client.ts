"use client";

import { createAppWallet } from "@medialane/ui";
import { walletProvider } from "./provider";
import { sessionEmail } from "@/hooks/use-session";

const PRODUCTION_RP_ID = "portal.medialane.io";

export function relyingPartyId(host: string): string {
  return host === PRODUCTION_RP_ID ? PRODUCTION_RP_ID : host;
}

export const { ownerStore, passkeyOwner, walletConsent, mediaWallet } = createAppWallet({
  appName: "Medialane Portal",
  relyingPartyId: () => relyingPartyId(location.hostname),
  storeKey: "medialane-io.wallet.owner.v1",
  changeEvent: "mlio-wallet",
  prfSalt: "medialane://portal/owner-key/v1",
  hkdfInfo: "medialane-portal-owner-key",
  provider: walletProvider,
  loadAccountEmail: sessionEmail,
});
