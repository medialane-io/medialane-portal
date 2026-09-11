export type BilledTo = "portal" | "customer";

export function billTo(path: string, method: string): BilledTo {
  if (path.startsWith("/v1/portal/")) return "customer";
  return method.toUpperCase() === "GET" ? "portal" : "customer";
}
