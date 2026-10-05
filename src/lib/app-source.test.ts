import { afterEach, expect, mock, test } from "bun:test";
import { APP_SOURCE } from "./app-source";
import { getMedialaneClient } from "./medialane-client";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

test("the portal's app name is the registered one", () => {
  expect(APP_SOURCE).toBe("MEDIALANE_PORTAL");
});

test("the client the portal builds sends its app name on every request", async () => {
  const seen: Record<string, string>[] = [];
  globalThis.fetch = mock(async (_url: unknown, init?: RequestInit) => {
    seen.push((init?.headers ?? {}) as Record<string, string>);
    return new Response(JSON.stringify({ exists: false }), { status: 200 });
  }) as unknown as typeof fetch;
  await getMedialaneClient().api.checkEmail("someone@example.test");
  expect(seen).toHaveLength(1);
  expect(seen[0]!["x-app-source"]).toBe("MEDIALANE_PORTAL");
});
