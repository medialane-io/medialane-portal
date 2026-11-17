import Image from "next/image";
import Link from "next/link";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { CardGrid, Eyebrow, InfoCard, PageBody, PageHero, Panel, Section, StepList } from "@/components/site/page-shell";
import { BERNE_COUNTRIES, CONSUMER_APP_URL } from "@/lib/site";

const RECORD_POINTS = [
  { title: "Authorship and date", description: "Who made the work, and when, recorded permanently with every asset." },
  { title: "License terms", description: "License type, commercial use, derivatives, attribution, territory and royalties travel with the asset." },
  { title: "AI policy", description: "Every asset declares what AI may do with it: Allowed, Training Only or Not Allowed." },
];

const SERVICES = [
  {
    href: "/services/data-tokenization",
    eyebrow: "Protect and license",
    title: "Data Tokenization",
    description: "A whole catalog registered in one run, with license terms that travel with every item.",
    image: "/img/registration.jpg",
  },
  {
    href: "/services/tickets",
    eyebrow: "Admit and verify",
    title: "IP Ticketing",
    description: "Tickets with their own supply and validity window, sent to a guest list.",
    image: "/img/tickets.jpg",
  },
  {
    href: "/services/certificates",
    eyebrow: "Credential and certify",
    title: "Certificate Emission",
    description: "Non-transferable certificates for a list of recipients, each receiving a wallet if they have none.",
    image: "/img/business.jpg",
  },
];

const STEPS = [
  { title: "Choose a service", description: "Data Tokenization, IP Ticketing or Certificate Emission, with the files or recipient list to issue." },
  { title: "Set the terms", description: "License, commercial use, territory and AI policy for what is issued." },
  { title: "Pay once", description: "Credits, or USDC from the wallet. A saved run can be reopened at any time." },
  { title: "Approve each batch", description: "Everything is issued to the owner's wallet, and each batch is approved with a passkey." },
];

const BUILD = [
  { href: "/developers", title: "Developers", description: "One metered API for registration, licensing, minting and activity. A key, paid per call." },
  { href: "/agents", title: "AI agents", description: "Agents authenticate with a keypair and pay per call on the same terms as people." },
  { href: "/infrastructure", title: "Infrastructure", description: "Tokenization inside a product, with its own screens on top." },
  { href: "/pricing", title: "Pricing", description: "No subscription. Every action has a price in credits, read live." },
];

export function HomePage() {
  return (
    <div className="pb-24">
      <PageHero
        eyebrow="Medialane Portal"
        title="Protect, tokenize and monetize intellectual property"
        description="Medialane records who made a work, when, and what anyone, including AI systems, may do with it. Catalogs, tickets and certificates are launched from the Launchpad, or built into a product with one API."
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/launchpad"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the Launchpad
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Get an API key
          </Link>
        </div>
      </PageHero>

      <PageBody>
        <Section
          id="launchpad"
          title="Launch from the Launchpad"
          description="Three services, each paid with credits and approved from the owner's own wallet."
        >
          <CardGrid columns={3}>
            {SERVICES.map((service) => (
              <InfoCard key={service.title} {...service} />
            ))}
          </CardGrid>
        </Section>

        <Section
          id="ai"
          title="A record that travels with the work"
          description={`AI systems are trained on creative work at scale, usually with no record of authorship or terms. A Medialane record lives in immutable metadata that anyone can verify, built for the Berne Convention, which covers ${BERNE_COUNTRIES} countries.`}
        >
          <div className="grid gap-10 sm:grid-cols-3">
            {RECORD_POINTS.map((point) => (
              <div key={point.title} className="space-y-2 border-l-2 border-primary/60 pl-5">
                <h3 className="font-display text-lg font-semibold text-foreground">{point.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{point.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/services/ai-data" className="text-sm font-medium text-primary hover:underline">
              How AI data licensing works
            </Link>
          </div>
        </Section>

        <Section title="How a run works" description="Every Launchpad service follows the same four steps.">
          <StepList steps={STEPS} />
        </Section>

        <Panel>
          <Eyebrow>Ownership</Eyebrow>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Assets stay with their owner</h2>
          <p className="text-base text-[#a3a8ba] sm:text-lg">
            Assets are minted to the owner&apos;s wallet and payments settle directly through the smart contracts, with no escrow. Medialane never holds keys or funds.
          </p>
          <Link href="/platform" className="inline-block text-sm font-medium text-[hsl(240_100%_80%)] hover:underline">
            How Medialane works
          </Link>
        </Panel>

        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
            <Image src="/img/developers.jpg" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">Build with Medialane</h2>
              <p className="text-base text-muted-foreground sm:text-lg">The same services are available to developers, AI agents and organizations through one API.</p>
            </div>
            <ul className="divide-y divide-border/60">
              {BUILD.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="group flex items-start justify-between gap-6 py-5">
                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground sm:text-base">{item.description}</p>
                    </div>
                    <span aria-hidden className="pt-1 text-primary transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="space-y-6">
          <LaunchpadCtaBanner
            eyebrow="Talk to us"
            title="Protecting a catalog or building a product on top of it?"
            description="Tell us what is being built and we will help choose the right service."
            href="/contact"
            ctaLabel="Contact us"
            tone="manage"
          />
          <p className="text-center text-sm text-muted-foreground">
            Creating or collecting?{" "}
            <a href={CONSUMER_APP_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              Open medialane.io
            </a>
          </p>
        </div>
      </PageBody>
    </div>
  );
}
