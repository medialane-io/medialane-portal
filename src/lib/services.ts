import { listServices, getService, type ServiceDefinition } from "@medialane/sdk";

const LAUNCHPAD_SERVICES = new Set(["data-tokenization-erc721", "ip-tickets"]);

export function isLaunchpadService(service: ServiceDefinition): boolean {
  return LAUNCHPAD_SERVICES.has(service.id) && service.capabilities.includes("mint");
}

export function launchpadServices(): ServiceDefinition[] {
  return listServices().filter(isLaunchpadService);
}

export function launchpadService(id: string): ServiceDefinition | undefined {
  const service = getService(id);
  return service && isLaunchpadService(service) ? service : undefined;
}
