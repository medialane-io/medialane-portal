"use client";

import { LaunchpadStrip, LaunchpadCtaBanner } from "@medialane/ui";

export function HomePage() {
  return (
    <div className="pb-20">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 lg:space-y-20 pt-16 sm:pt-24">
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
          eyebrow="Developers"
          title="Hold a key, pay per call"
          description="Every endpoint is priced and metered. Agents pay the same way people do."
          href="/account"
          ctaLabel="Get a key"
          tone="manage"
        />
      </div>
    </div>
  );
}
