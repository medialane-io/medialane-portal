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

        <div className="max-w-md">
          <Button
            variant="gradient-fill"
            onClick={() => setDepositOpen(true)}
            disabled={!account || !treasuryAddress}
          >
            <Coins className="w-4 h-4 mr-1.5" />
            Add credits
          </Button>
          {!account && <p className="text-xs text-muted-foreground mt-2">Connect your wallet above to add credits.</p>}
          {account && !treasuryAddress && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2">
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
