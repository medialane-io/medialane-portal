import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Code2, Key, BarChart2, Play, ArrowRight, Sparkles, Bot, Check, GitFork, MessageSquare } from "lucide-react"
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
            Mint, query IP assets, collections, on-chain activities and listings. Integrate in minutes —
            free for humans, sovereign for AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
              <Link href="/connect">
                <Key className="w-5 h-5 mr-2" />
                Get Free API Key
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
              { icon: Code2, label: "Orders & Listings" },
              { icon: BarChart2, label: "Collections & Stats" },
              { icon: Key, label: "IP Metadata" },
              { icon: GitFork, label: "Remix Licensing" },
              { icon: MessageSquare, label: "On-chain Comments" },
              { icon: Bot, label: "AI Agent Ready" },
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

        {/* Mini pricing teaser */}
        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* FREE */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">FREE</h3>
                  <span className="text-2xl font-extrabold text-white">$0</span>
                </div>
                <p className="text-sm text-muted-foreground">50 requests / month. Resets on the 1st.</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["All API endpoints", "Up to 5 API keys", "Portal dashboard"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/connect">Get API Key</Link>
                </Button>
              </CardContent>
            </Card>

            {/* PREMIUM */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">PREMIUM</h3>
                  <span className="text-2xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-sm text-muted-foreground">Unlimited requests. 3,000 req/min rate limit.</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Everything in FREE", "Webhooks (4 event types)", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  <Link href="/pricing">See all plans →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>


        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">


            {/* Workshop */}
            <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-background/50 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/40 transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  <Play className="w-3 h-3 mr-2" />
                  Free Workshop
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Web 2 → Web 3 in 1 Hour
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Full video guide: from zero to a deployed Starknet dApp using
                  Clerk, ChipiPay, and Medialane. In Portuguese.
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
