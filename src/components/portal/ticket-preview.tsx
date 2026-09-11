"use client";

import { Ticket } from "lucide-react";

export function TicketPreview({
  artwork,
  name,
  group,
  validFrom,
  validUntil,
  supply,
}: {
  artwork: string | null;
  name: string;
  group: string | null;
  validFrom: string;
  validUntil: string;
  supply: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-foreground/[0.04]">
      <div className="relative aspect-[4/3] bg-muted">
        {artwork ? (
          <img src={artwork} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-muted-foreground">
            <Ticket className="h-10 w-10" />
          </span>
        )}
      </div>

      <div className="relative">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-background" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-background" />
        <div className="border-t border-dashed border-border" />
      </div>

      <div className="space-y-3 p-5">
        <div>
          <p className="text-lg font-bold">{name.trim() || "Untitled ticket"}</p>
          {group ? <p className="text-muted-foreground">{group}</p> : null}
        </div>

        <dl className="space-y-1">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Valid</dt>
            <dd className="text-right font-medium">{windowLabel(validFrom, validUntil)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Made</dt>
            <dd className="text-right font-medium tabular-nums">
              {supply.trim() ? Number(supply).toLocaleString() : "as many as needed"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function windowLabel(from: string, until: string): string {
  const f = from.trim() ? new Date(from) : null;
  const u = until.trim() ? new Date(until) : null;
  const day = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });

  if (f && u) return `${day(f)} – ${day(u)}`;
  if (f) return `from ${day(f)}`;
  if (u) return `until ${day(u)}`;
  return "anytime";
}
