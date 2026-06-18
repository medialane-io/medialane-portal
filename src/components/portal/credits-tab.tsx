"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAccount } from "@starknet-react/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Coins, Zap, ExternalLink, Loader2 } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { CREDITS_PER_USDC } from "@/src/lib/constants";

// Circle-native USDC on Starknet — must match the backend x402 settlement asset.
const USDC_CONTRACT = "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";

interface Props {
  address: string;
  mdln_tier: number;
}

interface MeData {
  data?: { creditBalance?: number };
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
interface HistoryData {
  data?: Payment[];
}

export function CreditsTab({ address }: Props) {
  const { account } = useAccount();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const [credited, setCredited] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Balance + history now come from the backend (the x402 credit owner), proxied
  // through /api/portal/* which attaches the tenant key.
  const { data: meData, mutate: mutateMe } = useSWR<MeData>(`/api/portal/me?address=${address}`, portalFetcher);
  const { data: historyData, mutate: mutateHistory } = useSWR<HistoryData>(
    `/api/portal/credits/history?address=${address}`,
    portalFetcher,
  );

  // The Creator's Fund treasury on Starknet (x402 settles here). Chain-prefixed
  // for multichain readiness (NEXT_PUBLIC_BASE_X402_TREASURY etc. later).
  const treasuryAddress = process.env.NEXT_PUBLIC_STARKNET_X402_TREASURY ?? "";
  const balance = meData?.data?.creditBalance ?? 0;
  const payments = historyData?.data ?? [];
  const parsedUsdc = parseFloat(usdcAmount);
  const previewCredits =
    !isNaN(parsedUsdc) && parsedUsdc > 0 ? Math.floor(parsedUsdc * CREDITS_PER_USDC) : null;

  // Submit a (finalized) USDC transfer tx to the backend, which verifies it
  // on-chain and credits the tenant. Safe to retry — the backend dedups on txHash.
  async function fundCredit(txHash: string) {
    setError(null);
    const res = await fetch(`/api/portal/credits/fund?address=${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: { credited: number }; error?: string };
    if (!res.ok) {
      // Most common: the transfer isn't finalized yet — keep the tx for retry.
      setError(json.error ?? "Could not verify the payment yet. Try “Confirm credit” again in a moment.");
      return;
    }
    setCredited(json.data?.credited ?? 0);
    setPendingTx(null);
    mutateMe();
    mutateHistory();
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
      const amount = BigInt(Math.round(usdc * 1_000_000)); // USDC has 6 decimals
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
      // Attempt to credit immediately; if the tx isn't finalized yet the user
      // can retry via the Confirm button.
      await fundCredit(txHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            API Credits
          </CardTitle>
          <CardDescription>1 credit = 1 API request · 1 USDC = {CREDITS_PER_USDC} credits · pay as you go</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
            <p className="text-3xl font-bold text-foreground">{balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">credits remaining</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Add Credits (USDC on Starknet)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="10"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button onClick={handleDeposit} disabled={depositing || !account || !usdcAmount || !treasuryAddress}>
                {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deposit"}
              </Button>
            </div>
            {previewCredits !== null && (
              <p className="text-xs text-muted-foreground">
                You&apos;ll receive at least{" "}
                <span className="text-primary font-semibold">{previewCredits.toLocaleString()} credits</span> (plus any
                MDLN bonus, applied automatically).
              </p>
            )}
            {credited !== null && (
              <p className="text-xs text-green-400 flex items-center gap-1">
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
                  href={`https://starkscan.co/tx/${pendingTx}`}
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
              <p className="text-xs text-muted-foreground">Deposits are not yet enabled — treasury not configured.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Card className="border-white/10 bg-background/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-white">+{p.creditedAmount.toLocaleString()} credits</p>
                    <p className="text-xs text-muted-foreground">
                      ${(Number(p.amountAtomic) / 1_000_000).toFixed(2)} USDC
                      {p.mdlnMultiplier > 1 ? ` · ${p.mdlnMultiplier}× MDLN` : ""}
                    </p>
                  </div>
                  <a
                    href={`https://starkscan.co/tx/${p.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                  >
                    {new Date(p.createdAt).toLocaleDateString()}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
