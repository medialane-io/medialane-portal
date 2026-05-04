import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"
import { DocH2, DocH3, DocCodeBlock } from "@/src/components/docs/typography"

const ERROR_CODES = [
  { code: "400", name: "Bad Request", desc: "Missing or invalid parameters" },
  { code: "401", name: "Unauthorized", desc: "Missing or invalid x-api-key" },
  { code: "402", name: "Payment Required", desc: "Credit balance is zero — deposit USDC to continue" },
  { code: "403", name: "Forbidden", desc: "Key exists but lacks required permission" },
  { code: "404", name: "Not Found", desc: "Resource does not exist" },
  { code: "409", name: "Conflict", desc: "Duplicate resource or state conflict" },
  { code: "429", name: "Too Many Requests", desc: "Per-minute rate limit exceeded" },
  { code: "500", name: "Server Error", desc: "Internal error — try again or contact support" },
]

export default function DocsPage() {
  return (
    <div className="space-y-2">
      <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-xs">
        Getting Started
      </Badge>

      <h1 className="text-4xl font-extrabold text-white leading-tight">
        Medialane API — Getting Started
      </h1>

      <p className="text-muted-foreground text-lg mt-2 mb-8">
        One REST API for all Starknet IP data. Get a key, make a request, and integrate in minutes.
      </p>

      {/* Quick Start */}
      <DocH2 id="quick-start">Quick Start</DocH2>
      <ol className="space-y-6">
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">1</span>
          <div>
            <p className="text-white font-medium mb-1">Get your API key</p>
            <p className="text-muted-foreground text-sm">
              Connect your Starknet wallet at <Link href="/sign-in" className="text-primary hover:underline">/sign-in</Link> and create an API key from the portal dashboard. You can create up to 5 keys.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">2</span>
          <div>
            <p className="text-white font-medium mb-1">Make your first request</p>
            <DocCodeBlock lang="bash">{`curl https://medialane-backend-production.up.railway.app/v1/orders \\
  -H "x-api-key: ml_live_YOUR_KEY"`}</DocCodeBlock>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">3</span>
          <div>
            <p className="text-white font-medium mb-1">Integrate in your app</p>
            <p className="text-muted-foreground text-sm">
              Use the <Link href="/docs/sdk" className="text-primary hover:underline">@medialane/sdk</Link> for a typed client, or call the REST API directly from any language.
            </p>
          </div>
        </li>
      </ol>

      {/* Platform Surfaces */}
      <section className="mb-12">
        <DocH2 id="ecosystem" border>Platform Surfaces</DocH2>
        <p className="text-sm text-muted-foreground mb-6">
          Medialane has three distinct surfaces. The portal you&apos;re on is for developers. The other two are for end users and autonomous agents.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              label: "portal.medialane.io",
              role: "Developer Portal",
              desc: "API key management, usage dashboard, webhooks, and this documentation. Built for developers integrating the REST API.",
              accent: "border-primary/30 bg-primary/5",
            },
            {
              label: "www.medialane.io",
              role: "Creator Launchpad",
              desc: "Consumer-grade IP marketplace with invisible wallet (ChipiPay). Mint, list, remix, and comment without managing a seed phrase.",
              accent: "border-cyan-500/20 bg-cyan-500/5",
            },
            {
              label: "dapp.medialane.io",
              role: "Permissionless dApp",
              desc: "Fully on-chain reads via starknet.js — no backend dependency. Ideal for Starknet wallet holders and autonomous AI agents.",
              accent: "border-amber-500/20 bg-amber-500/5",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 space-y-2 ${s.accent}`}>
              <p className="text-xs font-mono text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold text-white">{s.role}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Authentication */}
      <DocH2 id="authentication">Authentication</DocH2>
      <p className="text-muted-foreground mb-3">
        All requests require an API key. Pass it in the <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">x-api-key</code> header:
      </p>
      <DocCodeBlock lang="bash">{`curl https://medialane-backend-production.up.railway.app/v1/orders \\
  -H "x-api-key: ml_live_YOUR_KEY"

# Bearer token also accepted:
# -H "Authorization: Bearer ml_live_YOUR_KEY"`}</DocCodeBlock>
      <p className="text-muted-foreground text-sm">
        API keys are prefixed <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">ml_live_</code>. Keep them secret — treat them like passwords.
      </p>

      {/* Base URL */}
      <DocH2 id="base-url">Base URL</DocH2>
      <DocCodeBlock>{`https://medialane-backend-production.up.railway.app`}</DocCodeBlock>
      <p className="text-muted-foreground text-sm">All endpoints are versioned under <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">/v1/</code>.</p>

      {/* Response format */}
      <DocH2 id="response-format">Response Format</DocH2>
      <p className="text-muted-foreground mb-3">All responses are JSON. Successful list responses wrap data in a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">data</code> array with pagination in <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">meta</code>.</p>
      <DocH3>Success</DocH3>
      <DocCodeBlock>{`{
  "data": [...],
  "meta": { "total": 128, "page": 1, "limit": 20 }
}`}</DocCodeBlock>
      <DocH3>Error</DocH3>
      <DocCodeBlock>{`{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}`}</DocCodeBlock>

      {/* Error codes */}
      <DocH2 id="error-codes">Error Codes</DocH2>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-3 px-5 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Code</span>
          <span>Name</span>
          <span>Description</span>
        </div>
        {ERROR_CODES.map((row, i) => (
          <div key={row.code} className={`grid grid-cols-3 px-5 py-3 items-center text-sm ${i < ERROR_CODES.length - 1 ? "border-b border-white/5" : ""}`}>
            <span className="font-mono font-semibold text-red-400">{row.code}</span>
            <span className="text-white">{row.name}</span>
            <span className="text-muted-foreground">{row.desc}</span>
          </div>
        ))}
      </div>

      {/* Credits */}
      <DocH2 id="credits">Credits &amp; Billing</DocH2>
      <p className="text-muted-foreground mb-3 text-sm">
        Every account receives <strong className="text-white">50 free credits per month</strong> (reset on the 1st). Each API call consumes one credit.
        When the free allowance runs out you receive a <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">402 Payment Required</code> response with an <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">X-Credits-Remaining: 0</code> header.
      </p>
      <p className="text-muted-foreground mb-3 text-sm">
        To top up, deposit USDC on Starknet from your <Link href="/account" className="text-primary hover:underline">account dashboard</Link>.
        Credits appear within ~2 minutes. Rate: <strong className="text-white">1 USDC = 100 credits</strong> ($0.01/request).
        Hold MDLN tokens to receive a multiplier — up to 2× more credits per dollar. See the <Link href="/pricing" className="text-primary hover:underline">pricing page</Link> for tier details.
      </p>
      <p className="text-muted-foreground text-sm">
        Portal management calls (<code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">/v1/portal/*</code>) never count toward the credit balance.
        Autonomous agents can detect the 402 and trigger a top-up automatically — see the <Link href="/docs/agents" className="text-primary hover:underline">Agent Quickstart</Link>.
      </p>
    </div>
  )
}
