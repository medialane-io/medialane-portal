import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Code2, Key, BarChart2, ArrowRight, Sparkles, Bot, Check, GitFork, MessageSquare, Coins } from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const SAMPLE_RESPONSE = `{
  "data": {
    "tokenId": "42",
    "name": "Sonic Bloom #42",
    "description": "Generative audio-visual IP on Starknet.",
    "image": "ipfs://bafybe.../42.png",
    "ipType": "Audio",
    "licenseType": "CC BY",
    "attributes": [
      { "trait_type": "IP Type",      "value": "Audio" },
      { "trait_type": "License Type", "value": "CC BY" },
      { "trait_type": "BPM",          "value": "128" },
      { "trait_type": "Creator",      "value": "0x05f9..." }
    ],
    "remixCount": 3,
    "commentCount": 11
  }
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
            Permissionless IP Infrastructure on Starknet
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
            Build on Starknet IP
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Mint, query and monetize IP assets on Starknet. Connect your wallet and integrate in minutes —
            fully permissionless for humans and AI agents alike.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
              <Link href="/sign-in">
                <Key className="w-5 h-5 mr-2" />
                Connect Wallet &amp; Build
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
              { icon: Code2, label: "IP Metadata" },
              { icon: BarChart2, label: "Collections & Stats" },
              { icon: GitFork, label: "Remix Licensing" },
              { icon: MessageSquare, label: "On-chain Comments" },
              { icon: Bot, label: "Agent-Native Access" },
              { icon: Coins, label: "MDLN Token Benefits" },
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
                <span className="ml-2 text-xs text-muted-foreground font-mono">GET /v1/tokens/:contract/:tokenId</span>
              </div>
              <pre className="p-4 text-xs font-mono text-green-300/90 overflow-x-auto leading-relaxed">
                {SAMPLE_RESPONSE}
              </pre>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">FREE</h3>
                  <span className="text-2xl font-extrabold text-white">$0</span>
                </div>
                <p className="text-sm text-muted-foreground">50 credits / month. Connect wallet, start building.</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["All API endpoints", "Up to 5 API keys", "Portal dashboard", "Webhooks included"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/sign-in">Connect Wallet</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Pay with USDC</h3>
                  <span className="text-2xl font-extrabold text-white">$0.01<span className="text-sm font-normal text-muted-foreground">/req</span></span>
                </div>
                <p className="text-sm text-muted-foreground">Deposit USDC on-chain. Hold MDLN for up to 2x credit bonus.</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Everything in FREE", "Credits never expire", "500 MDLN → 1.2x bonus", "5,000 MDLN → 2.0x bonus"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  <Link href="/pricing">See credit model</Link>
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
                  <Sparkles className="w-3 h-3 mr-2" />
                  Free Workshop
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Web 2 → Web 3 in 1 Hour
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Full video guide: from zero to a deployed Starknet dApp using
                  Medialane API. In Portuguese.
                </p>
                <Button asChild variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200">
                  <Link href="/workshop">
                    Watch Workshop
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
