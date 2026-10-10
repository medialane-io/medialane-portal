"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { useSession } from "@/hooks/use-session";

export function useMissingKey(): boolean {
  const { hasWallet } = useWalletNativeSession();
  const { session } = useSession();
  return !hasWallet && Boolean(session?.walletAddress);
}

export function MissingKeyNotice({ returnTo }: { returnTo: string }) {
  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <p className="max-w-sm text-sm text-muted-foreground">
        This device doesn&apos;t hold your account&apos;s key yet. Approve it from a device you already use, or
        restore the key with your recovery key.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href={`/link-device?redirect_url=${encodeURIComponent(returnTo)}`}>Approve this device</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/recover">Use a recovery key</Link>
        </Button>
      </div>
    </div>
  );
}
