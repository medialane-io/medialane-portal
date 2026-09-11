"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import {
  estimateIssuance,
  shortfall,
  dollarsFor,
  formatDollars,
  type PricingTable,
} from "@/src/lib/issuance-cost";
import { CREDITS_PER_USDC } from "@/src/lib/constants";
import { launchpadServices } from "@/src/lib/services";

export function PriceCalculator() {
  const services = launchpadServices();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [count, setCount] = useState("100");

  const { data: pricingData } = useSWR<{ pricing?: PricingTable }>("/api/portal/pricing", portalFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const { data: creditsData } = useSWR<{ data?: { balance?: number } }>(
    "/api/portal/credits",
    portalFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const recipients = Math.max(0, Math.floor(Number(count) || 0));
  const balance = creditsData?.data?.balance;
  const estimate = estimateIssuance(pricingData?.pricing, {
    recipients,
    hasImage: true,
    service: serviceId,
  });
  const missing = shortfall(estimate.total, balance);
  const dollars = dollarsFor(estimate.total, CREDITS_PER_USDC);

  return (
    <section className="rounded-2xl bg-foreground/[0.04] p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">What a run costs</h2>
        <p className="text-muted-foreground">
          Credits cover every step, gas included. Work out a run before you start one.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Service</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger className="h-12 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Recipients</Label>
          <Input
            type="number"
            min={0}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="h-12 bg-background"
          />
        </div>
      </div>

      {estimate.total > 0 ? (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-3xl font-bold tabular-nums">
              {estimate.total.toLocaleString()}
              <span className="ml-1.5 text-base font-medium text-muted-foreground">credits</span>
            </p>
            <p className="text-muted-foreground">about {formatDollars(dollars)}</p>
          </div>

          <ul className="space-y-1">
            {estimate.lines.map((line) => (
              <li key={line.label} className="flex justify-between gap-4 text-muted-foreground">
                <span>{line.label}</span>
                <span className="tabular-nums">{line.credits.toLocaleString()}</span>
              </li>
            ))}
          </ul>

          {balance !== undefined ? (
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <p className="text-muted-foreground">
                You have <span className="font-medium text-foreground">{balance.toLocaleString()}</span>
              </p>
              {missing > 0 ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/account/credits">Add {missing.toLocaleString()} more</Link>
                </Button>
              ) : (
                <p className="text-muted-foreground">Enough for this run</p>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground">Enter how many people will receive one.</p>
      )}
    </section>
  );
}
