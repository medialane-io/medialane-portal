import type { Metadata } from "next";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero, Section } from "@/components/site/page-shell";
import { CONSUMER_APP_URL } from "@/lib/site";

const title = "Services";
const description =
  "Protect a catalog, issue tickets and certificates, and license work for AI use. Three Launchpad services you can run today, and the wider protocol behind them.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/services"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Services" }),
};

const LAUNCHPAD = [
  { href: "/services/data-tokenization", eyebrow: "Launchpad", title: "Data Tokenization", description: "Register up to 500 items in one run, with authorship, date and license terms recorded for each." },
  { href: "/services/tickets", eyebrow: "Launchpad", title: "IP Ticketing", description: "Tickets with their own supply and validity window, sent to a guest list and checkable against the chain." },
  { href: "/services/certificates", eyebrow: "Launchpad", title: "Certificate Emission", description: "Non-transferable certificates sent to a list of recipients, who keep them in their own wallet." },
];

const SOLUTIONS = [
  { href: "/services/ip", title: "IP protection", description: "A permanent, verifiable record of authorship and date for creative work, built for the Berne Convention." },
  { href: "/services/ai-data", title: "AI data licensing", description: "Set what AI systems may do with your catalog, and be paid when they use it." },
  { href: "/services/tokenize", title: "Credentials for organizations", description: "Passes, certificates and tickets for members, students and attendees." },
];

const PROTOCOL = [
  { href: "/services/nfteditions", title: "Limited editions and drops", description: "Numbered editions of a work and timed collection drops with a price, a supply and a window." },
  { href: "/services/club", title: "Clubs", description: "Tiered membership cards, issued as a collection." },
  { href: "/services/sponsorship", title: "Sponsorship", description: "A sponsor bids on an asset and receives a license, settled directly between the two parties." },
];

const USE_CASES = [
  { eyebrow: "Publishers and media networks", title: "Register an archive, set its AI policy", description: "Tokenize a back catalog once, with the terms for AI use set per item, and a record of authorship anyone can check." },
  { eyebrow: "Studios and agencies", title: "Timestamp work before it is shared", description: "Record concepts, edits and final deliverables with an author and a date before they leave your hands." },
  { eyebrow: "Event organizers", title: "Sell tickets that can be checked", description: "Issue tickets with a supply and a validity window, and verify them against the chain at the door." },
  { eyebrow: "Schools and training providers", title: "Issue certificates people keep", description: "Send a certificate to every graduate. It is non-transferable, and nothing is stored on your side." },
  { eyebrow: "Data owners and sample libraries", title: "License a catalog with terms attached", description: "Publish items with license terms and an AI policy that stay with each item wherever it goes." },
];

export default function ServicesPage() {
  return (
    <div className="pb-20">
      <PageHero
        title="Services for protecting, licensing and issuing"
        description="Run a service from the Launchpad with your credits, or reach the same capabilities through the API."
      />
      <PageBody>
        <Section title="Run from the Launchpad" description="Live today. Save a run, pay once and pick it up any time.">
          <CardGrid columns={3}>
            {LAUNCHPAD.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Solutions">
          <CardGrid columns={3}>
            {SOLUTIONS.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section
          title="Also on the protocol"
          description="Available through the API and on the consumer app, medialane.io."
        >
          <CardGrid columns={3}>
            {PROTOCOL.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
          <div className="text-center">
            <a href={CONSUMER_APP_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
              Open medialane.io
            </a>
          </div>
        </Section>

        <Section title="How teams use it">
          <CardGrid columns={3}>
            {USE_CASES.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <LaunchpadCtaBanner
          eyebrow="Developers"
          title="Build it into your own product"
          description="The same services are available through one metered API."
          href="/developers"
          ctaLabel="See the API"
          tone="manage"
        />
      </PageBody>
    </div>
  );
}
