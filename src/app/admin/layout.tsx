"use client";

import Link from "next/link";
import { ShieldAlert, Wallet } from "lucide-react";
import { useWallet } from "@/src/hooks/use-wallet";
import { isAdminAddress } from "@/src/lib/admin-allowlist";
import { setAdminAddress } from "@/src/lib/admin-address";
import { Button } from "@/src/components/ui/button";

// Access control = env address allowlist (NEXT_PUBLIC_ADMIN_ADDRESSES). The
// client gate below hides the admin UI; every /api/admin/* route independently
// re-checks the x-admin-address header against the same allowlist. Spoofable
// without a signature — see src/lib/admin-allowlist.ts.
const navItems = [
  { label: "Dashboard",   href: "/admin" },
  { label: "Services",    href: "/admin/services" },
  { label: "Tenants",     href: "/admin/tenants" },
  { label: "Claims",      href: "/admin/claims" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Coins",       href: "/admin/coins" },
  { label: "Reports",     href: "/admin/reports" },
  { label: "Moderation",  href: "/admin/moderation" },
  { label: "Rewards",     href: "/admin/rewards" },
  { label: "Tokens",      href: "/admin/tokens" },
  { label: "Creators",    href: "/admin/creators" },
  { label: "Maintenance", href: "/admin/maintenance" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useWallet();
  const allowed = isConnected && isAdminAddress(address);

  // Make the connected address available to adminFetch (sent as x-admin-address)
  // — set during render so it's present before child SWR calls fire.
  setAdminAddress(allowed ? address : null);

  if (!allowed) {
    return (
      <div className="container mx-auto px-4 py-6 pt-28">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4 text-center py-16">
          <ShieldAlert className="w-10 h-10 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-white">Admin access only</h1>
          <p className="text-sm text-muted-foreground">
            {isConnected
              ? "This wallet is not on the admin allowlist."
              : "Connect an admin wallet to continue."}
          </p>
          {!isConnected && (
            <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white">
              <Link href="/?connect=1">
                <Wallet className="w-4 h-4 mr-2" />
                Connect wallet
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-28">
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</p>
        <nav className="flex gap-4 mt-3 border-b border-border pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
