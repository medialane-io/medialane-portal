"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { Button } from "@/src/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function WalletConnect({ redirectTo = "/account" }: { redirectTo?: string }) {
  const { address, account, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!address || !account) return;
    setSigning(true);
    setError(null);

    try {
      const challengeRes = await fetch(`/api/auth/challenge?address=${address}`);
      const { nonce, typedData } = await challengeRes.json();

      const signature = await account.signMessage(typedData);
      const sigArray = Array.isArray(signature)
        ? signature.map((s) => s.toString())
        : [(signature as { r: bigint; s: bigint }).r.toString(), (signature as { r: bigint; s: bigint }).s.toString()];

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, nonce, signature: sigArray }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error ?? "Verification failed");
      }

      await fetch("/api/portal/provision", { method: "POST" });

      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSigning(false);
    }
  }

  if (status === "disconnected") {
    return (
      <div className="space-y-3">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            variant="outline"
            className="w-full border-white/10 hover:bg-white/5 justify-start gap-3"
            onClick={() => connect({ connector })}
          >
            <Wallet className="w-4 h-4" />
            Connect {connector.name}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground text-center truncate">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </p>
      <Button className="w-full" onClick={handleSignIn} disabled={signing}>
        {signing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing…</>
        ) : (
          <><Wallet className="w-4 h-4 mr-2" />Sign in to Medialane</>
        )}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => disconnect()}>
        Use a different wallet
      </Button>
    </div>
  );
}
