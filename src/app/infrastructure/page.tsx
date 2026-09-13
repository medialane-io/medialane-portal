import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { LaunchpadCtaBanner } from "@medialane/ui";

const title = "Infrastructure";
const description =
  "Add tokenization to your own product through one API. Tickets, memberships, collections, licensing, or a coin, ready-made, with your own interface on top.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/infrastructure"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Infrastructure" }),
};

const BLOCKS = [
  { title: "Pick what you want to add", description: "Tickets, memberships, collections, licensing, or a coin. Each is a ready-made capability you can add directly." },
  { title: "Connect through one API", description: "Call Medialane's API to issue and manage assets for your product. No contracts to write, audit, or deploy yourself." },
  { title: "Build your own screens", description: "You design the interface your customers see. Medialane runs the tokenization underneath it, out of view." },
  { title: "Works beyond your product", description: "Every asset follows the same industry-standard format, recognized by other marketplaces and apps across the industry." },
];

export default function InfrastructurePage() {
  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Power your product with Medialane&apos;s tokenization platform
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Plug in ready-made tokenization capabilities. Ship in days on
          infrastructure Medialane&apos;s own products already run on.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BLOCKS.map((block) => (
            <div key={block.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
              <h3 className="font-display text-lg font-bold text-foreground">{block.title}</h3>
              <p className="text-sm text-muted-foreground">{block.description}</p>
            </div>
          ))}
        </div>

        <LaunchpadCtaBanner
          eyebrow="Developers"
          title="Connect through one API"
          description="Call Medialane's API to issue and manage assets for your product."
          href="/developers"
          ctaLabel="View developer docs"
          tone="manage"
        />
      </div>
    </div>
  );
}
