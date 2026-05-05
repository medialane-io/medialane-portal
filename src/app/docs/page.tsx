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
              Connect your Starknet wallet at <Link href="/account" className="text-primary hover:underline">/account</Link> and create an API key from the portal dashboard. You need a minimum of 500 MDLN in your wallet to provision a key.
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
        Credits are the billing unit. Top up by depositing USDC on Starknet from your{" "}
        <Link href="/account" className="text-primary hover:underline">account dashboard</Link>.
        Credits appear within ~2 minutes. Credits never expire.
      </p>
      <p className="text-muted-foreground mb-4 text-sm">
        Different endpoint categories consume different credits per call:
      </p>
      <div className="rounded-xl border border-white/10 overflow-hidden mb-4">
        <div className="grid grid-cols-3 px-5 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Category</span>
          <span className="text-center">Credits</span>
          <span>Examples</span>
        </div>
        {[
          { cat: "Read / query", cost: "1", ex: "Get asset, list collections, search, activity" },
          { cat: "Trade intents", cost: "5", ex: "Create listing, fulfill order, counter-offer" },
          { cat: "Minting", cost: "10", ex: "Mint token, batch mint" },
          { cat: "Launchpad / deploy", cost: "100", ex: "Deploy contract, Collection Drop, POP Protocol" },
        ].map((row, i, arr) => (
          <div key={row.cat} className={`grid grid-cols-3 px-5 py-3 items-start text-sm ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
            <span className="text-white">{row.cat}</span>
            <span className="text-center font-mono font-bold text-primary">{row.cost}</span>
            <span className="text-muted-foreground text-xs">{row.ex}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm mb-3">
        Hold MDLN tokens for a credit multiplier — up to 2× more credits per USDC deposit.
        See the <Link href="/integrate" className="text-primary hover:underline">Integrate page</Link> for tier details.
      </p>
      <p className="text-muted-foreground text-sm">
        When credits run out you receive{" "}
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">402 Payment Required</code>{" "}
        with an{" "}
        <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">X-Credits-Remaining: 0</code>{" "}
        header. Portal management calls (<code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">/v1/portal/*</code>)
        never count toward the credit balance. Autonomous agents can detect the 402 and trigger a
        top-up automatically — see the{" "}
        <Link href="/docs/agents" className="text-primary hover:underline">Agent Quickstart</Link>.
      </p>

      {/* Use cases */}
      <DocH2 id="use-cases">Use Cases</DocH2>
      <p className="text-muted-foreground mb-4 text-sm">
        Both Medialane consumer apps are built on the same API you&apos;re integrating:
      </p>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          {
            domain: "medialane.io",
            role: "Creator Launchpad",
            desc: "Uses Collections, Orders, Minting, Remix Licensing, and On-chain Comments APIs. Runs a ChipiPay invisible-wallet UX for end users.",
          },
          {
            domain: "dapp.medialane.io",
            role: "Permissionless dApp",
            desc: "Uses Activities, Trade Intents, and Asset Metadata APIs with direct starknet.js reads — no backend dependency for browsing.",
          },
        ].map((s) => (
          <div key={s.domain} className="rounded-xl border border-white/10 p-5 space-y-2 bg-white/[0.02]">
            <p className="text-xs font-mono text-muted-foreground">{s.domain}</p>
            <p className="text-sm font-semibold text-white">{s.role}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <DocH3>Common patterns</DocH3>
      <DocCodeBlock lang="ts">{`// Fetch a creator's portfolio
const assets = await client.api.getTokensByOwner({ owner: "0x05f9..." });

// List open-license assets available for remix
import { OPEN_LICENSES } from "@medialane/sdk";
const cc0 = await client.api.getTokens({ licenseType: OPEN_LICENSES });

// Stream on-chain activity
const events = await client.api.getActivities({ eventType: "TRANSFER" });

// Submit a listing intent (agent or wallet)
const intent = await client.api.createListingIntent({ tokenId, price, duration });
const sig = await account.signMessage(intent.typedData);`}</DocCodeBlock>
    </div>
  )
}
