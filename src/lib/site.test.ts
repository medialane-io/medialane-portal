import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_ROUTES } from "./site";

const SRC = join(process.cwd(), "src");
const APP = join(SRC, "app");

function routeExists(path: string): boolean {
  const segments = path.split("/").filter(Boolean);
  let dir = APP;
  for (const segment of segments) {
    const exact = join(dir, segment);
    if (existsSync(exact) && statSync(exact).isDirectory()) {
      dir = exact;
      continue;
    }
    const dynamic = readdirSync(dir).find((entry) => /^\[[^\]]+\]$/.test(entry) && statSync(join(dir, entry)).isDirectory());
    if (!dynamic) return false;
    dir = join(dir, dynamic);
  }
  return ["page.tsx", "page.ts", "route.ts"].some((file) => existsSync(join(dir, file)));
}

function filesIn(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) filesIn(full, out);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\./.test(entry)) out.push(full);
  }
  return out;
}

const PUBLIC_SOURCES = [
  ...filesIn(join(SRC, "components", "home")),
  ...filesIn(join(SRC, "components", "site")),
  ...filesIn(join(SRC, "components", "services")),
  ...["platform", "services", "launchpad", "pricing", "developers", "agents", "infrastructure", "contact"].flatMap((dir) => filesIn(join(APP, dir))),
  join(APP, "page.tsx"),
  join(APP, "providers.tsx"),
  join(SRC, "lib", "nav-commands.ts"),
  join(SRC, "lib", "site.ts"),
];

const HREF = /(?:href=|href:)\s*\{?\s*["'`](\/[^"'`?#\s${}]*)/g;

describe("the public pages", () => {
  test("every route they advertise exists", () => {
    for (const route of PUBLIC_ROUTES) expect(routeExists(route), route).toBe(true);
  });

  test("every internal link on them points at a route that exists", () => {
    const broken: string[] = [];
    for (const file of PUBLIC_SOURCES) {
      for (const match of readFileSync(file, "utf8").matchAll(HREF)) {
        const path = match[1]!.replace(/\/$/, "") || "/";
        if (!routeExists(path)) broken.push(`${path} (in ${file.replace(SRC, "src")})`);
      }
    }
    expect(broken).toEqual([]);
  });

  test("they link to the pages that exist for each Launchpad service", () => {
    for (const route of ["/launchpad/data-tokenization", "/launchpad/ip-ticketing", "/launchpad/certificate-emission"]) {
      expect(routeExists(route), route).toBe(true);
    }
  });
});
