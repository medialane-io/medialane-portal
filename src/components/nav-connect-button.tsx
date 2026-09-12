"use client";

import Link from "next/link";
import { useNavCommandMenu } from "@medialane/ui";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useMediaWallet } from "@/components/media-wallet/media-wallet-overlay";
import { UserShieldIcon } from "@/components/icons/user-shield-icon";

export function NavConnectButton() {
  const { hasWallet } = useWalletNativeSession();
  const { close: closeMenu } = useNavCommandMenu();
  const { open: openWalletPanel } = useMediaWallet();

  if (!hasWallet) {
    return (
      <span className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground/50">
        <div className="btn-border-animated rounded-lg p-[1px]">
          <Link
            href="/connect"
            onClick={closeMenu}
            className="flex items-center gap-1.5 rounded-[7px] bg-transparent px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <UserShieldIcon className="h-3 w-3" />
            Connect
          </Link>
        </div>
        <Kbd />
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground/50">
      <button
        type="button"
        onClick={() => {
          closeMenu();
          openWalletPanel();
        }}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ backgroundColor: "hsl(var(--brand-blue))" }}
      >
        <UserShieldIcon className="h-3 w-3 text-white" />
        Connect
      </button>
      <Kbd />
    </span>
  );
}

function Kbd() {
  return (
    <kbd className="hidden min-w-[18px] items-center justify-center rounded-md bg-muted/60 px-1.5 py-0.5 font-sans text-[10px] leading-none text-muted-foreground sm:inline-flex">
      ⌘K
    </kbd>
  );
}
