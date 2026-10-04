import type { CollectionServiceId, ServiceId } from "@medialane/sdk";

export interface LaunchpadService {
  run: ServiceId;
  collections: CollectionServiceId;
}

export const LAUNCHPAD = {
  dataTokenization: { run: "data-tokenization-erc721", collections: "data-tokenization-erc721" },
  ticketing: { run: "ip-ticketing", collections: "ip-ticketing" },
  certificates: { run: "certificate-emission", collections: "pop-protocol" },
} as const satisfies Record<string, LaunchpadService>;
