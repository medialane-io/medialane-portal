import Link from "next/link";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { CardGrid, InfoCard, PageBody, PageHero, Section, StepList } from "@/components/site/page-shell";

export interface ServiceDetailBlock {
  eyebrow?: string;
  title: string;
  description: string;
}

export interface ServiceDetailContent {
  eyebrow?: string;
  title: string;
  description: string;
  blocks: ServiceDetailBlock[];
  steps?: { title: string; description: string }[];
  cta?: { label: string; href: string };
  secondaryCta?: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
}

export function ServiceDetailPage({ content }: { content: ServiceDetailContent }) {
  return (
    <div className="pb-20">
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description}>
        {content.cta ? (
          <div>
            <Link
              href={content.cta.href}
              className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {content.cta.label}
            </Link>
          </div>
        ) : null}
      </PageHero>
      <PageBody>
        <CardGrid columns={3}>
          {content.blocks.map((block) => (
            <InfoCard key={block.title} eyebrow={block.eyebrow} title={block.title} description={block.description} />
          ))}
        </CardGrid>
        {content.steps ? (
          <Section title="How it works">
            <StepList steps={content.steps} />
          </Section>
        ) : null}
        {content.secondaryCta ? (
          <LaunchpadCtaBanner
            eyebrow={content.secondaryCta.eyebrow}
            title={content.secondaryCta.title}
            description={content.secondaryCta.description}
            href={content.secondaryCta.href}
            ctaLabel={content.secondaryCta.ctaLabel}
            tone="manage"
          />
        ) : null}
        <div className="text-center">
          <Link href="/services" className="text-sm font-medium text-primary hover:underline">
            All services
          </Link>
        </div>
      </PageBody>
    </div>
  );
}
