import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { LaunchpadStrip, LaunchpadCtaBanner } from "@medialane/ui";

const title = "Launchpad";
const description =
  "Give a list of people an asset. Everyone gets an account, a wallet and the asset, paid once from your credits.";

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
          Give a list of people an asset
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everyone on your list gets an account, a wallet and the asset. You pay once, from your
          credits, and nothing is asked of them beyond turning up.
        </p>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">
        <LaunchpadStrip
          hrefs={{
            "nfts": "/launchpad",
            "limited-editions": "/launchpad",
            "collection-drop": "/launchpad",
            "pop-protocol": "/launchpad",
            "ip-tickets": "/launchpad",
            "creator-coins": "/launchpad",
          }}
          launchpadHref="/launchpad"
        />

        <LaunchpadCtaBanner
          eyebrow="Pricing"
          title="See what a run costs"
          description="A wallet and an asset for each person, priced from the same table every service reads."
          href="/pricing"
          ctaLabel="See what it costs"
          tone="manage"
        />
      </div>
    </div>
  );
}
