/**
 * Minimal RPC failover fetch — mirrors the dapp's `@medialane/sdk`
 * `createFailoverFetch` / `PUBLIC_RPC_FALLBACKS` policy. The portal does not
 * depend on the SDK, so the policy is inlined here (small, single source).
 *
 * Why this exists: Alchemy's Starknet endpoint intermittently 503s
 * (`-32001 "Unable to complete request"`). starknet-react's post-connect
 * `starknet_chainId` chain-match check runs against this provider; pinned to a
 * single Alchemy URL with nothing to fall back to, that check hangs and the
 * wallet connect prompt spins forever. Failing over to public endpoints keeps
 * connect responsive during an outage.
 */

/** Public Starknet mainnet RPC endpoints used as failover targets. */
export const PUBLIC_RPC_FALLBACKS: string[] = [
  "https://starknet-mainnet.public.blastapi.io/rpc/v0_8",
  "https://free-rpc.nethermind.io/mainnet-juno/v0_8",
  "https://rpc.starknet.lava.build:443",
];

/**
 * Build a `fetch` that tries each URL in order, moving to the next on a network
 * error or a 5xx / -32001 RPC failure. The first URL is the configured primary;
 * the rest are public fallbacks. Returns the first successful response.
 */
export function createFailoverFetch(
  urls: string[],
): typeof fetch {
  const targets = Array.from(new Set(urls.filter(Boolean)));

  return async (input, init) => {
    let lastError: unknown;

    for (let i = 0; i < targets.length; i++) {
      const url = targets[i];
      try {
        const res = await fetch(url, init);

        // Retry the next endpoint on transient server errors.
        if (res.status >= 500 && i < targets.length - 1) {
          lastError = new Error(`RPC ${url} responded ${res.status}`);
          continue;
        }

        // Peek for the JSON-RPC -32001 "Unable to complete request" error, which
        // Alchemy returns with a 200 status during its intermittent outages.
        if (i < targets.length - 1) {
          const clone = res.clone();
          try {
            const body = await clone.json();
            if (body?.error?.code === -32001) {
              lastError = new Error(`RPC ${url} returned -32001`);
              continue;
            }
          } catch {
            // Not JSON / not an error envelope — return the response as-is.
          }
        }

        return res;
      } catch (err) {
        lastError = err;
        // Network-level failure — fall through to the next endpoint.
      }
    }

    throw lastError ?? new Error("All RPC endpoints failed");
  };
}
