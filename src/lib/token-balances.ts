import { SUPPORTED_TOKENS } from "@medialane/sdk";

const BALANCE_OF = "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e";

export type Balances = Record<string, bigint>;

export function formatBalance(raw: bigint, decimals: number, maxFractionDigits = 4): string {
  const factor = 10n ** BigInt(decimals);
  const whole = raw / factor;
  const remainder = raw % factor;
  if (remainder === 0n) return whole.toString();
  const fraction = remainder.toString().padStart(decimals, "0").slice(0, maxFractionDigits).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function toAtomic(human: string, decimals: number): bigint | null {
  const trimmed = human.trim();
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed)) return null;
  const [whole = "0", frac = ""] = trimmed.split(".");
  if (frac.length > decimals) return null;
  const padded = frac.padEnd(decimals, "0");
  try {
    return BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");
  } catch {
    return null;
  }
}

export function hasEnough(balance: bigint | undefined, human: string, decimals: number): boolean {
  if (balance === undefined) return true;
  const wanted = toAtomic(human, decimals);
  if (wanted === null) return true;
  return wanted <= balance;
}

export function sortByHoldings(balances: Balances) {
  return [...SUPPORTED_TOKENS].sort((a, b) => {
    const av = balances[a.symbol] ?? 0n;
    const bv = balances[b.symbol] ?? 0n;
    if (av === bv) return 0;
    return av > bv ? -1 : 1;
  });
}

export async function readTokenBalances(owner: string, rpcUrl: string): Promise<Balances> {
  const entries = await Promise.all(
    SUPPORTED_TOKENS.map(async (token) => {
      try {
        const res = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "starknet_call",
            params: {
              request: {
                contract_address: token.address,
                entry_point_selector: BALANCE_OF,
                calldata: [owner],
              },
              block_id: "latest",
            },
          }),
        });
        const json = (await res.json()) as { result?: string[] };
        const low = json.result?.[0];
        const high = json.result?.[1] ?? "0x0";
        if (!low) return [token.symbol, 0n] as const;
        return [token.symbol, BigInt(low) + (BigInt(high) << 128n)] as const;
      } catch {
        return [token.symbol, 0n] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}
