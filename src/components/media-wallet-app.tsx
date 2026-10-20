"use client";

import { MediaWalletOverlay } from "@medialane/ui";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useWalletWriteAction } from "@/hooks/use-wallet-write-action";
import { useEmailVerificationStatus } from "@/hooks/use-email-verification-required";
import { useSession } from "@/hooks/use-session";
import { mediaWallet } from "@/lib/wallet/client";
import { resolveTokenImage } from "@/lib/utils";
import { EXPLORER_URL } from "@/lib/constants";

const EMAIL_BANNER = { href: "/settings/email", text: () => "Validate to access all the platform features" };
const EXTERNAL_WALLET = { href: "https://starknet.medialane.io", label: "Use another Starknet wallet" };

function useAccountEmail(): string | null {
  return useSession().session?.email ?? null;
}

export function MediaWalletApp() {
  return (
    <MediaWalletOverlay
      wallet={mediaWallet}
      resolveImage={resolveTokenImage}
      explorerUrl={EXPLORER_URL}
      emailBanner={EMAIL_BANNER}
      externalWallet={EXTERNAL_WALLET}
      useWalletSession={useWalletNativeSession}
      useWriteAction={useWalletWriteAction}
      useEmailStatus={useEmailVerificationStatus}
      useAccountEmail={useAccountEmail}
    />
  );
}
