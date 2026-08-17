import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  ListOrdered, LayoutGrid, FileImage, Activity, Signature,
  Code2, Check, Zap,
} from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const API_BASE = "https://api.medialane.io"

const ACTION_LABELS: Record<string, string> = {
  "read": "Read / query",
  "intent:mint": "Mint an asset",
  "intent:create-collection": "Deploy a collection",
  "intent:create-tier": "Create a ticket type / membership tier",
  "intent:create-coin": "Deploy a Creator Coin",
  "intent:launch-coin": "Launch a Creator Coin on Ekubo",
  "intent:listing": "List an asset for sale",
  "intent:offer": "Make an offer",
  "intent:cancel": "Cancel an order",
  "intent:fulfill": "Buy / fulfill an order",
  "intent:counter-offer": "Counter an offer",
  "intent:checkout": "Checkout",
  "metadata:upload-json": "Upload metadata JSON to IPFS",
  "metadata:upload-file": "Upload a media file to IPFS",
}

interface PricingRule { actionKey: string; chain: string; service: string; credits: number }
interface PricingResponse { creditsPerUsdc: number; pricing: { default: number; rules: PricingRule[] } }

async function getLivePricing(): Promise<PricingResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/pricing`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return (await res.json()) as PricingResponse
  } catch {
    return null
  }
}

const API_CARDS = [
  { icon: ListOrdered, title: "Marketplace Orders", description: "Query active listings, bids, and completed sales. Filter by contract, token, or wallet.", color: "text-brand-purple", bg: "bg-brand-purple/10", border: "border-brand-purple/20" },
  { icon: LayoutGrid, title: "Collections & Drops", description: "Fetch collection metadata, floor prices, volume, and token inventories. Includes POP and Collection Drop sources.", color: "text-brand-blue", bg: "bg-brand-blue/10", border: "border-brand-blue/20" },
  { icon: Zap, title: "Launch & Mint", description: "Deploy collection contracts and mint assets programmatically. Get ready-to-sign calldata for on-chain deployment.", color: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/20" },
  { icon: FileImage, title: "Decentralized Metadata", description: "Resolve full metadata for any token, including license terms, remix history, and provenance.", color: "text-brand-rose", bg: "bg-brand-rose/10", border: "border-brand-rose/20" },
  { icon: Activity, title: "Onchain Activity", description: "Stream every event, from mints and transfers to sales, offers, and cancellations, indexed in real time.", color: "text-brand-maeve", bg: "bg-brand-maeve/10", border: "border-brand-maeve/20" },
  { icon: Signature, title: "Trade Intents", description: "Create and sign structured trade intents using SNIP-12. Submit orders without exposing private keys.", color: "text-brand-purple", bg: "bg-brand-purple/10", border: "border-brand-purple/20" },
]

const MDLN_TIERS = [
  { range: "0 MDLN", multiplier: "1.0×", rate: "$0.010 / credit" },
  { range: "100,000+ MDLN", multiplier: "1.2×", rate: "$0.0083 / credit" },
  { range: "200,000+ MDLN", multiplier: "1.5×", rate: "$0.0067 / credit" },
  { range: "500,000+ MDLN", multiplier: "2.0×", rate: "$0.005 / credit" },
]

const FEATURES = [
  { label: "Webhooks", free: true, paid: true },
  { label: "All API endpoints", free: true, paid: true },
  { label: "Portal dashboard", free: true, paid: true },
  { label: "MDLN token multipliers", free: true, paid: true },
  { label: "Agent-native 402 responses", free: true, paid: true },
  { label: "Free quota reset", free: "1st of each month", paid: "n/a" },
  { label: "x402 Payments", free: false, paid: "Pay-as-you-go" },
  { label: "Credit rate", free: false, paid: "$0.01 / credit" },
  { label: "API keys", free: false, paid: true },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />
  if (value === "n/a") return <span className="text-muted-foreground text-sm">n/a</span>
  return <span className="text-sm text-white font-medium">{value}</span>
}

export default async function DevelopersPage() {
  const pricing = await getLivePricing()
  const defaultRules = pricing?.pricing.rules.filter((r) => r.chain === "ALL" && r.service === "ALL") ?? []
  const knownKeys = Object.keys(ACTION_LABELS)
  const orderedActionKeys = [
    ...knownKeys.filter((k) => defaultRules.some((r) => r.actionKey === k)),
    ...defaultRules.map((r) => r.actionKey).filter((k) => !knownKeys.includes(k)),
  ]
  const creditRows = orderedActionKeys.map((actionKey) => {
    const rule = defaultRules.find((r) => r.actionKey === actionKey)!
    return { actionKey, label: ACTION_LABELS[actionKey] ?? actionKey, credits: rule.credits }
  })

  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Code2 className="w-3.5 h-3.5 mr-1.5 inline" />
            Developers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Typed access to the full protocol
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Assets, orders, licensing, drops, and real-time events, priced by usage from your first call.
            Connect a wallet to get an API key.
          </p>
          <Button asChild size="lg" className="px-10">
            <Link href="/account">Connect Wallet &amp; Get Access</Link>
          </Button>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {API_CARDS.map(({ icon: Icon, title, description, color, bg, border }) => (
              <Card key={title} className={`${border} ${bg} backdrop-blur-sm`}>
                <CardContent className="p-6 space-y-3">
                  <Icon className={`w-6 h-6 ${color}`} />
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {creditRows.length > 0 && (
          <section className="container mx-auto px-4 pb-16 max-w-4xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white text-center">Live pricing</h2>
              <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                {creditRows.map((row, i) => (
                  <div
                    key={row.actionKey}
                    className={`flex items-center justify-between px-6 py-3 text-sm ${i < creditRows.length - 1 ? "border-b border-white/5" : ""}`}
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="text-white font-medium">{row.credits} credits</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">MDLN Token Multipliers</h2>
              <p className="text-sm text-muted-foreground">
                Hold MDLN at deposit time to receive bonus credits, unlocked immediately.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03] text-sm font-semibold">
                <div className="text-muted-foreground">MDLN Holdings</div>
                <div className="text-center text-white">Multiplier</div>
                <div className="text-center text-primary">Effective Rate</div>
              </div>
              {MDLN_TIERS.map((tier, i) => (
                <div
                  key={tier.range}
                  className={`grid grid-cols-3 px-6 py-4 items-center text-sm ${i < MDLN_TIERS.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="text-muted-foreground">{tier.range}</div>
                  <div className="text-center text-white font-medium">{tier.multiplier}</div>
                  <div className="text-center text-primary font-medium">{tier.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">Everything included</h2>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03]">
                <div className="text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="text-sm font-semibold text-white text-center">x402 Payments</div>
                <div className="text-sm font-semibold text-primary text-center">Pay-as-you-go</div>
              </div>
              {FEATURES.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 px-6 py-4 items-center ${i < FEATURES.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="text-sm text-muted-foreground">{row.label}</div>
                  <div className="text-center"><Cell value={row.free} /></div>
                  <div className="text-center"><Cell value={row.paid} /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
