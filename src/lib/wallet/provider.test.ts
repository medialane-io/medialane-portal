import { test, expect } from "bun:test";
import { walletProvider } from "./provider";

function nodeUrlOf(provider: ReturnType<typeof walletProvider>): string {
  return (provider as unknown as { channel: { nodeUrl: string } }).channel.nodeUrl;
}

test("walletProvider uses the metered /api/rpc proxy, not a direct RPC URL", () => {
  expect(nodeUrlOf(walletProvider())).toBe("/api/rpc");
});

test("walletProvider accepts no argument, so no caller can route around the meter", () => {
  expect(walletProvider.length).toBe(0);
  const override = walletProvider as unknown as (rpc?: string) => ReturnType<typeof walletProvider>;
  expect(nodeUrlOf(override("https://example.test/custom-rpc"))).toBe("/api/rpc");
});
