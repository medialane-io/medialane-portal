import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { LaunchpadCtaBanner } from "@medialane/ui";

const title = "AI Agents";
const description =
  "Headless authentication and pay-per-call access over x402, the same fee schedule as a human integrator, so agents can authenticate, provision credits, and call the API on their own.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/agents"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane for AI Agents" }),
};

const BLOCKS = [
  { eyebrow: "Headless authentication", title: "An agent authenticates on its own", description: "Any agent with a Starknet keypair authenticates, provisions credits, and calls the API entirely on its own." },
  { eyebrow: "x402, pay-per-call", title: "Pay for what you use, the moment you use it", description: "Machine-payable access over the x402 protocol. It's the same rail enterprises use to get paid for AI training access to their catalogs, on the other side of the same transaction." },
  { eyebrow: "Machine-readable", title: "The same registry the UI reads", description: "Action descriptions in the service registry are structured JSON an agent can call directly." },
];

export default function AgentsPage() {
  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          AI Agents
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          An agent authenticates, provisions credits, and calls the API on
          the same fee schedule as a human integrator.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {BLOCKS.map((block) => (
            <div key={block.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{block.eyebrow}</p>
              <h3 className="font-display text-lg font-bold text-foreground">{block.title}</h3>
              <p className="text-sm text-muted-foreground">{block.description}</p>
            </div>
          ))}
        </div>

        <LaunchpadCtaBanner
          eyebrow="Developers"
          title="View developer docs"
          description="Read the agent quickstart, or see the rights-holder side."
          href="/developers"
          ctaLabel="View developer docs"
          tone="manage"
        />
      </div>
    </div>
  );
}
