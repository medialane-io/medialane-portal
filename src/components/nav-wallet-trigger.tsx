"use client";

import { useRouter } from "next/navigation";
import { NavWalletTrigger as SharedNavWalletTrigger } from "@medialane/ui";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useMediaWallet } from "@/components/media-wallet/media-wallet-overlay";
import { UserShieldIcon } from "@/components/icons/user-shield-icon";

export function HeaderWalletTrigger() {
  const { hasWallet } = useWalletNativeSession();
  const { open } = useMediaWallet();
  const router = useRouter();

  const handleClick = () => {
    if (!hasWallet) {
      router.push("/connect");
    } else {
      open();
    }
  };

  const icon = <UserShieldIcon className="h-[18px] w-[18px]" style={{ color: "hsl(var(--brand-blue))" }} />;

  return (
    <SharedNavWalletTrigger
      connected={hasWallet}
      disconnectedIcon={icon}
      connectedIcon={icon}
      onClick={handleClick}
    />
  );
}
