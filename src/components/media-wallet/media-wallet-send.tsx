"use client";

import { useState } from "react";
import { Account, CallData, cairo, validateAndParseAddress, type Call } from "starknet";
import { parseAmount, formatAmount } from "@medialane/sdk";
import { CurrencyIcon, ActionButton } from "@medialane/ui";
import { starknetProvider } from "@/lib/starknet";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useErc20Balance, useTokenBalance } from "@/hooks/use-erc20-balance";
import { useWalletWriteAction } from "@/hooks/use-wallet-write-action";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { fmt, short } from "@/lib/wallet-format";
import { BackButton } from "./back-button";
import { TrustNote } from "./action-button";
import { ActionModal, BusyOverlay } from "./action-modal";
import { CurrencySheet } from "./currency-sheet";
import { WALLET_TOKENS, type WalletToken } from "./wallet-tokens";
import { SuccessDialog } from "./success-dialog";
import type { MediaWalletView } from "./types";

function isValidStarknetAddress(address: string): boolean {
  try {
    validateAndParseAddress(address.trim());
    return true;
  } catch {
    return false;
  }
}

async function estimateSendFee(address: string, token: string, to: string, amountRaw: bigint) {
  const account = new Account({ provider: starknetProvider, address, signer: "0x1", cairoVersion: "1" });
  const call: Call = {
    contractAddress: token,
    entrypoint: "transfer",
    calldata: CallData.compile({ recipient: to, amount: cairo.uint256(amountRaw) }),
  };
  const est = await account.estimateInvokeFee(call);
  return { feeRaw: est.overall_fee, unit: est.unit };
}

export function MediaWalletSend({
  initialToken,
  onNavigate,
  onDone,
}: {
  initialToken?: WalletToken;
  onNavigate: (view: MediaWalletView) => void;
  onDone: () => void;
}) {
  const { address } = useWalletNativeSession();
  const { run, status, reset, error } = useWalletWriteAction();

  const [currency, setCurrency] = useState<WalletToken>(initialToken ?? WALLET_TOKENS[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const strk = useTokenBalance("STRK", address);
  const eth = useTokenBalance("ETH", address);
  const usdc = useTokenBalance("USDC", address);
  const wbtc = useTokenBalance("WBTC", address);
  
  const pinnedBalancesBySymbol: Record<string, bigint | null> = {
    STRK: strk.rawBalance, ETH: eth.rawBalance, USDC: usdc.rawBalance, WBTC: wbtc.rawBalance,
  };
  const { rawBalance: currencyBalance } = useErc20Balance(currency.address, address);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fee, setFee] = useState<{ raw: bigint; unit: string } | null>(null);
  const [feeError, setFeeError] = useState<string | null>(null);

  const recipientValid = isValidStarknetAddress(to);
  let amountRaw: bigint | null;
  try {
    amountRaw = amount.trim() ? BigInt(parseAmount(amount.trim(), currency.decimals)) : null;
  } catch {
    amountRaw = null;
  }
  const amountOverBalance = amountRaw != null && currencyBalance != null && amountRaw > currencyBalance;
  const composeReady = recipientValid && amountRaw != null && amountRaw > 0n && !amountOverBalance;

  const pasteRecipient = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setTo(text.trim());
    } catch {

    }
  };

  const setMax = () => {
    if (currencyBalance == null) return;
    setAmount(formatAmount(currencyBalance.toString(), currency.decimals));
  };

  const openReview = () => {
    if (!address || !composeReady || amountRaw == null) return;
    setFeeError(null);
    setFee(null);
    setConfirmOpen(true);
    estimateSendFee(address, currency.address, to.trim(), amountRaw)
      .then((f) => setFee({ raw: f.feeRaw, unit: f.unit }))
      .catch((e) => setFeeError(friendlyErrorMessage(e)));
  };

  const send = async () => {
    if (!composeReady || amountRaw == null) return;
    setConfirmOpen(false);
    const dest = to.trim();
    const amt = amountRaw;
    await run(async (signer) => {
      const call: Call = {
        contractAddress: currency.address,
        entrypoint: "transfer",
        calldata: CallData.compile({ recipient: dest, amount: cairo.uint256(amt) }),
      };
      const result = await signer.execute([call]);
      setTxHash(result.txHash);
      return result;
    });
  };

  return (
    <main className="flex flex-col gap-6 px-5 pb-8 pt-2">
      <div className="flex items-center gap-3">
        <BackButton onBack={() => onNavigate({ name: "home" })} />
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">Send</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs leading-relaxed">
          <b>Something went wrong.</b> {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient  0x…"
              spellCheck={false}
              className="w-0 flex-1 rounded-2xl border border-border bg-foreground/[0.05] px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-brand-purple"
            />
            {to.trim() === "" && (
              <button
                onClick={pasteRecipient}
                className="shrink-0 rounded-2xl border border-border bg-foreground/[0.05] px-3 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Paste
              </button>
            )}
          </div>
          {to.trim() !== "" && !recipientValid && (
            <p className="mt-1.5 px-1 text-xs text-destructive">Not a valid Starknet address.</p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full rounded-2xl border border-border bg-foreground/[0.05] px-4 py-3 pr-36 text-sm outline-none transition-colors focus:border-brand-purple"
            />
            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              <button
                onClick={setMax}
                className="rounded-full bg-foreground/[0.06] px-2 py-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                MAX
              </button>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-semibold"
              >
                <CurrencyIcon symbol={currency.symbol} size={16} /> {currency.symbol}
              </button>
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">
              Balance: {currencyBalance != null ? fmt(currencyBalance, currency.decimals) : "…"}
            </span>
            {amountOverBalance && <span className="text-xs text-destructive">Amount exceeds balance.</span>}
          </div>
        </div>

        <ActionButton
          action="offer"
          big
          onClick={openReview}
          disabled={status === "processing" || !composeReady}
          className="mt-1 w-full disabled:pointer-events-none disabled:opacity-40"
        >
          Review Transfer
        </ActionButton>
        <TrustNote>Gas paid from your balance. Transfers are permanent and recorded onchain.</TrustNote>
      </div>

      {pickerOpen && (
        <CurrencySheet
          title="Choose currency"
          tokens={WALLET_TOKENS}
          balances={pinnedBalancesBySymbol}
          onSelect={(t) => {
            setCurrency(t);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {confirmOpen && (
        <ActionModal title="Review Transfer" onClose={() => setConfirmOpen(false)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">Send</div>
                <div className="truncate font-mono text-xs text-muted-foreground">To: {short(to.trim())}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.05] p-4">
              <CurrencyIcon symbol={currency.symbol} size={28} />
              <div className="min-w-0 flex-1 font-semibold">{currency.symbol}</div>
              <div className="text-right font-semibold tabular-nums">
                −{amount.trim()} {currency.symbol}
              </div>
            </div>

            <div className="flex flex-col divide-y divide-border/40 rounded-2xl bg-foreground/[0.05] px-4">
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{amount.trim()} {currency.symbol}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-mono font-medium">{short(to.trim())}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Contract</span>
                <span className="font-medium">{currency.symbol}</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-muted-foreground">Call</span>
                <span className="font-medium underline">transfer</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
              <span className="text-muted-foreground">Estimated fee</span>
              <span className="font-medium">
                {feeError ? "Unavailable" : fee ? `${fmt(fee.raw, 18, 6)} ${fee.unit === "FRI" ? "STRK" : "ETH"}` : "Estimating…"}
              </span>
            </div>
            {feeError && <p className="px-1 text-xs text-destructive">Fee estimate failed: {feeError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Reject
              </button>
              <ActionButton action="offer" big onClick={send} className="flex-1">
                Confirm
              </ActionButton>
            </div>
          </div>
        </ActionModal>
      )}

      {status === "processing" && <BusyOverlay label="Signing & sending…" />}
      {status === "success" && txHash && (
        <SuccessDialog
          title="Sent"
          message={`${amount.trim()} ${currency.symbol} is on its way.`}
          txHash={txHash}
          onClose={() => {
            reset();
            onDone();
          }}
        />
      )}
    </main>
  );
}
