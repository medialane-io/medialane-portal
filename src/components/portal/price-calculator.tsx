"use client";

import { useState } from "react";
import useSWR from "swr";
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
import { quoteIssuance, formatUsd, type PricingTable } from "@/src/lib/issuance-cost";
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
  const recipients = Math.max(0, Math.floor(Number(count) || 0));
  const quote = quoteIssuance(pricingData?.pricing, { recipients, service: serviceId }, CREDITS_PER_USDC);

  return (
    <section className="rounded-2xl bg-foreground/[0.04] p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">What a run costs</h2>
        <p className="text-muted-foreground">
          You pay for the wallets and the assets. Work out a run before you start one.
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

      {quote.total > 0 ? (
        <>
          <p className="text-3xl font-bold tabular-nums">{formatUsd(quote.total)}</p>

          <ul className="space-y-1">
            {quote.lines.map((line) => (
              <li key={line.label} className="flex justify-between gap-4 text-muted-foreground">
                <span>{line.label}</span>
                <span className="tabular-nums">{formatUsd(line.usd)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-muted-foreground">Enter how many people will receive one.</p>
      )}
    </section>
  );
}
