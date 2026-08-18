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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            API Credits
          </CardTitle>
          <CardDescription>Billed per API call, priced by action · 1 USDC = {CREDITS_PER_USDC} credits · pay as you go</CardDescription>
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
              <p className="text-xs text-muted-foreground">Deposits are not yet enabled — treasury not configured.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-foreground">+{p.creditedAmount.toLocaleString()} credits</p>
                    <p className="text-xs text-muted-foreground">
                      ${(Number(p.amountAtomic) / 1_000_000).toFixed(2)} USDC
                      {p.mdlnMultiplier > 1 ? ` · ${p.mdlnMultiplier}× MDLN` : ""}
                    </p>
                  </div>
                  <a
                    href={`${EXPLORER_URL}/tx/${p.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
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
