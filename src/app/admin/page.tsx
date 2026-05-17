const BACKEND_URL = process.env.MEDIALANE_API_URL!;
const ADMIN_KEY = process.env.ADMIN_API_KEY!;

async function getStats() {
  const h = { "x-api-key": ADMIN_KEY };
  const [p, c, f, uc, health] = await Promise.all([
    fetch(`${BACKEND_URL}/admin/claims?status=PENDING&limit=1`, { headers: h, cache: "no-store" }).then(r => r.json()),
    fetch(`${BACKEND_URL}/admin/collections?limit=1`, { headers: h, cache: "no-store" }).then(r => r.json()),
    fetch(`${BACKEND_URL}/admin/collections?metadataStatus=FAILED&limit=1`, { headers: h, cache: "no-store" }).then(r => r.json()),
    fetch(`${BACKEND_URL}/admin/username-claims?status=PENDING&limit=1`, { headers: h, cache: "no-store" }).then(r => r.json()),
    fetch(`${BACKEND_URL}/health`, { cache: "no-store" }).then(r => r.json()),
  ]);
  return {
    pendingClaims: p.total ?? 0,
    totalCollections: c.total ?? 0,
    failedMetadata: f.total ?? 0,
    pendingUsernameClaims: uc.total ?? 0,
    indexer: {
      lastBlock: health.indexer?.lastBlock ?? "—",
      lagBlocks: health.indexer?.lagBlocks ?? "—",
      database: health.database ?? "—",
    },
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Pending Claims",    value: stats.pendingClaims,         href: "/admin/claims" },
    { label: "Total Collections", value: stats.totalCollections,      href: "/admin/collections" },
    { label: "Failed Metadata",   value: stats.failedMetadata,        href: "/admin/collections?metadataStatus=FAILED" },
    { label: "Pending Usernames", value: stats.pendingUsernameClaims, href: "/admin/claims" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <a key={card.label} href={card.href} className="glass rounded-xl p-6 hover:bg-white/5 transition-colors">
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </a>
        ))}
      </div>

      <div className="glass rounded-xl p-4 flex flex-wrap gap-6 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Indexer</p>
          <p className="font-mono font-semibold">Block {stats.indexer.lastBlock}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Lag</p>
          <p className={`font-semibold ${Number(stats.indexer.lagBlocks) > 50 ? "text-destructive" : "text-green-500"}`}>
            {stats.indexer.lagBlocks} blocks
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Database</p>
          <p className={`font-semibold ${stats.indexer.database === "ok" ? "text-green-500" : "text-destructive"}`}>
            {stats.indexer.database}
          </p>
        </div>
      </div>
    </div>
  );
}
