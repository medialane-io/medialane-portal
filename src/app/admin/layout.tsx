"use client";

import { useAccount } from "@starknet-react/core";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();

const navItems = [
  { label: "Dashboard",   href: "/admin" },
  { label: "Services",    href: "/admin/services" },
  { label: "Claims",      href: "/admin/claims" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Reports",     href: "/admin/reports" },
  { label: "Tokens",      href: "/admin/tokens" },
  { label: "Creators",    href: "/admin/creators" },
  { label: "Maintenance", href: "/admin/maintenance" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { address, status } = useAccount();

  if (status === "connecting") {
    return <div className="container mx-auto px-4 py-6 pt-28 text-muted-foreground text-sm">Connecting…</div>;
  }

  if (!address || address.toLowerCase() !== ADMIN_ADDRESS) {
    return <div className="container mx-auto px-4 py-6 pt-28 text-muted-foreground text-sm">Not authorized.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 pt-28">
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</p>
        <nav className="flex gap-4 mt-3 border-b border-border pb-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
