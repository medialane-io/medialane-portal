"use client";

import { useAccount } from "@starknet-react/core";
import { NavWalletTrigger as SharedNavWalletTrigger, useNavAccountSheet } from "@medialane/ui";
import { useWallet } from "@/src/hooks/use-wallet";
import { useConnectDialog } from "@/src/components/connect-dialog";
import { getConnectorIconSrc } from "@/src/lib/wallet-connectors";

export function HeaderWalletTrigger() {
  const { isConnected } = useWallet();
  const { connector } = useAccount();
  const { open: openAccountSheet } = useNavAccountSheet();
  const { open: openConnectDialog } = useConnectDialog();

  return (
    <SharedNavWalletTrigger
      connected={isConnected}
      iconSrc={isConnected ? getConnectorIconSrc(connector?.icon) : undefined}
      onClick={isConnected ? openAccountSheet : openConnectDialog}
    />
  );
}
