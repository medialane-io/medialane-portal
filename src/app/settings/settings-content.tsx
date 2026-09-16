"use client";

import { KeyRound, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { AccountSection } from "@/components/settings/account-section";
import { DevicesSection } from "@/components/settings/devices-section";
import { GuardianRecoverySection } from "@/components/settings/guardian-recovery-section";
import { shortenAddress } from "@medialane/sdk";
import { ExportKeySection } from "@medialane/ui";
import { loadSealedOwner } from "@/lib/wallet/store";
import { unlockOwnerKey } from "@/lib/wallet/passkey";
import { isRecoveryKeyForWallet } from "@medialane/sdk/starknet";
import { friendlyErrorMessage } from "@/lib/friendly-error";

export function SettingsContent() {
  const { address, hasWallet } = useWalletNativeSession();

  if (!hasWallet || !address) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to manage your account, your devices and how you recover them.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">{shortenAddress("STARKNET", address)}</p>
      </header>

      <AccountSection
        icon={UserRound}
        title="Account"
        description="The address everything you own is held under."
      >
        <p className="font-mono text-sm break-all text-muted-foreground">{address}</p>
      </AccountSection>

      <AccountSection
        icon={Smartphone}
        title="Devices"
        description="Each device you approve can sign for this account."
      >
        <DevicesSection walletAddress={address} />
      </AccountSection>

      <AccountSection
        icon={ShieldCheck}
        title="Recovery"
        description="A guardian can return this account to you if you lose every device."
      >
        <GuardianRecoverySection walletAddress={address} />
      </AccountSection>

      <AccountSection
        icon={KeyRound}
        iconColor="text-destructive"
        iconBg="bg-destructive/10"
        title="Export your key"
        description="Take a copy of the key that controls this account. Anyone holding it holds the account."
      >
        <ExportKeySection loadSealed={loadSealedOwner} unlock={unlockOwnerKey} isRecoveryKey={isRecoveryKeyForWallet} describeError={friendlyErrorMessage} />
      </AccountSection>
    </main>
  );
}
