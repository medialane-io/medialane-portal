// NOTE: Auth was removed in the wallet/connection rebuild. The admin pages and
// their /api/admin/* routes are currently OPEN (no gate). Re-gating is a
// follow-up once the new wallet-based access model is decided.
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
