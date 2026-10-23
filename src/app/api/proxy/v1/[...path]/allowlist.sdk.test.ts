import { afterEach, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  STARKNET_COLLECTION_1155_CONTRACT,
  STARKNET_COLLECTION_721_CONTRACT,
  STARKNET_MARKETPLACE_1155_CONTRACT,
  STARKNET_MARKETPLACE_721_CONTRACT,
} from "@medialane/sdk";
import { MedialaneClient } from "@medialane/sdk/starknet";
import { isPathAllowed } from "./allowlist";

const REPO_ROOT = process.cwd();
const PROXY_PREFIX = "/api/proxy/v1/";
const SDK_HELPER_METHODS = ["account.sessionWallet"];
const SDK_CALL = /\bapi(?:\(\))?((?:\.[A-Za-z]+)+)\(\s*(?:"([a-z-]+)")?/g;
const DUMMY = "0x0123";

const client = new MedialaneClient({
  backendUrl: "https://portal.medialane.io/api/proxy",
  marketplace721Contract: STARKNET_MARKETPLACE_721_CONTRACT,
  marketplace1155Contract: STARKNET_MARKETPLACE_1155_CONTRACT,
  collection721Contract: STARKNET_COLLECTION_721_CONTRACT,
  collection1155Contract: STARKNET_COLLECTION_1155_CONTRACT,
  chain: "STARKNET",
});

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== "node_modules" && entry !== ".next") sourceFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|d)\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function sdkMethodsUsed(): string[] {
  const names = new Set<string>(SDK_HELPER_METHODS);
  for (const file of sourceFiles(join(REPO_ROOT, "src"))) {
    for (const match of readFileSync(file, "utf8").matchAll(SDK_CALL)) {
      const path = match[1]!.slice(1);
      if (path === "intents.create" && !match[2]) continue;
      names.add(match[2] && path === "intents.create" ? `${path}:${match[2]}` : path);
    }
  }
  return [...names].sort();
}

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

async function requestMade(method: string): Promise<{ verb: string; path: string } | null> {
  let seen: { verb: string; path: string } | null = null;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    seen = { verb: (init?.method ?? "GET").toUpperCase(), path: url.pathname.slice(url.pathname.indexOf(PROXY_PREFIX) + PROXY_PREFIX.length) };
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  const [route, kind] = method.split(":");
  const segments = route!.split(".");
  let owner: unknown = client.api;
  for (const segment of segments.slice(0, -1)) owner = (owner as Record<string, unknown> | undefined)?.[segment];
  const fn = (owner as Record<string, unknown> | undefined)?.[segments[segments.length - 1]!];
  if (typeof fn !== "function") return null;
  const count = Math.max(fn.length, 1);
  const args = kind ? [kind, ...Array.from({ length: count - 1 }, () => DUMMY)] : Array.from({ length: count }, () => DUMMY);
  await (fn as (...a: unknown[]) => Promise<unknown>).apply(owner, args).catch(() => undefined);
  return seen;
}

test("every SDK api method the app calls reaches a path the proxy allows, with the verb it uses", async () => {
  const blocked: string[] = [];
  const unexercised: string[] = [];

  for (const method of sdkMethodsUsed()) {
    const request = await requestMade(method);
    if (!request) {
      unexercised.push(method);
      continue;
    }
    if (!isPathAllowed(request.verb, request.path)) blocked.push(`${method}: ${request.verb} /v1/${request.path}`);
  }

  expect(blocked).toEqual([]);
  expect(unexercised.filter((m) => m !== "isUserVerifyingPlatformAuthenticatorAvailable")).toEqual([]);
});
