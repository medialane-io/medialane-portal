"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Info, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_TOKENS } from "@medialane/sdk";
import { fundWithChainTransfer, type FundingStep, type FundingWallet } from "@medialane/sdk/starknet";
import { CurrencyIcon } from "@medialane/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useErc20Balance } from "@/hooks/use-erc20-balance";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSiwsToken } from "@/hooks/use-siws-token";
import { usdPriceFor, useUsdPrices } from "@/hooks/use-usd-prices";
import { cn } from "@/lib/utils";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { portalFundingApi } from "@/lib/funding/api";
import { formatUnits, InsufficientFundsError, insufficientFundsCopy } from "@/lib/funding/balance";
import { tokenAmountEstimate, tokenAtomicEstimate } from "@/lib/funding/estimate";
import {
  connectExternalWallet,
  listExternalWallets,
  mediaWalletFundingWallet,
  type ExternalWallet,
} from "@/lib/funding/wallets";

const STEP_COPY: Record<FundingStep, string> = {
  creating: "Starting your top-up",
  signing: "Confirm in your wallet",
  authorizing: "Checking your wallet",
  paying: "Approve the transfer in your wallet",
  confirming: "Waiting for the transfer to land",
};

const AMOUNT = /^\d{1,9}(\.\d{1,2})?$/;

const TOKENS = ["USDC", "ETH", "STRK", "USDT"] as const;
type Token = (typeof TOKENS)[number];

const MEDIA_WALLET = "media";

function tokenMeta(symbol: Token) {
  return SUPPORTED_TOKENS.find((t) => t.symbol === symbol)!;
}

function WalletBalance({ token, owner }: { token: Token; owner: string | null }) {
  const meta = tokenMeta(token);
  const { rawBalance, isLoading } = useErc20Balance(meta.address, owner);
  if (!owner) return <span>Connect to see balance</span>;
  if (rawBalance === null) return <span>{isLoading ? "Checking balance…" : "Balance unavailable"}</span>;
  return (
    <span className="tabular-nums">
      Balance {formatUnits(rawBalance, meta.decimals, "down")} {token}
    </span>
  );
}

export function AddCredits({ balance, onCredited }: { balance: number | undefined; onCredited: () => void }) {
  const { signer, address: mediaAddress } = useWalletNativeSession();
  const { getValidToken, signIn } = useSiwsToken();
  const usdPrices = useUsdPrices();

  const [amount, setAmount] = useState("10");
  const [token, setToken] = useState<Token>("USDC");
  const [external, setExternal] = useState<ExternalWallet[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [connected, setConnected] = useState<Record<string, FundingWallet>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [step, setStep] = useState<FundingStep | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shortAtPayment, setShortAtPayment] = useState<InsufficientFundsError | null>(null);

  useEffect(() => {
    listExternalWallets().then(setExternal).catch(() => setExternal([]));
  }, []);

  const options = [
    ...(signer ? [{ id: MEDIA_WALLET, label: "Media Wallet", where: "your Media Wallet" }] : []),
    ...external.map((w) => ({ id: w.id, label: w.name, where: `your ${w.name} wallet` })),
  ];
  const selectedId = chosen && options.some((o) => o.id === chosen) ? chosen : (options[0]?.id ?? null);
  const selected = options.find((o) => o.id === selectedId) ?? null;
  const owner = (id: string) => (id === MEDIA_WALLET ? mediaAddress : (connected[id]?.address ?? null));
  const selectedOwner = selectedId ? owner(selectedId) : null;

  const meta = tokenMeta(token);
  const dollars = Number(amount);
  const valid = AMOUNT.test(amount) && dollars >= 0.01;
  const credits = valid ? Math.floor(dollars * 100) : 0;
  const price = usdPriceFor(usdPrices, token);
  const estimate = valid ? tokenAmountEstimate(dollars, token, price) : null;
  const needed = valid ? tokenAtomicEstimate(dollars, token, meta.decimals, price) : null;

  const { rawBalance: held } = useErc20Balance(meta.address, selectedOwner);
  const shortNow =
    held !== null && needed !== null && held < needed
      ? new InsufficientFundsError(token, formatUnits(held, meta.decimals, "down"), formatUnits(needed, meta.decimals, "up"))
      : null;
  const short = shortNow ?? shortAtPayment;

  const busy = step !== null || connecting !== null;

  async function choose(id: string) {
    setChosen(id);
    setShortAtPayment(null);
    setError(null);
    if (id === MEDIA_WALLET || connected[id]) return;
    const wallet = external.find((w) => w.id === id);
    if (!wallet) return;
    setConnecting(id);
    try {
      const funding = await connectExternalWallet(wallet);
      setConnected((prev) => ({ ...prev, [id]: funding }));
    } catch (err) {
      setError(friendlyErrorMessage(err, `Could not connect to ${wallet.name}.`));
    } finally {
      setConnecting(null);
    }
  }

  async function pay() {
    if (!selectedId || !selected) return;
    const wallet = selectedId === MEDIA_WALLET ? (signer ? mediaWalletFundingWallet(signer) : null) : connected[selectedId];
    if (!wallet) return;

    setError(null);
    setMessage(null);
    setShortAtPayment(null);
    setStep("creating");
    try {
      const session = getValidToken() ?? (await signIn().catch(() => null));
      const result = await fundWithChainTransfer(portalFundingApi(session, token), wallet, {
        amountUsdc: amount,
        onStep: setStep,
      });
      if (result.status === "SETTLED") {
        toast.success(`${(result.credited ?? credits).toLocaleString()} credits added`);
        onCredited();
      } else {
        setMessage("Your transfer is on chain and will be credited shortly. You can close this.");
      }
    } catch (err) {
      if (err instanceof InsufficientFundsError) setShortAtPayment(err);
      else setError(friendlyErrorMessage(err, "Could not complete the top-up."));
    } finally {
      setStep(null);
    }
  }

  const copy = short && selected ? insufficientFundsCopy(short, selected.where) : null;
  const canPay = valid && selected !== null && selectedOwner !== null && !busy && !short;
  const status = connecting
    ? `Connecting to ${external.find((w) => w.id === connecting)?.name ?? "your wallet"}`
    : step
      ? STEP_COPY[step]
      : null;

  return (
    <section className="space-y-5 rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </span>
        <div>
          <h2 className="text-base font-bold">Add credits</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            One credit is one cent. {balance !== undefined ? `You have ${balance.toLocaleString()} credits.` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="amount" className="text-sm text-muted-foreground">Amount in dollars</label>
        <Input id="amount" inputMode="decimal" value={amount} onChange={(e) => { setAmount(e.target.value); setShortAtPayment(null); }} disabled={busy} />
        <p className="text-sm text-muted-foreground tabular-nums">
          {credits > 0 ? `${credits.toLocaleString()} credits${estimate ? ` · about ${estimate} ${token}` : ""}` : "Enter an amount"}
        </p>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">Pay with</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pay with">
          {TOKENS.map((symbol) => (
            <Button
              key={symbol}
              type="button"
              role="radio"
              aria-checked={symbol === token}
              size="sm"
              variant={symbol === token ? "default" : "outline"}
              disabled={busy}
              onClick={() => { setToken(symbol); setShortAtPayment(null); }}
            >
              <CurrencyIcon symbol={symbol} size={16} />
              <span className="ml-1.5">{symbol}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">From</span>
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No wallet found. Sign in with Media Wallet, or install Ready or Braavos.
          </p>
        ) : (
          <div className="space-y-2" role="radiogroup" aria-label="Pay from">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={option.id === selectedId}
                disabled={busy}
                onClick={() => choose(option.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-60",
                  option.id === selectedId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                )}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground">
                  <WalletBalance token={token} owner={owner(option.id)} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {copy ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{copy.title}</AlertTitle>
          <AlertDescription>{copy.body}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={pay} disabled={!canPay}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {valid ? `Add $${amount} in credits` : "Add credits"}
        </Button>
        {status ? <span className="text-sm text-muted-foreground" role="status">{status}</span> : null}
      </div>
    </section>
  );
}
