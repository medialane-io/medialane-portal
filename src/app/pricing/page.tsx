import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Check, X, Info } from "lucide-react"
import { BackgroundGradients } from "@/src/components/background-gradients"

const FEATURES = [
  {
    label: "Monthly requests",
    free: "50",
    premium: "Unlimited",
    tooltip: "Portal management calls (/v1/portal/*) never count toward quota",
  },
  { label: "Rate limit", free: "—", premium: "3,000 req/min", tooltip: null },
  { label: "API keys", free: "Up to 5", premium: "Up to 5", tooltip: null },
  { label: "Webhooks", free: false, premium: true, tooltip: "ORDER_CREATED, ORDER_FULFILLED, ORDER_CANCELLED, TRANSFER" },
  { label: "Quota reset", free: "1st of each month", premium: "—", tooltip: null },
  { label: "All API endpoints", free: true, premium: true, tooltip: null },
  { label: "Portal dashboard", free: true, premium: true, tooltip: null },
  { label: "Priority support", free: false, premium: true, tooltip: null },
]

function Cell({ value }: { value: boolean | string | null }) {
  if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
  if (value === null || value === "—") return <span className="text-muted-foreground text-sm">—</span>
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
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free. Scale to PREMIUM when you need unlimited throughput and webhooks.
          </p>
        </section>

        {/* Plan cards */}
        <section className="container mx-auto px-4 pb-12 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* FREE */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="p-8 pb-0 space-y-3">
                <h2 className="text-2xl font-bold text-white">FREE</h2>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-white">$0</span>
                  <span className="text-muted-foreground mb-1.5">/ month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  50 requests per month. Resets on the 1st of each month. No credit card required.
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <Button asChild className="w-full" size="lg">
                  <Link href="/account">Get API Key</Link>
                </Button>
              </CardContent>
            </Card>

            {/* PREMIUM */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background/50 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">PREMIUM</Badge>
              </div>
              <CardHeader className="p-8 pb-0 space-y-3">
                <h2 className="text-2xl font-bold text-white">PREMIUM</h2>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Unlimited requests. 3,000 req/min rate limit. Webhooks included.
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10" size="lg">
                  <a href="mailto:api@medialane.io">Request Access</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="container mx-auto px-4 pb-24 max-w-4xl">
          <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/[0.03]">
              <div className="text-sm font-semibold text-muted-foreground">Feature</div>
              <div className="text-sm font-semibold text-white text-center">FREE</div>
              <div className="text-sm font-semibold text-primary text-center">PREMIUM</div>
            </div>
            {FEATURES.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 px-6 py-4 items-center ${i < FEATURES.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {row.label}
                  {row.tooltip && (
                    <span title={row.tooltip}>
                      <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <Cell value={row.free} />
                </div>
                <div className="text-center">
                  <Cell value={row.premium} />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            * Portal management calls (<code className="font-mono">/v1/portal/*</code>) never count toward the monthly quota on any plan.
          </p>
        </section>
      </div>
    </div>
  )
}
