import { NextRequest } from "next/server";

/** Per-instance in-memory limiter — bounds abuse from a single process, not
 * a global guarantee across serverless instances. Good enough as a floor;
 * see the security audit notes for the multi-instance caveat. */
export function createRateLimiter(windowMs: number, max: number) {
  const counts = new Map<string, { count: number; resetAt: number }>();

  return function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const entry = counts.get(key);
    if (!entry || now >= entry.resetAt) {
      counts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= max) return false;
    entry.count += 1;
    return true;
  };
}

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
