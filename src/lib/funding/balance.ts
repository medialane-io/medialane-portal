import { SUPPORTED_TOKENS } from "@medialane/sdk";
import { FundingTransferNotSentError, type FundingTransferCall } from "@medialane/sdk/starknet";
import { starknetProvider } from "@/lib/starknet";

export type BalanceReader = (token: string, owner: string) => Promise<bigint>;

export const readTokenBalance: BalanceReader = async (token, owner) => {
  const res = await starknetProvider.callContract({ contractAddress: token, entrypoint: "balanceOf", calldata: [owner] });
  return BigInt(res[0]!) + (BigInt(res[1] ?? "0x0") << 128n);
};

/** Shows an amount with at most six places, rounded the way that never misleads: what you have down, what you need up. */
export function formatUnits(value: bigint, decimals: number, round: "down" | "up"): string {
  const places = Math.min(6, decimals);
  const scale = 10n ** BigInt(decimals - places);
  let units = value / scale;
  if (round === "up" && value % scale !== 0n) units += 1n;
  const base = 10n ** BigInt(places);
  const fraction = (units % base).toString().padStart(places, "0").replace(/0+$/, "");
  const whole = units / base;
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function tokenAt(address: string) {
  try {
    return SUPPORTED_TOKENS.find((t) => BigInt(t.address) === BigInt(address));
  } catch {
    return undefined;
  }
}

/** Raised when a wallet holds less of a token than the top-up asks for. Nothing was sent. */
export class InsufficientFundsError extends FundingTransferNotSentError {
  constructor(
    readonly symbol: string | null,
    readonly have: string | null,
    readonly amount: string | null,
  ) {
    super(
      symbol
        ? `Not enough ${symbol} in this wallet. You have ${have} ${symbol} and this top-up is ${amount} ${symbol}.`
        : "Not enough funds in this wallet for this top-up.",
    );
    this.name = "InsufficientFundsError";
  }
}

/** The words shown to a person whose wallet is short: what they have, what they are adding, and what to do. */
export function insufficientFundsCopy(err: InsufficientFundsError): { title: string; body: string } {
  const next = "lower the amount, or pay with another token.";
  if (!err.symbol) {
    return { title: "Not enough funds in this wallet", body: `Add funds to the wallet, ${next}` };
  }
  if (err.have === "0") {
    return {
      title: `No ${err.symbol} in this wallet`,
      body: `This top-up is ${err.amount} ${err.symbol}. Add ${err.symbol} to the wallet, ${next}`,
    };
  }
  return {
    title: `Not enough ${err.symbol} in this wallet`,
    body: `You have ${err.have} ${err.symbol} and this top-up is ${err.amount} ${err.symbol}. Add more, ${next}`,
  };
}

/**
 * Before the wallet is asked to sign, make sure it holds enough of the token. Throws the "not sent"
 * error, so the top-up is closed and the person is told what is short. If the balance cannot be read
 * it lets the payment go ahead: the wallet has the last word.
 */
export async function assertWalletCanCover(
  call: FundingTransferCall,
  owner: string,
  readBalance: BalanceReader = readTokenBalance,
): Promise<void> {
  const needed = BigInt(call.calldata[1] ?? "0") + (BigInt(call.calldata[2] ?? "0") << 128n);
  let have: bigint;
  try {
    have = await readBalance(call.contractAddress, owner);
  } catch {
    return;
  }
  if (have >= needed) return;

  const token = tokenAt(call.contractAddress);
  throw token
    ? new InsufficientFundsError(token.symbol, formatUnits(have, token.decimals, "down"), formatUnits(needed, token.decimals, "up"))
    : new InsufficientFundsError(null, null, null);
}
