"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RowTone } from "@/lib/settings/rows";
import { accountStatus, type StatusInput } from "@/lib/settings/status";

const TEXT: Record<RowTone, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warn: "text-yellow-700 dark:text-yellow-400",
  muted: "text-muted-foreground",
};

const DOT: Record<RowTone, string> = {
  ok: "bg-emerald-500",
  warn: "bg-yellow-500",
  muted: "bg-muted-foreground/50",
};

export function AccountStatus(props: StatusInput) {
  const { headline, lines } = accountStatus(props);

  const headlineBody = headline ? (
    <span className="flex items-center gap-2">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[headline.tone])} />
      <span className="text-sm font-medium text-foreground">{headline.text}</span>
    </span>
  ) : (
    <span className="text-sm text-muted-foreground">Checking your account…</span>
  );

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Account status</p>
        <div className="mt-2">
          {headline?.href ? (
            <Link href={headline.href} className="hover:underline">
              {headlineBody}
            </Link>
          ) : (
            headlineBody
          )}
        </div>
      </div>

      <dl className="divide-y divide-border/60 border-t border-border/60">
        {lines.map((line) => (
          <div key={line.id} className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-xs text-muted-foreground">{line.label}</dt>
            <dd className="min-w-0 text-right text-sm text-foreground">
              {line.value === null ? (
                <span className="text-muted-foreground">…</span>
              ) : (
                <>
                  <span className="break-all">{line.value}</span>
                  {line.note ? <span className={cn("ml-1.5 text-xs", TEXT[line.note.tone])}>· {line.note.text}</span> : null}
                  {line.action ? (
                    <Link href={line.action.href} className="ml-2 text-xs font-medium text-primary hover:underline">
                      {line.action.label} ›
                    </Link>
                  ) : null}
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
