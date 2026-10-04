import Link from "next/link";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { CardGrid, InfoCard, PageBody, PageHero, Section, StepList } from "@/components/site/page-shell";
import { BERNE_COUNTRIES, CONSUMER_APP_URL } from "@/lib/site";

const AI_POLICY_POINTS = [
  { title: "Who made it, and when", description: "Authorship and date are recorded permanently with every asset." },
  { title: "What anyone may do with it", description: "License type, commercial use, derivatives, attribution, territory and royalty travel with the asset." },
  { title: "What AI may do with it", description: "Every asset carries an AI policy: Allowed, Training Only or Not Allowed." },
];

const SERVICES = [
  {
    href: "/services/data-tokenization",
    eyebrow: "Protect and license",
    title: "Data Tokenization",
    description: "Register a whole catalog, up to 500 items in one run, with license terms that travel with every item.",
  },
  {
    href: "/services/tickets",
    eyebrow: "Admit and verify",
    title: "IP Ticketing",
    description: "Issue tickets with their own supply and validity window, and send them to a guest list.",
  },
  {
    href: "/services/certificates",
    eyebrow: "Credential and certify",
    title: "Certificate Emission",
    description: "Issue non-transferable certificates to a list of recipients, who each get a wallet if they have none.",
  },
];

const STEPS = [
  { title: "Choose a service", description: "Pick Data Tokenization, IP Ticketing or Certificate Emission and add your files or your recipient list." },
  { title: "Set the terms", description: "Choose the license, commercial use, territory and AI policy that apply to what you issue." },
  { title: "Pay once", description: "Pay with credits, or with USDC from your wallet. Save the run and come back to it any time." },
  { title: "Approve each batch", description: "Everything is issued to your own wallet, and you approve every batch with your passkey." },
];

const BUILD = [
  { href: "/developers", title: "Developers", description: "One metered API for registration, licensing, minting and activity. Hold a key, pay per call." },
  { href: "/agents", title: "AI agents", description: "Agents authenticate with a keypair and pay per call on the same terms as people." },
  { href: "/infrastructure", title: "Infrastructure", description: "Run tokenization inside your own product, with your own screens on top." },
  { href: "/pricing", title: "Pricing", description: "No subscription. Every action has a price in credits, read live." },
];

export function HomePage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="IP protection, licensing and monetization"
        title="Proof of authorship and license terms for the work you own"
        description="Medialane records who made a work, when, and what anyone, including AI systems, may do with it. Issue tickets and certificates to a list of people, or build it into your own product with one API."
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/launchpad"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the Launchpad
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/60"
          >
            Get an API key
          </Link>
        </div>
      </PageHero>

      <PageBody>
        <Section
          id="ai"
          title="A record that travels with the work"
          description={`AI systems are trained on creative work at scale, usually with no record of who made it or on what terms. A Medialane record is kept in immutable metadata anyone can verify, built for the Berne Convention, which covers ${BERNE_COUNTRIES} countries.`}
        >
          <CardGrid columns={3}>
            {AI_POLICY_POINTS.map((point) => (
              <InfoCard key={point.title} title={point.title} description={point.description} />
            ))}
          </CardGrid>
          <div className="text-center">
            <Link href="/services/ai-data" className="text-sm font-medium text-primary hover:underline">
              How AI data licensing works
            </Link>
          </div>
        </Section>

        <Section id="launchpad" title="What you can issue today" description="Three Launchpad services, each run on your credits and signed from your own wallet.">
          <CardGrid columns={3}>
            {SERVICES.map((service) => (
              <InfoCard key={service.title} {...service} />
            ))}
          </CardGrid>
        </Section>

        <Section title="How a run works" description="Every Launchpad service follows the same four steps.">
          <StepList steps={STEPS} />
        </Section>

        <Section
          title="You stay in control"
          description="Medialane is not an intermediary. Assets are minted to your wallet, payments settle directly through the smart contracts with no escrow, and Medialane never holds your keys or your funds."
        >
          <div className="text-center">
            <Link href="/platform" className="text-sm font-medium text-primary hover:underline">
              How Medialane works
            </Link>
          </div>
        </Section>

        <Section title="Build with Medialane">
          <CardGrid columns={4}>
            {BUILD.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Creating or collecting?" description="The consumer app is for creators and collectors who want to publish, collect and trade without a business account.">
          <div className="text-center">
            <a href={CONSUMER_APP_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
              Open medialane.io
            </a>
          </div>
        </Section>

        <LaunchpadCtaBanner
          eyebrow="Talk to us"
          title="Protecting a catalog or building a product on top of it?"
          description="Tell us what you are working on and we will help you choose the right service."
          href="/contact"
          ctaLabel="Contact us"
          tone="manage"
        />
      </PageBody>
    </div>
  );
}
