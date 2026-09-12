import { createRateLimiter } from "@medialane/sdk";

export interface RateLimitRule {
  windowMs: number;
  max: number;
  protects: string;
}

const MINUTE = 60_000;

export const RATE_LIMIT_POLICY = {
  "proxy:backend": {
    windowMs: MINUTE,
    max: 600,
    protects: "Metered backend reads and writes billed to the portal API key",
  },
  "proxy:rpc": {
    windowMs: MINUTE,
    max: 600,
    protects: "Starknet RPC calls billed per call against the Alchemy cap",
  },
  "wallet:deploy-build": {
    windowMs: MINUTE,
    max: 30,
    protects: "Sponsored wallet deploy typed-data builds",
  },
  "wallet:deploy-execute": {
    windowMs: MINUTE,
    max: 30,
    protects: "Sponsored wallet deploys, where AVNU spends real gas",
  },
  "wallet:invoke-build": {
    windowMs: MINUTE,
    max: 30,
    protects: "Sponsored invoke typed-data builds",
  },
  "wallet:invoke-execute": {
    windowMs: MINUTE,
    max: 30,
    protects: "Sponsored invokes, where AVNU spends real gas",
  },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitName = keyof typeof RATE_LIMIT_POLICY;

const limiters = new Map<RateLimitName, (key: string) => boolean>();

export function limiterFor(name: RateLimitName): (key: string) => boolean {
  const existing = limiters.get(name);
  if (existing) return existing;

  const rule = RATE_LIMIT_POLICY[name];
  const limiter = createRateLimiter(rule.windowMs, rule.max);
  limiters.set(name, limiter);
  return limiter;
}
