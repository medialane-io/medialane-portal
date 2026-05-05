import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  Code2, Key, ArrowRight, Sparkles, Bot, Check,
  GitFork, Coins, Ticket, ShoppingBag,
} from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const SAMPLE_RESPONSE = `{
  "data": [
    {
      "contractAddress": "0x04a...",
      "name": "Sonic Bloom",
      "floorPrice": "0.05",
      "volume24h": "1.2",
      "itemsCount": 512,
      "ownersCount": 314,
      "licenseType": "CC BY",
      "source": "collection_drop"
    }
  ],
  "meta": { "total": 48, "page": 1, "limit": 20 }
}`

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />
      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-24 pb-16 max-w-5xl text-center space-y-8">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            The monetization platform for creators, collectors, and AI agents
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
            Creator Capital Markets
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Medialane is where creative work becomes programmable capital. The portal gives developers
            API and SDK access to the full ecosystem — assets, orders, licensing, drops, credentials,
            and real-time events.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
              <Link href="/account">
                <Key className="w-5 h-5 mr-2" />
                Get API Access
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base border-white/10 hover:bg-white/5">
              <Link href="/docs">
                <Code2 className="w-5 h-5 mr-2" />
                Read the Docs
              </Link>
            </Button>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {[
              { icon: Coins, label: "Revenue Flows" },
              { icon: GitFork, label: "Programmable Licensing" },
              { icon: ShoppingBag, label: "Collection Drops" },
              { icon: Ticket, label: "POP Credentials" },
              { icon: Bot, label: "AI Agent Access" },
              { icon: Code2, label: "Webhooks" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-muted-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* Terminal code preview */}
          <div className="mx-auto max-w-2xl text-left mt-8">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">GET /v1/collections</span>
              </div>
              <pre className="p-4 text-xs font-mono text-green-300/90 overflow-x-auto leading-relaxed">
                {SAMPLE_RESPONSE}
              </pre>
            </div>
          </div>
        </section>

        {/* Integrate teaser */}
        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">MDLN Access</h3>
                  <span className="text-sm font-semibold text-muted-foreground">500 MDLN min</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Hold 500 MDLN in your wallet to get an API key. Tokens stay in your wallet — it&apos;s a balance check, not a fee.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["All API endpoints", "Up to 5 API keys", "Portal dashboard", "Webhooks included"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/account">Connect Wallet</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">MDLN Multipliers</h3>
                  <span className="text-sm font-semibold text-primary">up to 2×</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Top up credits with USDC. Hold more MDLN to get bonus credits automatically at deposit time.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["500 MDLN → 1.0× base", "1,000 MDLN → 1.2×", "2,000 MDLN → 1.5×", "5,000 MDLN → 2.0×"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  <Link href="/integrate">See integration details</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards row */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-primary/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Bot className="w-3 h-3 mr-2" />
                  AI Agent Quickstart
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Headless Auth for Agents
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Any agent with a Starknet keypair can authenticate, provision credits, and call the API —
                  zero human interaction required.
                </p>
                <Button asChild variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary hover:text-primary">
                  <Link href="/docs/agents">
                    Read the guide
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  <Code2 className="w-3 h-3 mr-2" />
                  Launchpad Services
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Deploy, Drop, and Credential
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  POP Protocol for event credentials, Collection Drop for fixed-supply
                  public minting, and Remix Licensing for derivative works — all accessible
                  via one SDK.
                </p>
                <Button asChild variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200">
                  <Link href="/docs/sdk">
                    Explore the SDK
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
