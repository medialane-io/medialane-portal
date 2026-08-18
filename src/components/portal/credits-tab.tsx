"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAccount } from "@starknet-react/core";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Coins, Zap, ExternalLink, Loader2, Info, KeyRound } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { CREDITS_PER_USDC, EXPLORER_URL } from "@/src/lib/constants";

const USDC_CONTRACT = "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";

interface Props {
  address: string;
}

interface Payment {
  id: string;
  amountAtomic: string;
  creditedAmount: number;
  mdlnMultiplier: number;
  txHash: string;
  status: string;
  createdAt: string;
}

interface CreditsData {
  data?: { balance?: number; history?: Payment[] };
}

export function CreditsTab({ address }: Props) {
  const { account } = useAccount();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const [credited, setCredited] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: creditsData, mutate: mutateCredits } = useSWR<CreditsData>(
    `/api/portal/credits?address=${address}`,
    portalFetcher,
  );

  const treasuryAddress = process.env.NEXT_PUBLIC_STARKNET_X402_TREASURY ?? "";
  const balance = creditsData?.data?.balance ?? 0;
  const payments = creditsData?.data?.history ?? [];
  const parsedUsdc = parseFloat(usdcAmount);
  const previewCredits =
    !isNaN(parsedUsdc) && parsedUsdc > 0 ? Math.floor(parsedUsdc * CREDITS_PER_USDC) : null;

  async function fundCredit(txHash: string) {
    setError(null);
    const res = await fetch(`/api/portal/credits/fund?address=${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: { credited: number }; error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not verify the payment yet. Try “Confirm credit” again in a moment.");
      return;
    }
    setCredited(json.data?.credited ?? 0);
    setPendingTx(null);
    mutateCredits();
  }

  async function handleDeposit() {
    if (!account || !treasuryAddress) return;
    const usdc = parseFloat(usdcAmount);
    if (isNaN(usdc) || usdc <= 0) return;

    setDepositing(true);
    setError(null);
    setCredited(null);
    setPendingTx(null);

    try {
      const amount = BigInt(Math.round(usdc * 1_000_000));
      const result = await account.execute([
        {
          contractAddress: USDC_CONTRACT,
          entrypoint: "transfer",
          calldata: [treasuryAddress, amount.toString(), "0"],
        },
      ]);
      const txHash = result.transaction_hash;
      setPendingTx(txHash);
      setUsdcAmount("");

      await fundCredit(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          API Credits
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Every API call is billed per action from this balance. No subscription, no monthly cap — top up with USDC on Starknet whenever you&apos;re running low.
        </p>

        <div className="mt-8 mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
          <p className="text-5xl sm:text-6xl font-bold text-foreground tabular-nums">{balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">credits remaining</p>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground mb-6 max-w-md">
          <KeyRound className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
          This balance is shared across every API key on your account — revoking or losing a key never affects it.
        </p>

        <div className="space-y-3 max-w-md">
          <Label className="text-sm font-medium">Add credits (USDC on Starknet)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="10"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
            />
            <Button variant="gradient-fill" className="from-brand-navy to-brand-purple" onClick={handleDeposit} disabled={depositing || !account || !usdcAmount || !treasuryAddress}>
              {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deposit"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">1 USDC = {CREDITS_PER_USDC} credits, credited automatically once your transfer confirms on-chain.</p>
          {previewCredits !== null && (
            <p className="text-xs text-muted-foreground">
              You&apos;ll receive at least{" "}
              <span className="text-primary font-semibold">{previewCredits.toLocaleString()} credits</span> (plus any
              MDLN bonus, applied automatically).
            </p>
          )}
          {credited !== null && (
            <p className="text-xs text-primary flex items-center gap-1">
              <Zap className="w-3 h-3" />+{credited.toLocaleString()} credits added.
            </p>
          )}
          {pendingTx && credited === null && (
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span>Transfer sent. If your balance hasn&apos;t updated, confirm once it&apos;s on-chain:</span>
              <Button size="sm" variant="secondary" className="h-7" onClick={() => fundCredit(pendingTx)}>
                Confirm credit
              </Button>
              <a
                href={`${EXPLORER_URL}/tx/${pendingTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline flex items-center gap-1"
              >
                View tx <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!account && <p className="text-xs text-muted-foreground">Connect your wallet above to add credits.</p>}
          {!treasuryAddress && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Deposits aren&apos;t live yet — check back soon, or reach out if you need credits in the meantime.
            </p>
          )}
        </div>
      </div>

      {payments.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Payment history</h3>
          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Zap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="text-foreground">+{p.creditedAmount.toLocaleString()} credits</p>
                    <p className="text-xs text-muted-foreground">
                      ${(Number(p.amountAtomic) / 1_000_000).toFixed(2)} USDC
                      {p.mdlnMultiplier > 1 ? ` · ${p.mdlnMultiplier}× MDLN` : ""}
                    </p>
                  </div>
                </div>
                <a
                  href={`${EXPLORER_URL}/tx/${p.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
                >
                  {new Date(p.createdAt).toLocaleDateString()}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
