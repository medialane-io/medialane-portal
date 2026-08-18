"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAccount } from "@starknet-react/core";
import { Button } from "@/src/components/ui/button";
import { Coins, Zap, ExternalLink, Info, KeyRound } from "lucide-react";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { EXPLORER_URL } from "@/src/lib/constants";
import { BuyCreditsDialog } from "@/src/components/portal/buy-credits-dialog";

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
  const [depositOpen, setDepositOpen] = useState(false);

  const { data: creditsData, mutate: mutateCredits } = useSWR<CreditsData>(
    `/api/portal/credits?address=${address}`,
    portalFetcher,
  );

  const treasuryAddress = process.env.NEXT_PUBLIC_STARKNET_X402_TREASURY ?? "";
  const balance = creditsData?.data?.balance ?? 0;
  const payments = creditsData?.data?.history ?? [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-rose/10 text-brand-rose">
            <Coins className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">API Credits</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Every API call is billed per action from this balance, pay-as-you-go. Top up with USDC on Starknet whenever you&apos;re running low.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-brand-rose/10 p-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
          <p className="text-5xl sm:text-6xl font-bold text-foreground tabular-nums">{balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">credits remaining</p>
          <Button
            variant="gradient-fill"
            onClick={() => setDepositOpen(true)}
            disabled={!account || !treasuryAddress}
          >
            <Coins className="w-4 h-4 mr-1.5" />
            Add credits
          </Button>
          {!account && <p className="text-xs text-muted-foreground mt-3">Connect your wallet above to add credits.</p>}
          {account && !treasuryAddress && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-3">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Deposits are launching soon. Check back, or reach out if you need credits in the meantime.
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground mt-4">
          <KeyRound className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-rose" />
          This balance is shared across every API key on your account, so it stays intact if you revoke or lose a key.
        </div>
      </div>

      {payments.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Payment history</h3>
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm gap-4 rounded-xl bg-muted/30 p-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-rose/10 text-brand-rose">
                    <Zap className="w-3.5 h-3.5" />
                  </span>
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

      <BuyCreditsDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        address={address}
        treasuryAddress={treasuryAddress}
        onCredited={() => mutateCredits()}
      />
    </div>
  );
}
