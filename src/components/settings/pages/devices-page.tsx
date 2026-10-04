"use client";

import { Smartphone } from "lucide-react";
import { AccountSection } from "@/components/settings/account-section";
import { DevicesSection } from "@/components/settings/devices-section";
import { SettingsGate, SettingsPage } from "@/components/settings/settings-shell";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";

export default function DevicesSettingsPage() {
  const { address } = useWalletNativeSession();

  return (
    <SettingsGate>
      <SettingsPage title="Devices" subtitle="The devices that can sign for your account.">
        <AccountSection
          icon={Smartphone}
          title="Signing devices"
          description="Each device you approve can sign for this account. Keep at least two, so losing one never locks you out."
        >
          {address ? <DevicesSection walletAddress={address} /> : null}
        </AccountSection>
      </SettingsPage>
    </SettingsGate>
  );
}
