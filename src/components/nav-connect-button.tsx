"use client";

import { Wallet } from "lucide-react";
import { useNavCommandMenu } from "@medialane/ui";
import { useWallet } from "@/src/hooks/use-wallet";
import { useConnectDialog } from "@/src/components/connect-dialog";

export function NavConnectButton() {
  const { isConnected } = useWallet();
  const { close } = useNavCommandMenu();
  const { open: openConnectDialog } = useConnectDialog();

  if (isConnected) return null;

  return (
    <button
      type="button"
      onClick={() => {
        close();
        openConnectDialog();
      }}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-accent/50"
    >
      <Wallet className="h-3 w-3" />
      Connect
    </button>
  );
}
