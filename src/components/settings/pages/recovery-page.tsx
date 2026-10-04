"use client";

import { ExportKeySection, describeError } from "@medialane/ui";
import { KeyRound, LifeBuoy } from "lucide-react";
import { AccountSection } from "@/components/settings/account-section";
import { GuardianRecoverySection } from "@/components/settings/guardian-recovery-section";
import { SettingsGate, SettingsPage } from "@/components/settings/settings-shell";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { saveRecoveryKeySaved } from "@/lib/settings/recovery";
import { unlockOwnerKey } from "@/lib/wallet/passkey";
import { loadSealedOwner } from "@/lib/wallet/store";

export default function RecoverySettingsPage() {
  const { address } = useWalletNativeSession();

  return (
    <SettingsGate>
      <SettingsPage title="Recovery" subtitle="How to get back in if you lose every device.">
        <AccountSection
          icon={KeyRound}
          iconColor="text-destructive"
          iconBg="bg-destructive/10"
          title="Recovery key"
          description="A copy of the key that controls this account. Store it somewhere safe and offline. Anyone holding it holds the account."
        >
          <ExportKeySection
            loadSealed={loadSealedOwner}
            unlock={async (sealed) => {
              const key = await unlockOwnerKey(sealed);
              saveRecoveryKeySaved(sealed.address);
              return key;
            }}
            describeError={(err, fallback) => describeError(err, fallback).message}
          />
        </AccountSection>
        <AccountSection
          icon={LifeBuoy}
          title="Guardian"
          description="A guardian can return this account to you if you lose every device."
        >
          {address ? <GuardianRecoverySection walletAddress={address} /> : null}
        </AccountSection>
      </SettingsPage>
    </SettingsGate>
  );
}
