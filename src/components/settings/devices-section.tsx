"use client";

import { DevicesSection as SharedDevicesSection } from "@medialane/ui";
import { mediaWallet } from "@/lib/wallet/client";
import { loadSealedOwner } from "@/lib/wallet/store";

export function DevicesSection({ walletAddress }: { walletAddress: string }) {
  return <SharedDevicesSection walletAddress={walletAddress} wallet={mediaWallet} loadSealed={loadSealedOwner} />;
}
