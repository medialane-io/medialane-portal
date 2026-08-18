"use client";

import { NavCommandMenu, NavBrandButton, NavAccountSheet, NavThemeToggle } from "@medialane/ui";
import { NAV_COMMANDS } from "@/src/lib/nav-commands";
import { HeaderWalletTrigger } from "@/src/components/nav-wallet-trigger";
import { AccountPanel } from "@/src/components/account-panel";
import { ConnectDialog } from "@/src/components/connect-dialog";
import { NavConnectButton } from "@/src/components/nav-connect-button";

export function NavShell() {
  return (
    <>
      <NavCommandMenu
        commands={NAV_COMMANDS}
        footerSlot={<NavThemeToggle />}
        accountSlot={<NavConnectButton />}
      />
      <NavAccountSheet>
        <AccountPanel />
      </NavAccountSheet>
      <ConnectDialog />
      <div className="fixed top-4 left-4 sm:left-6 lg:left-8 z-50">
        <NavBrandButton />
      </div>
      <div className="fixed top-4 right-4 sm:right-6 lg:right-8 z-50">
        <HeaderWalletTrigger />
      </div>
    </>
  );
}
