"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSecurityStatus } from "@/hooks/use-security-status";
import { useWalletNativeSession } from "@/hooks/use-wallet-native-session";
import { accountStatus } from "@/lib/settings/status";

export function SecuritySummary() {
  const { address } = useWalletNativeSession();
  const { devices, recovery } = useSecurityStatus(address);
  const lines = accountStatus({ address, email: null, walletDeployed: null, devices, recovery }).lines.filter(
    (line) => line.id === "devices" || line.id === "recovery",
  );

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Security</h2>
        <Link href="/settings" className="text-sm font-medium text-primary hover:underline">
          Manage
        </Link>
      </div>
      <dl className="mt-3 divide-y divide-border/40">
        {lines.map((line) => (
          <div key={line.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">{line.label}</dt>
            <dd className={cn("text-right", line.action ? "text-yellow-700 dark:text-yellow-400" : "text-foreground")}>
              {line.value ?? "…"}
              {line.action ? (
                <Link href={line.action.href} className="ml-2 text-xs font-medium text-primary hover:underline">
                  {line.action.label} ›
                </Link>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
