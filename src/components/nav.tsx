"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavBrandButton, NavThemeToggle } from "@medialane/ui";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { shortenAddress } from "@medialane/sdk";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/launchpad", label: "Launchpad" },
  { href: "/account", label: "Account" },
];

export function Nav() {
  const pathname = usePathname();
  const { address, hasWallet } = useWalletNativeSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <NavBrandButton />
          <nav className="hidden items-center gap-5 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname.startsWith(link.href) ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NavThemeToggle />
          {hasWallet && address ? (
            <Link
              href="/settings"
              className="rounded-full border border-border/60 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {shortenAddress("STARKNET", address)}
            </Link>
          ) : (
            <Link
              href="/connect"
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
