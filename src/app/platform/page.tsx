import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero, Section, VideoFrame } from "@/components/site/page-shell";

const title = "How Medialane works";
const description =
  "Immutable records, permissionless contracts and one shared catalog behind everything built on Medialane.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/platform"),
  ...buildSocialMetadata({ title, description, imageAlt: "How Medialane works" }),
};

const PRINCIPLES = [
  {
    eyebrow: "The record",
    title: "Permanent by design",
    description:
      "Authorship, date and license terms are stored in content-addressed, immutable metadata. The history of every asset, sale and license can be replayed from onchain events.",
  },
  {
    eyebrow: "The contracts",
    title: "Open and permissionless",
    description:
      "Contracts are immutable and open to everyone. Once deployed they work the same way for every participant.",
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
      "Every app reads and writes the same catalog through the SDK, so every view shows the same record.",
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
      "Buy, sell and license what has been issued. A sale pays out the moment it completes, directly between buyer and seller.",
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
        <VideoFrame id="uH3jem2_Ix8" title="Medialane trailer: the story of media" />

        <Section title="The foundations" description="What everything built here rests on.">
          <CardGrid columns={4}>
            {PRINCIPLES.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Issue and trade" description="Everything here is issuing an asset or trading one.">
          <CardGrid columns={2}>
            {HUBS.map((hub) => (
              <InfoCard key={hub.title} title={hub.title} description={hub.description} />
            ))}
          </CardGrid>
        </Section>

        <Section title="Your wallet, your approval">
          <CardGrid columns={2}>
            <InfoCard title="Your wallet" description="Assets are created in a wallet secured with a passkey, Face ID or Touch ID." />
            <InfoCard title="Your approval" description="Every action is approved from your wallet before anything is issued." />
          </CardGrid>
        </Section>

        <Section
          title="On the roadmap: value you can verify"
          description="Starknet's proof system will let Medialane attest to real-world facts onchain, such as how many times a song streamed or an article was cited. As those proofs accumulate, the value of a licensed asset becomes something anyone can verify for themselves."
        />

      </PageBody>
    </div>
  );
}
