"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAccount } from "@starknet-react/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Coins, Zap, ExternalLink, Loader2 } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";

const USDC_CONTRACT = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
const MDLN_TIER_LABELS = ["No MDLN bonus", "500+ MDLN · 1.2×", "2,000+ MDLN · 1.5×", "5,000+ MDLN · 2.0×"];
const MULTIPLIERS = [1.0, 1.2, 1.5, 2.0];
const CREDITS_PER_USDC = 100;

interface Props {
  address: string;
  mdln_tier: number;
}

interface BalanceData { balance: number }
interface HistoryData {
  deposits: Array<{
    id: string;
    usdc_amount: number;
    credited: number;
    multiplier: string;
    tx_hash: string;
    created_at: string;
  }>;
}

export function CreditsTab({ address, mdln_tier }: Props) {
  const { account } = useAccount();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  const { data: balanceData, mutate } = useSWR<BalanceData>("/api/credits/balance", portalFetcher);
  const { data: historyData } = useSWR<HistoryData>("/api/credits/history", portalFetcher);

  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "";
  const balance = balanceData?.balance ?? 0;
  const multiplier = MULTIPLIERS[mdln_tier] ?? 1.0;
  const parsedUsdc = parseFloat(usdcAmount);
  const previewCredits = !isNaN(parsedUsdc) && parsedUsdc > 0
    ? Math.floor(parsedUsdc * CREDITS_PER_USDC * multiplier)
    : null;

  async function handleDeposit() {
    if (!account || !treasuryAddress) return;
    const usdc = parseFloat(usdcAmount);
    if (isNaN(usdc) || usdc <= 0) return;

    setDepositing(true);
    setDepositError(null);
    setTxHash(null);

    try {
      // USDC on Starknet has 6 decimals
      const amount = BigInt(Math.round(usdc * 1_000_000));
      const result = await account.execute([
        {
          contractAddress: USDC_CONTRACT,
          entrypoint: "transfer",
          calldata: [treasuryAddress, amount.toString(), "0"],
        },
      ]);
      setTxHash(result.transaction_hash);
      setUsdcAmount("");
      setTimeout(() => mutate(), 5000);
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setDepositing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                API Credits
              </CardTitle>
              <CardDescription>1 credit = 1 API request · 1 USDC = 100 credits</CardDescription>
            </div>
            {mdln_tier > 0 && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {MDLN_TIER_LABELS[mdln_tier]}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className="text-3xl font-bold text-foreground">{balance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">credits remaining</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Free Allowance</p>
              <p className="text-3xl font-bold text-foreground">50</p>
              <p className="text-xs text-muted-foreground">credits / month · resets 1st</p>
            </div>
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
              <Button
                onClick={handleDeposit}
                disabled={depositing || !account || !usdcAmount || !treasuryAddress}
              >
                {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deposit"}
              </Button>
            </div>
            {previewCredits !== null && (
              <p className="text-xs text-muted-foreground">
                You&apos;ll receive{" "}
                <span className="text-primary font-semibold">{previewCredits.toLocaleString()} credits</span>
                {mdln_tier > 0 && ` (${multiplier}× MDLN bonus applied)`}
              </p>
            )}
            {depositError && <p className="text-sm text-destructive">{depositError}</p>}
            {txHash && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Transaction submitted — credits appear within ~2 min.{" "}
                <a
                  href={`https://starkscan.co/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
            {!account && (
              <p className="text-xs text-muted-foreground">
                Connect your wallet above to deposit credits.
              </p>
            )}
            {!treasuryAddress && (
              <p className="text-xs text-muted-foreground">
                Deposits are not yet enabled — treasury address not configured.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {historyData?.deposits && historyData.deposits.length > 0 && (
        <Card className="border-white/10 bg-background/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historyData.deposits.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-white">+{d.credited.toLocaleString()} credits</p>
                    <p className="text-xs text-muted-foreground">
                      ${(d.usdc_amount / 100).toFixed(2)} USDC · {d.multiplier}×
                    </p>
                  </div>
                  <a
                    href={`https://starkscan.co/tx/${d.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                  >
                    {new Date(d.created_at).toLocaleDateString()}
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
