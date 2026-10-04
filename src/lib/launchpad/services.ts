import type { CollectionServiceId, ServiceId } from "@medialane/sdk";

export interface LaunchpadService {
  run: ServiceId;
  collections: CollectionServiceId;
  label: string;
  href: string;
}

export const LAUNCHPAD = {
  dataTokenization: {
    run: "data-tokenization-erc721",
    collections: "data-tokenization-erc721",
    label: "Data Tokenization",
    href: "/launchpad/data-tokenization",
  },
  ticketing: {
    run: "ip-ticketing",
    collections: "ip-ticketing",
    label: "IP Ticketing",
    href: "/launchpad/ip-ticketing",
  },
  certificates: {
    run: "certificate-emission",
    collections: "pop-protocol",
    label: "Certificate Emission",
    href: "/launchpad/certificate-emission",
  },
} as const satisfies Record<string, LaunchpadService>;

export function launchpadServiceFor(run: string): LaunchpadService | undefined {
  return Object.values(LAUNCHPAD).find((service) => service.run === run);
}
