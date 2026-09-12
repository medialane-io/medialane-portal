import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { tierRows, type MdlnTier } from "@/lib/mdln-tiers";
import { LaunchpadCtaBanner } from "@medialane/ui";

const title = "Pricing";
const description =
  "Pay-per-call pricing for every service on Medialane. Reads, mints, listings and licences billed the same for humans and AI agents.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/pricing"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane pricing" }),
};

const ACTION_LABELS: Record<string, string> = {
  read: "Read / query",
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
  "wallet:deploy": "Create a wallet for someone",
  "metadata:upload-json": "Upload metadata JSON to IPFS",
  "metadata:upload-file": "Upload a media file to IPFS",
};

interface PricingRule {
  actionKey: string;
  chain: string;
  service: string;
  credits: number;
}

interface PricingResponse {
  creditsPerUsdc: number;
  mdln?: { tiers: MdlnTier[] };
  pricing: { default: number; rules: PricingRule[] };
}

async function livePricing(): Promise<PricingResponse | null> {
  const base = process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL ?? "https://api.medialane.io";
  try {
    const res = await fetch(`${base}/v1/pricing`, { next: { revalidate: 300 } });
    return res.ok ? ((await res.json()) as PricingResponse) : null;
  } catch {
    return null;
  }
}

export default async function PricingPage() {
  const pricing = await livePricing();
  const creditsPerUsdc = pricing?.creditsPerUsdc ?? 100;
  const mdln = tierRows(pricing?.mdln?.tiers, creditsPerUsdc);

  const defaults = pricing?.pricing.rules.filter((r) => r.chain === "ALL" && r.service === "ALL") ?? [];
  const known = Object.keys(ACTION_LABELS);
  const ordered = [
    ...known.filter((k) => defaults.some((r) => r.actionKey === k)),
    ...defaults.map((r) => r.actionKey).filter((k) => !known.includes(k)),
  ];
  const rows = ordered.map((actionKey) => ({
    actionKey,
    label: ACTION_LABELS[actionKey] ?? actionKey,
    credits: defaults.find((r) => r.actionKey === actionKey)!.credits,
  }));

  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Pay for what you use
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          No subscription. Every call is paid over x402, the same pay-per-call rail enterprises and AI
          agents both use. Buy credits with USDC and spend them as you go; hold MDLN for a discount.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        {rows.length > 0 ? (
          <section className="max-w-4xl mx-auto space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground text-center">What things cost</h2>
            <div className="divide-y divide-border/40">
              {rows.map((row) => (
                <div key={row.actionKey} className="flex items-center justify-between px-2 py-3 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {row.credits} {row.credits === 1 ? "credit" : "credits"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">Hold MDLN, pay less</h2>
            <p className="text-sm text-muted-foreground">
              Your discount applies the moment you deposit. Nothing to lock up or stake.
            </p>
          </div>
          <div className="divide-y divide-border/40">
            <div className="grid grid-cols-3 px-2 py-4 text-sm font-semibold">
              <div className="text-muted-foreground">MDLN holdings</div>
              <div className="text-center text-foreground">Multiplier</div>
              <div className="text-center text-primary">Rate</div>
            </div>
            {mdln.map((tier) => (
              <div key={tier.range} className="grid grid-cols-3 px-2 py-4 items-center text-sm">
                <div className="text-muted-foreground">{tier.range}</div>
                <div className="text-center font-medium text-foreground">{tier.multiplier}</div>
                <div className="text-center font-medium text-primary">{tier.rate}</div>
              </div>
            ))}
          </div>
        </section>

        <LaunchpadCtaBanner
          eyebrow="Credits"
          title="Buy credits with USDC"
          description="One credit is one cent. Top up from your account and spend it across every service."
          href="/account"
          ctaLabel="Go to your account"
          tone="manage"
        />
      </div>
    </div>
  );
}
