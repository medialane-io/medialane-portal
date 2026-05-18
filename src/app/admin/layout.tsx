import { getSession } from "@/src/lib/session";
import { pool } from "@/src/lib/db";
import { redirect } from "next/navigation";

const API_URL = process.env.MEDIALANE_API_URL!;
const ADMIN_KEY = process.env.ADMIN_API_KEY!;

async function getPendingReportCount(): Promise<number> {
  try {
    const res = await fetch(
      `${API_URL}/admin/reports?status=PENDING,UNDER_REVIEW&limit=1`,
      { headers: { "x-api-key": ADMIN_KEY }, next: { revalidate: 30 } }
    );
    const data = await res.json();
    return data.total ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/?connect=1");

  const result = await pool.query<{ is_admin: boolean }>(
    "SELECT is_admin FROM accounts WHERE address = $1",
    [session.address]
  );
  if (!result.rows[0]?.is_admin) redirect("/");

  const pendingReports = await getPendingReportCount();

  const navItems = [
    { label: "Dashboard",   href: "/admin" },
    { label: "Claims",      href: "/admin/claims" },
    { label: "Collections", href: "/admin/collections" },
    { label: "Reports",     href: "/admin/reports",     badge: pendingReports > 0 ? pendingReports : undefined },
    { label: "Tokens",      href: "/admin/tokens" },
    { label: "Creators",    href: "/admin/creators" },
    { label: "Maintenance", href: "/admin/maintenance" },
  ];

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
              {item.badge !== undefined && (
                <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
