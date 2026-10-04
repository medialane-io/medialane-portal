import type { Metadata } from "next";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero, Section } from "@/components/site/page-shell";

const title = "How Medialane works";
const description =
  "Immutable records, permissionless contracts and one shared catalog behind every Medialane product and partner app.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/platform"),
  ...buildSocialMetadata({ title, description, imageAlt: "How Medialane works" }),
};

const PRINCIPLES = [
  {
    eyebrow: "The record",
    title: "Kept where it cannot be rewritten",
    description:
      "Authorship, date and license terms are stored in content-addressed, immutable metadata. The history of every asset, sale and license can be replayed from onchain events.",
  },
  {
    eyebrow: "The contracts",
    title: "Set once, in public",
    description:
      "Contracts are immutable and permissionless. Once deployed they stay as they were set, including for Medialane itself.",
  },
  {
    eyebrow: "The terms",
    title: "License and AI policy, with the asset",
    description:
      "Every asset carries its license type, commercial use, derivatives, attribution, territory and royalty, and an AI policy of Allowed, Training Only or Not Allowed.",
  },
  {
    eyebrow: "The catalog",
    title: "One record, many apps",
    description:
      "Medialane's apps and partner apps read and write the same catalog through the SDK. Different views of one record, none of which can change what it says.",
  },
];

const HUBS = [
  {
    title: "Launchpad",
    description:
      "Create and release something new: a catalog of registered work, a set of tickets, a batch of certificates, or any other protocol service.",
  },
  {
    title: "Marketplace",
    description:
      "Buy, sell and license what has been issued. A sale pays out the moment it completes, directly between buyer and seller, with no escrow holding funds in between.",
  },
];

export default function PlatformPage() {
  return (
    <div className="pb-20">
      <PageHero
        title="How Medialane works"
        description="Tokenization turns something you own into a digital record you can license, trade and verify on Starknet, secured by zero-knowledge validity proofs. It is the idea behind tokenizing real estate or bonds, applied to intellectual property."
      />
      <PageBody>
        <Section title="Four ideas" description="What every Medialane product and partner app is built on.">
          <CardGrid columns={4}>
            {PRINCIPLES.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Two hubs" description="Everything Medialane does is issuing an asset or trading one.">
          <CardGrid columns={2}>
            {HUBS.map((hub) => (
              <InfoCard key={hub.title} title={hub.title} description={hub.description} />
            ))}
          </CardGrid>
        </Section>

        <Section
          title="You are in control"
          description="Medialane is not an intermediary. It sponsors transactions and runs the services, but it never holds your keys or your funds, and contracts settle payments directly."
        >
          <CardGrid columns={2}>
            <InfoCard title="Your wallet" description="Assets are minted to a wallet only you control, secured with a passkey, Face ID or Touch ID. There is no seed phrase to lose." />
            <InfoCard title="Your approval" description="You approve every batch of a run from your wallet before anything is issued." />
          </CardGrid>
        </Section>

        <Section
          title="On the roadmap: value you can verify"
          description="Starknet's proof system will let Medialane attest to real-world facts onchain, such as how many times a song streamed or an article was cited. As those proofs accumulate, the value of a licensed asset becomes something anyone can verify for themselves."
        />

        <LaunchpadCtaBanner
          eyebrow="Launchpad"
          title="See what you can issue today"
          description="Data Tokenization, IP Ticketing and Certificate Emission, run on your credits."
          href="/services"
          ctaLabel="View services"
          tone="manage"
        />
      </PageBody>
    </div>
  );
}
