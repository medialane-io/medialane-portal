import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { BackgroundGradients } from "@/src/components/background-gradients"
import { Check, Coins, Code2, Webhook, LayoutDashboard, ArrowRight, Zap } from "lucide-react"

const MDLN_TIERS = [
  { range: "500 – 999 MDLN", multiplier: "1.0×", note: "Base access" },
  { range: "1,000 – 1,999 MDLN", multiplier: "1.2×", note: "20% more credits per deposit" },
  { range: "2,000 – 4,999 MDLN", multiplier: "1.5×", note: "50% more credits per deposit" },
  { range: "5,000+ MDLN", multiplier: "2.0×", note: "Double credits per deposit" },
]

const CREDIT_COSTS = [
  { category: "Read / query", credits: "1 credit", examples: "Get asset, list collections, search, activity" },
  { category: "Trade intents (SNIP-12)", credits: "5 credits", examples: "Create listing, fulfill order, counter-offer" },
  { category: "Minting", credits: "10 credits", examples: "Mint token, batch mint" },
  { category: "Launchpad / deploy", credits: "100 credits", examples: "Deploy collection contract, Collection Drop, POP Protocol" },
]

export default function IntegratePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Integrate
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Start Building
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            API access is gated by MDLN token balance. Top up credits with USDC. Hold more MDLN for bonus credits.
          </p>
          <Button asChild size="lg" className="px-10">
            <Link href="/account">Connect Wallet &amp; Get Access</Link>
          </Button>
        </section>

        {/* Section 1: MDLN Access Gate */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Coins className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-white">MDLN Access Gate</h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                To provision an API key you need a minimum of <strong className="text-white">500 MDLN</strong> in
                your wallet. Your tokens stay in your wallet — this is a balance check, not a fee or a lock-up.
                Holding more MDLN increases the credits you receive per USDC deposit.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03] text-sm font-semibold">
                <div className="text-muted-foreground">MDLN Balance</div>
                <div className="text-center text-white">Credit Multiplier</div>
                <div className="text-center text-primary">Bonus</div>
              </div>
              {MDLN_TIERS.map((tier, i) => (
                <div
                  key={tier.range}
                  className={`grid grid-cols-3 px-6 py-4 items-center text-sm ${i < MDLN_TIERS.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="text-muted-foreground font-mono text-xs">{tier.range}</div>
                  <div className="text-center text-white font-bold text-lg">{tier.multiplier}</div>
                  <div className="text-center text-primary text-xs">{tier.note}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              MDLN balance is read on-chain at deposit time. Get MDLN at{" "}
              <a href="https://medialane.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                medialane.io
              </a>
              .
            </p>
          </div>
        </section>

        {/* Section 2: Credit System */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-bold text-white">Credits</h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Credits are the billing unit. Top up by depositing USDC on Starknet from your{" "}
                <Link href="/account" className="text-primary hover:underline">dashboard</Link>.
                Credits never expire. Different endpoint categories consume different amounts per call.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03] text-sm font-semibold">
                <div className="text-muted-foreground">Category</div>
                <div className="text-center text-white">Cost</div>
                <div className="text-muted-foreground">Examples</div>
              </div>
              {CREDIT_COSTS.map((row, i) => (
                <div
                  key={row.category}
                  className={`grid grid-cols-3 px-6 py-4 items-start text-sm gap-4 ${i < CREDIT_COSTS.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="text-white font-medium">{row.category}</div>
                  <div className="text-center">
                    <span className="font-mono font-bold text-primary">{row.credits}</span>
                  </div>
                  <div className="text-muted-foreground text-xs leading-relaxed">{row.examples}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
              <p className="text-sm font-semibold text-amber-300">402 Payment Required</p>
              <p className="text-xs text-muted-foreground">
                When your credit balance reaches zero, the API returns{" "}
                <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded">402 Payment Required</code>{" "}
                with an{" "}
                <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded">X-Credits-Remaining: 0</code>{" "}
                header. AI agents can detect this response and trigger a USDC deposit autonomously.
                See the{" "}
                <Link href="/docs/agents" className="text-amber-300 hover:underline">
                  Agent Quickstart
                </Link>{" "}
                for a code example.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: What you get */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">What you get</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: Code2,
                  title: "REST API",
                  desc: "One API key. All endpoints. Assets, orders, minting, licensing, drops, credentials, comments, and real-time events.",
                  href: "/docs/api",
                  link: "API Reference",
                },
                {
                  icon: Code2,
                  title: "TypeScript SDK",
                  desc: "@medialane/sdk — typed client with on-chain marketplace helpers. Framework-agnostic.",
                  href: "/docs/sdk",
                  link: "SDK Docs",
                },
                {
                  icon: Webhook,
                  title: "Webhooks",
                  desc: "Subscribe to on-chain events. Signed POST payloads pushed to your endpoint the moment an event is indexed.",
                  href: "/docs/api",
                  link: "Webhook Docs",
                },
                {
                  icon: LayoutDashboard,
                  title: "Dashboard",
                  desc: "Manage API keys, view credit balance, deposit USDC, and inspect usage history from your account.",
                  href: "/account",
                  link: "Go to Dashboard",
                },
              ].map((item) => (
                <Card key={item.title} className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className="inline-flex p-2.5 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    <Link href={item.href} className="inline-flex items-center text-sm text-primary hover:underline gap-1">
                      {item.link}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Consumer App Examples */}
        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Built on the same API</h2>
              <p className="text-muted-foreground text-sm">
                Both Medialane consumer apps are built entirely on the SDK and REST API — the same surface available to you.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-mono text-muted-foreground">medialane.io</p>
                  <h3 className="text-lg font-bold text-white">Creator Launchpad</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Consumer-grade marketplace with invisible wallet (ChipiPay). Mint, list, remix,
                    and comment without managing a seed phrase. Runs on the Collections, Minting,
                    Orders, and Remix APIs.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Collections", "Orders", "Minting", "Remix"].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-mono text-muted-foreground">dapp.medialane.io</p>
                  <h3 className="text-lg font-bold text-white">Permissionless dApp</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Fully on-chain reads via starknet.js. No backend dependency for browsing —
                    ideal for Starknet wallet holders. Uses Activities, Trade Intents, and
                    Asset Metadata APIs for real-time state.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Activities", "Trade Intents", "Asset Metadata"].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
