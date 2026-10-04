"use client";

import { GuardianRecoverySection as SharedGuardianRecoverySection } from "@medialane/ui";
import { GUARDIAN_RECOVERY_AVAILABLE } from "@/lib/wallet/guardian";
import { mediaWallet } from "@/lib/wallet/client";
import { loadSealedOwner } from "@/lib/wallet/store";

export function GuardianRecoverySection({ walletAddress }: { walletAddress: string }) {
  return (
    <SharedGuardianRecoverySection
      walletAddress={walletAddress}
      wallet={mediaWallet}
      loadSealed={loadSealedOwner}
      guardianRecoveryAvailable={GUARDIAN_RECOVERY_AVAILABLE}
    />
  );
}
