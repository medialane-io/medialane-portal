import { test, expect } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { RATE_LIMIT_POLICY, limiterFor, type RateLimitName } from "./rate-limit-policy";

const API_DIR = "src/app/api";

function routeFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...routeFiles(full));
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

const routes = routeFiles(API_DIR).map((path) => ({ path, source: readFileSync(path, "utf8") }));

test("there is at least one route to check, so this test cannot pass vacuously", () => {
  expect(routes.length).toBeGreaterThan(3);
});

test("no route builds its own limiter outside the policy", () => {
  const offenders = routes.filter((r) => r.source.includes("createRateLimiter"));
  expect(offenders.map((r) => r.path)).toEqual([]);
});

test("every limiter name a route asks for exists in the policy", () => {
  const unknown: string[] = [];
  for (const { path, source } of routes) {
    for (const [, name] of source.matchAll(/limiterFor\("([^"]+)"\)/g)) {
      if (!(name in RATE_LIMIT_POLICY)) unknown.push(`${path} -> ${name}`);
    }
  }
  expect(unknown).toEqual([]);
});

test("every policy entry is actually wired to a route", () => {
  const used = new Set<string>();
  for (const { source } of routes) {
    for (const [, name] of source.matchAll(/limiterFor\("([^"]+)"\)/g)) used.add(name);
  }
  const unused = Object.keys(RATE_LIMIT_POLICY).filter((name) => !used.has(name));
  expect(unused).toEqual([]);
});

test("no policy entry is accidentally unbounded", () => {
  for (const [name, rule] of Object.entries(RATE_LIMIT_POLICY)) {
    expect(rule.max, name).toBeGreaterThan(0);
    expect(rule.max, name).toBeLessThanOrEqual(1000);
    expect(rule.windowMs, name).toBeGreaterThanOrEqual(1000);
  }
});

test("sponsored-gas routes are capped tighter than plain reads", () => {
  const sponsored: RateLimitName[] = ["wallet:deploy-execute", "wallet:invoke-execute"];
  for (const name of sponsored) {
    expect(RATE_LIMIT_POLICY[name].max).toBeLessThan(RATE_LIMIT_POLICY["proxy:backend"].max);
  }
});

test("limiterFor returns one shared limiter per name, so callers cannot reset a budget", () => {
  expect(limiterFor("proxy:rpc")).toBe(limiterFor("proxy:rpc"));
  expect(limiterFor("proxy:rpc")).not.toBe(limiterFor("proxy:backend"));
});

test("metered upstreams are bounded by credits, not by a second limit here", () => {

  const names = Object.keys(RATE_LIMIT_POLICY);
  expect(names.some((n) => n.startsWith("metadata:"))).toBe(false);
});
