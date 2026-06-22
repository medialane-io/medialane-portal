"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShieldAlert, Wallet, KeyRound } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { isAdminAddress } from "@/src/lib/admin-allowlist";
import { getAdminSession, startAdminSession, clearAdminSession } from "@/src/lib/admin-session";
import { Button } from "@/src/components/ui/button";

// Access control is server-side: every /api/admin/* request is authorized by a
// signed-request session the backend verifies (SNIP-12 grant + session-key
// signature). The client gate below only decides whether to SHOW the admin UI
// (NEXT_PUBLIC_ADMIN_ADDRESSES is a UI hint, not a boundary).
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
  const { address, account, isConnected } = useAccount();
  const allowed = isConnected && isAdminAddress(address);

  const [hasSession, setHasSession] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setHasSession(!!getAdminSession()); }, []);

  async function signInAdmin() {
    if (!account || !address) return;
    setSigning(true);
    setError(null);
    try {
      await startAdminSession(address, async (typedData) => {
        const sig = await account.signMessage(typedData as never);
        return Array.isArray(sig) ? sig.map(String) : [String((sig as { r: unknown }).r), String((sig as { s: unknown }).s)];
      });
      setHasSession(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setSigning(false);
    }
  }

  function signOutAdmin() {
    clearAdminSession();
    setHasSession(false);
  }

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

  if (!hasSession) {
    return (
      <div className="container mx-auto px-4 py-6 pt-28">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4 text-center py-16">
          <KeyRound className="w-10 h-10 text-primary" />
          <h1 className="text-xl font-semibold text-white">Sign in to admin</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Sign one message to start an admin session. Your wallet authorizes a
            short-lived key that signs each admin request — no password, no key on
            a server.
          </p>
          <Button
            onClick={signInAdmin}
            disabled={signing}
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
          >
            {signing ? "Check your wallet…" : "Sign in to admin"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-28">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</p>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={signOutAdmin}>
            End admin session
          </Button>
        </div>
        <nav className="flex gap-4 mt-3 border-b border-border pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
