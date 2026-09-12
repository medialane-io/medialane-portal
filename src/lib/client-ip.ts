export const TRUSTED_APP_IP_HEADER = "x-medialane-client-ip";

const SPOOFABLE_FORWARDING_HEADERS = [
  "x-forwarded-for",
  "x-real-ip",
  "x-client-ip",
  "true-client-ip",
  "cf-connecting-ip",
  TRUSTED_APP_IP_HEADER,
];

export function isSpoofableForwardingHeader(name: string): boolean {
  return SPOOFABLE_FORWARDING_HEADERS.includes(name.toLowerCase());
}

export function trustedClientIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((hop) => hop.trim()).filter(Boolean);
    const nearest = hops[hops.length - 1];
    if (nearest) return nearest;
  }

  return "unknown";
}
