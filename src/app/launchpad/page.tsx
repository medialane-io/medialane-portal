import type { Metadata } from "next";
import Link from "next/link";
import { Database, Ticket } from "lucide-react";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { LaunchpadCtaBanner } from "@medialane/ui";
import { RunsList } from "@/components/launchpad/runs-list";

const title = "Launchpad";
const description = "Tokenize your catalog or issue tickets. Save a run, pay for it once, and pick it back up anytime.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/launchpad"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane Launchpad" }),
};

export default function LaunchpadPage() {
  return (
    <div className="pb-20">
      <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Issue your work
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tokenize your catalog or issue tickets. Save a run, pay for it once, and pick it back up
          anytime.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <RunsList />
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/launchpad/data-tokenization"
            className="flex items-start gap-4 rounded-2xl border border-border p-6 transition-colors hover:border-foreground/20"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </span>
            <div className="space-y-1.5">
              <h2 className="font-semibold">Data Tokenization</h2>
              <p className="text-sm text-muted-foreground">
                Tokenize a whole catalog into your own collection, with its licensing terms.
              </p>
            </div>
          </Link>
          <Link
            href="/launchpad/ip-ticketing"
            className="flex items-start gap-4 rounded-2xl border border-border p-6 transition-colors hover:border-foreground/20"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </span>
            <div className="space-y-1.5">
              <h2 className="font-semibold">IP Ticketing</h2>
              <p className="text-sm text-muted-foreground">
                Issue on-chain tickets and distribute them to a list of recipients.
              </p>
            </div>
          </Link>
        </div>

        <LaunchpadCtaBanner
          eyebrow="Pricing"
          title="See what it costs"
          description="Every service is priced from the same table, read live."
          href="/pricing"
          ctaLabel="See pricing"
          tone="manage"
        />
      </div>
    </div>
  );
}
