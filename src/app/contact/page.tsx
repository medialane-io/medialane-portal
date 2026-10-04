import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { CardGrid, InfoCard, PageBody, PageHero } from "@/components/site/page-shell";
import { CONTACT_EMAIL, DOCS_URL } from "@/lib/site";

const title = "Contact";
const description = "Tell us what you are protecting, issuing or building, and we will help you choose the right service.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/contact"),
  ...buildSocialMetadata({ title, description, imageAlt: "Contact Medialane" }),
};

const INCLUDE = [
  { title: "What you want to do", description: "Register a catalog, issue tickets or certificates, license work for AI use, or build it into your product." },
  { title: "How much", description: "A rough size: the number of items, recipients or calls you expect." },
  { title: "Where you are", description: "Your organization and where your audience or rights holders are." },
];

export default function ContactPage() {
  return (
    <div className="pb-20">
      <PageHero title="Talk to us" description={description}>
        <div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </PageHero>
      <PageBody>
        <CardGrid columns={3}>
          {INCLUDE.map((item) => (
            <InfoCard key={item.title} {...item} />
          ))}
        </CardGrid>
        <p className="text-center text-sm text-muted-foreground">
          Looking for technical answers first? Read the{" "}
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
            docs
          </a>
          .
        </p>
      </PageBody>
    </div>
  );
}
