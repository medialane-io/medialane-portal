import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { getMedialaneClient } from "@/lib/medialane-client";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { tierRows, type MdlnTier } from "@/lib/mdln-tiers";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { groupPricing, type PricingRule } from "@/lib/pricing-groups";
import { CardGrid, InfoCard, PageBody, PageHero, Section } from "@/components/site/page-shell";

const title = "Pricing";
const description =
  "No subscription. Every action on Medialane has a price in credits, read live, and the same price applies to people and AI agents.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/pricing"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane pricing" }),
};

const SERVICE_COSTS = [
  { title: "Data Tokenization", description: "A collection if you create one, an upload for each file and each item's metadata, and a mint for each item." },
  { title: "IP Ticketing", description: "A collection if you create one, an upload for the artwork and the metadata, a ticket type, and a wallet for each guest who needs one." },
  { title: "Certificate Emission", description: "A collection if you create one, an upload for the artwork and the metadata, and a wallet for each recipient who needs one." },
];

interface PricingResponse {
  creditsPerUsdc: number;
  mdln?: { tiers: MdlnTier[] };
  pricing: { default: number; rules: PricingRule[] };
}

const livePricing = unstable_cache(
  async (): Promise<PricingResponse | null> => {
    try {
      return await getMedialaneClient().api.getPricing();
    } catch {
      return null;
    }
  },
  ["pricing"],
  { revalidate: 300 },
);


function PriceTable({ rows }: { rows: { actionKey: string; label: string; credits: number }[] }) {
  return (
    <div className="max-w-4xl mx-auto divide-y divide-border/40">
      {rows.map((row) => (
        <div key={row.actionKey} className="flex items-center justify-between px-2 py-3 text-sm">
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-medium text-foreground tabular-nums">
            {row.credits} {row.credits === 1 ? "credit" : "credits"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function PricingPage() {
  const pricing = await livePricing();
  const creditsPerUsdc = pricing?.creditsPerUsdc ?? 100;
  const mdln = tierRows(pricing?.mdln?.tiers, creditsPerUsdc);
  const { runs, api } = groupPricing(pricing?.pricing.rules);

  return (
    <div className="pb-20">
      <PageHero
        title="Pay for what you use"
        description="No subscription. Buy credits with USDC and spend them as you go. One credit is one cent, and holding MDLN lowers the rate."
      />

      <PageBody>
        {runs.length > 0 ? (
          <Section title="Launchpad runs" description="A run is the sum of the actions it performs, each priced below.">
            <PriceTable rows={runs} />
            <CardGrid columns={3}>
              {SERVICE_COSTS.map((item) => (
                <InfoCard key={item.title} title={item.title} description={item.description} />
              ))}
            </CardGrid>
          </Section>
        ) : null}

        {api.length > 0 ? (
          <Section title="API calls" description="Every call your key makes is paid from the same credits, at the same price for people and agents.">
            <PriceTable rows={api} />
          </Section>
        ) : null}

        {runs.length === 0 && api.length === 0 ? (
          <Section title="Prices are unavailable right now" description="The live price list could not be loaded. Please try again in a moment." />
        ) : null}

        <Section title="Hold MDLN, pay less" description="Your discount applies the moment you deposit. Nothing to lock up or stake.">
          <div className="max-w-4xl mx-auto divide-y divide-border/40">
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
        </Section>

        <LaunchpadCtaBanner
          eyebrow="Credits"
          title="Buy credits with USDC"
          description="One credit is one cent. Top up from your account and spend it across every service."
          href="/account"
          ctaLabel="Go to your account"
          tone="manage"
        />
      </PageBody>
    </div>
  );
}
