"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSecurityStatus } from "@/hooks/use-security-status";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";

const DISMISSED_KEY = "medialane.recovery.nudge-dismissed.v1";

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(): void {
  try {
    sessionStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    return;
  }
}

export function RecoveryGate({ children }: { children: ReactNode }) {
  const { address } = useWalletNativeSession();
  const { recovery } = useSecurityStatus(address);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  if (recovery !== "missing" || dismissed) return <>{children}</>;

  return (
    <section className="space-y-4 rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Set up recovery before adding credits</h2>
        <p className="text-sm text-muted-foreground">
          Your credits and API key are tied to this account&apos;s key. If you lose this device with no recovery in
          place, you lose access to both.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/settings/recovery">Save a recovery key</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/settings/devices">Add another device</Link>
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            writeDismissed();
            setDismissed(true);
          }}
        >
          Continue without recovery
        </Button>
      </div>
    </section>
  );
}
