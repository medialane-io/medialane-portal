import { test, expect } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isPathAllowed } from "./allowlist";

test("no method in the allowlist is a catch-all pattern", () => {
  for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
    expect(isPathAllowed(method, "portal/me")).toBe(false);
    expect(isPathAllowed(method, "business/provisioning")).toBe(false);
  }
});

const REPO_ROOT = process.cwd();
const APP_ROOTS = ["src/hooks", "src/components", "src/app"];
const EXCLUDED_DIRS = [join(REPO_ROOT, "src/app/api")];
const EXCLUDED_FILES = new Set([

  join(REPO_ROOT, "src/lib/api-server.ts"),
  join(REPO_ROOT, "src/lib/backend-metadata.ts"),

  join(REPO_ROOT, "src/app/collection/[slug]/page.tsx"),
]);
const UI_DIST_DIR = join(REPO_ROOT, "node_modules/@medialane/ui/dist");

const NOT_PROXIED_PREFIXES = ["rpc", "paymaster/", "swap/"];

function walk(dir: string, out: string[] = []): string[] {
  if (EXCLUDED_DIRS.some((excluded) => dir === excluded || dir.startsWith(excluded + "/"))) {
    return out;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, out);
    } else if (/\.(ts|tsx|js)$/.test(entry) && !/\.(test|d)\.(ts|tsx|js)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function extractPaths(source: string): string[] {
  const found: string[] = [];
  const START = /\/(?:api\/proxy\/)?v1\//g;
  let start: RegExpExecArray | null;
  while ((start = START.exec(source))) {
    let i = start.index + start[0].length;
    let path = "";
    while (i < source.length) {
      const ch = source[i];
      if (ch === "$" && source[i + 1] === "{") {
        const close = source.indexOf("}", i + 2);
        if (close === -1) break;
        path += "PARAM";
        i = close + 1;
        continue;
      }
      if (/[A-Za-z0-9_\-./:]/.test(ch)) {
        path += ch;
        i++;
        continue;
      }
      break;
    }
    path = path.replace(/\/+$/, "");
    if (path) found.push(path);
  }
  return found;
}

test("every /v1/* path referenced by app code and @medialane/ui is covered by the proxy allowlist", () => {
  const files = [
    ...APP_ROOTS.flatMap((root) => walk(join(REPO_ROOT, root))),
    ...walk(UI_DIST_DIR).filter((f) => !f.endsWith(".map")),
  ].filter((f) => !EXCLUDED_FILES.has(f));

  const uncovered = new Map<string, string>();

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const path of extractPaths(source)) {
      if (NOT_PROXIED_PREFIXES.some((prefix) => path.startsWith(prefix))) continue;
      const covered = ["GET", "POST", "PATCH", "DELETE"].some((method) =>
        isPathAllowed(method, path)
      );
      if (!covered && !uncovered.has(path)) {
        uncovered.set(path, relative(REPO_ROOT, file));
      }
    }
  }

  if (uncovered.size > 0) {
    const details = [...uncovered.entries()]
      .map(([path, file]) => `  /v1/${path}  (found in ${file})`)
      .join("\n");
    throw new Error(
      `${uncovered.size} path(s) are referenced but not covered by any method in allowlist.ts:\n${details}\n\n` +
        `Either add the path to allowlist.ts, or if it's not meant to be publicly reachable, remove the call site.`
    );
  }
});
