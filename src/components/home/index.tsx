import Image from "next/image";
import Link from "next/link";
import { CardGrid, InfoCard, PageBody, PageHero, Section } from "@/components/site/page-shell";
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
    description: "A whole catalog registered at once, with license terms that travel with every item.",
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
    description: "Non-transferable certificates for a list of recipients, each added to their own wallet.",
    image: "/img/business.jpg",
  },
];

const BUILD = [
  { href: "/developers", title: "Developers", description: "One API for registration, licensing, creation and activity." },
  { href: "/agents", title: "AI agents", description: "Agents sign in with a keypair and use the same services as people." },
  { href: "/infrastructure", title: "Infrastructure", description: "Tokenization inside a product, with its own screens on top." },
  { href: "/pricing", title: "Pricing", description: "Clear prices for every action, shown live." },
];

export function HomePage() {
  return (
    <div className="pb-24">
      <PageHero
        eyebrow="Medialane Portal"
        title="Protect, tokenize and monetize intellectual property"
        description="Every work gets a record of who made it, when, and what anyone, including AI systems, may do with it. Catalogs, tickets and certificates are launched from the Launchpad, or built into a product with one API."
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
          description="Protect catalogs, issue tickets and certificates, and verify them onchain."
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
          description={`Every work carries a verifiable record of who made it and the terms that apply, kept in immutable metadata that anyone can check. Built for the Berne Convention, which covers ${BERNE_COUNTRIES} countries.`}
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

        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
            <Image src="/img/developers.jpg" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">Build on the API</h2>
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
