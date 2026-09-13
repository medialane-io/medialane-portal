import { LaunchpadCtaBanner } from "@medialane/ui";
import Link from "next/link";

export interface ServiceDetailBlock {
  eyebrow?: string;
  title: string;
  description: string;
}

export interface ServiceDetailContent {
  title: string;
  description: string;
  blocks: ServiceDetailBlock[];
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
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          {content.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{content.description}</p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.blocks.map((block) => (
            <div key={block.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
              {block.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{block.eyebrow}</p>
              ) : null}
              <h3 className="font-display text-lg font-bold text-foreground">{block.title}</h3>
              <p className="text-sm text-muted-foreground">{block.description}</p>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
}
