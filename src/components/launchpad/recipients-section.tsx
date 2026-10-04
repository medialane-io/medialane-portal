"use client";

import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { guestRows, repeatsIn } from "@/lib/launchpad/ticketing/event";

export function RecipientsSection({
  heading,
  noun,
  value,
  onChange,
  disabled,
  headingClassName = "font-semibold",
  listClassName = "divide-y divide-border",
}: {
  heading: string;
  noun: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  headingClassName?: string;
  listClassName?: string;
}) {
  const rows = guestRows(value);
  const repeats = repeatsIn(value);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className={headingClassName}>{heading}</h2>
        <p className="text-muted-foreground">
          {rows.length.toLocaleString()} {rows.length === 1 ? noun : `${noun}s`}
          {repeats > 0 ? ` · ${repeats} repeated` : ""}
        </p>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Paste a list, or type one address per line\nana@company.com\nbruno@company.com"}
        rows={6}
        className="font-mono"
        disabled={disabled}
      />

      {rows.length > 0 ? (
        <ul className={listClassName}>
          {rows.map((row) => (
            <li key={row.value} className="flex items-center justify-between gap-4 py-2.5">
              <span className="truncate">{row.value}</span>
              {row.valid ? <Check className="h-4 w-4 shrink-0 text-primary" /> : <span className="shrink-0 text-destructive">not an email</span>}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
