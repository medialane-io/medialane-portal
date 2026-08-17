import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Check, Coins } from "lucide-react"

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
  return <span className="text-sm text-foreground font-medium">{value}</span>
}

export default async function PricingPage() {
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
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            <Coins className="w-3.5 h-3.5 mr-1.5 inline" />
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Pay for what you use
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No subscription. Buy credits with USDC and spend them as you go. Hold MDLN for a discount.
          </p>
          <Button asChild size="lg" className="px-10">
            <Link href="/account">Get started</Link>
          </Button>
        </section>

        {creditRows.length > 0 && (
          <section className="container mx-auto px-4 pb-16 max-w-4xl">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground text-center">What things cost</h2>
              <div className="rounded-xl border border-border overflow-hidden bg-foreground/[0.02]">
                {creditRows.map((row, i) => (
                  <div
                    key={row.actionKey}
                    className={`flex items-center justify-between px-6 py-3 text-sm ${i < creditRows.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="text-foreground font-medium">{row.credits} credits</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Hold MDLN, pay less</h2>
              <p className="text-sm text-muted-foreground">
                Your discount applies the moment you deposit. Nothing to lock up or stake.
              </p>
            </div>
            <div className="rounded-xl border border-border overflow-hidden bg-foreground/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-border bg-foreground/[0.03] text-sm font-semibold">
                <div className="text-muted-foreground">MDLN Holdings</div>
                <div className="text-center text-foreground">Multiplier</div>
                <div className="text-center text-primary">Rate</div>
              </div>
              {MDLN_TIERS.map((tier, i) => (
                <div
                  key={tier.range}
                  className={`grid grid-cols-3 px-6 py-4 items-center text-sm ${i < MDLN_TIERS.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <div className="text-muted-foreground">{tier.range}</div>
                  <div className="text-center text-foreground font-medium">{tier.multiplier}</div>
                  <div className="text-center text-primary font-medium">{tier.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground text-center">What&apos;s included</h2>
            <div className="rounded-xl border border-border overflow-hidden bg-foreground/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-border bg-foreground/[0.03]">
                <div className="text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="text-sm font-semibold text-foreground text-center">x402 Payments</div>
                <div className="text-sm font-semibold text-primary text-center">Pay-as-you-go</div>
              </div>
              {FEATURES.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 px-6 py-4 items-center ${i < FEATURES.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <div className="text-sm text-muted-foreground">{row.label}</div>
                  <div className="text-center"><Cell value={row.free} /></div>
                  <div className="text-center"><Cell value={row.paid} /></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <p className="text-muted-foreground">
            Running a bigger deployment? Credentials, tickets, and content licensing are priced separately.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/enterprise">See enterprise pricing</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
