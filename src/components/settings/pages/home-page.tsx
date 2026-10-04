"use client";

import { LifeBuoy, Mail, Smartphone, Wallet } from "lucide-react";
import { AccountStatus } from "@/components/settings/account-status";
import { SettingsGate, SettingsGroup, SettingsPage, SettingsRow } from "@/components/settings/settings-shell";
import { useAccountEmail } from "@/hooks/use-account-email";
import { useSecurityStatus } from "@/hooks/use-security-status";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { emailRow, recoveryRow, walletRow } from "@/lib/settings/rows";

export default function SettingsHomePage() {
  const { address, isDeployed } = useWalletNativeSession();
  const { status: email } = useAccountEmail();
  const { devices, recovery } = useSecurityStatus(address);

  return (
    <SettingsGate>
      <SettingsPage title="Settings" subtitle="Your account, the devices that can sign for it, and how to recover it." back={false}>
        <AccountStatus address={address} email={email} walletDeployed={isDeployed} devices={devices} recovery={recovery} />
        <SettingsGroup label="Account">
          <SettingsRow href="/settings/email" icon={Mail} label="Email" status={emailRow(email)} />
          <SettingsRow href="/settings/wallet" icon={Wallet} label="Wallet" status={walletRow(isDeployed)} />
        </SettingsGroup>
        <SettingsGroup label="Security">
          <SettingsRow href="/settings/devices" icon={Smartphone} label="Devices" />
          <SettingsRow href="/settings/recovery" icon={LifeBuoy} label="Recovery" status={recoveryRow(recovery)} />
        </SettingsGroup>
      </SettingsPage>
    </SettingsGate>
  );
}
