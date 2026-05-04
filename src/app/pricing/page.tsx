import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Check, Zap } from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const FEATURES = [
  { label: "Monthly free credits", free: "50 credits", paid: "Pay-as-you-go" },
  { label: "Credit rate", free: "$0 (free tier)", paid: "$0.01 / credit" },
  { label: "API keys", free: "Up to 5", paid: "Up to 5" },
  { label: "Webhooks", free: true, paid: true },
  { label: "All API endpoints", free: true, paid: true },
  { label: "Portal dashboard", free: true, paid: true },
  { label: "MDLN token multipliers", free: true, paid: true },
  { label: "Agent-native 402 responses", free: true, paid: true },
  { label: "Free quota reset", free: "1st of each month", paid: "—" },
]

const MDLN_TIERS = [
  { label: "No MDLN", range: "0 MDLN", multiplier: "1.0×", rate: "$0.010 / credit" },
  { label: "Tier 1", range: "500+ MDLN", multiplier: "1.2×", rate: "$0.0083 / credit" },
  { label: "Tier 2", range: "2,000+ MDLN", multiplier: "1.5×", rate: "$0.0067 / credit" },
  { label: "Tier 3", range: "5,000+ MDLN", multiplier: "2.0×", rate: "$0.005 / credit" },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />
  if (value === "—") return <span className="text-muted-foreground text-sm">—</span>
  return <span className="text-sm text-white font-medium">{value}</span>
}

export default function PricingPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundGradients />

      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Pay only for what you use
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start with 50 free credits every month. Buy more with USDC on Starknet.
            Hold MDLN tokens to get up to 2× more credits per dollar.
          </p>
        </section>

        {/* Plan cards */}
        <section className="container mx-auto px-4 pb-12 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* FREE */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="p-8 pb-0 space-y-3">
                <h2 className="text-2xl font-bold text-white">Free Tier</h2>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-white">$0</span>
                  <span className="text-muted-foreground mb-1.5">/ month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  50 credits every month, reset on the 1st. No payment required — connect your wallet and go.
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> 50 requests / month</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> All API endpoints</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> Webhooks included</li>
                </ul>
                <Button asChild className="w-full" size="lg">
                  <Link href="/sign-in">Connect Wallet</Link>
                </Button>
              </CardContent>
            </Card>

            {/* PAY-AS-YOU-GO */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  <Zap className="w-3 h-3 mr-1 inline" />
                  Scale
                </Badge>
              </div>
              <CardHeader className="p-8 pb-0 space-y-3">
                <h2 className="text-2xl font-bold text-white">Pay-as-you-go</h2>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-white">$0.01</span>
                  <span className="text-muted-foreground mb-1.5">/ credit</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Deposit USDC on Starknet — credits land in your account within ~2 minutes.
                  MDLN holders get bonus credits automatically.
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> No subscription, no lock-in</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> MDLN multipliers up to 2×</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> Agent-native 402 billing</li>
                </ul>
                <Button asChild className="w-full border-primary/30 hover:bg-primary/10" variant="outline" size="lg">
                  <Link href="/sign-in">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* MDLN tier benefits */}
        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">MDLN Token Multipliers</h2>
              <p className="text-sm text-muted-foreground">
                Hold MDLN at deposit time to receive bonus credits — no lock-up required.
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
                  key={tier.label}
                  className={`grid grid-cols-3 px-6 py-4 items-center text-sm ${i < MDLN_TIERS.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <div className="text-muted-foreground">{tier.range}</div>
                  <div className="text-center text-white font-medium">{tier.multiplier}</div>
                  <div className="text-center text-primary font-medium">{tier.rate}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              MDLN balance is read on-chain at deposit time. Learn more at{" "}
              <a href="https://medialane.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                medialane.org
              </a>
            </p>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">Everything included</h2>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03]">
                <div className="text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="text-sm font-semibold text-white text-center">Free Tier</div>
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
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Portal management calls (<code className="font-mono">/v1/portal/*</code>) never count toward the monthly quota.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
