"use client";

import type { CollectionServiceId } from "@medialane/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/launchpad/form-fields";
import { CollectionPicker, type CollectionOption } from "./collection-picker";
import type { useGroupChoice } from "@/hooks/use-group-choice";

export interface GroupWords {
  existing: string;
  fresh: string;
  nameLabel: string;
  namePlaceholder: string;
  symbolPlaceholder: string;
}

export function GroupSection({
  heading,
  words,
  group,
  serviceId,
  owner,
  disabled,
  inputClassName,
  headingClassName = "font-semibold",
}: {
  heading?: string;
  words: GroupWords;
  group: Pick<
    ReturnType<typeof useGroupChoice<unknown, CollectionOption>>,
    "mode" | "setMode" | "name" | "setName" | "symbol" | "setSymbol" | "pick" | "pickedAddress"
  >;
  serviceId: CollectionServiceId;
  owner: string;
  disabled: boolean;
  inputClassName?: string;
  headingClassName?: string;
}) {
  return (
    <section className="space-y-4">
      {heading ? <h2 className={headingClassName}>{heading}</h2> : null}
      <div className="flex gap-2">
        <Button variant={group.mode === "existing" ? "default" : "outline"} size="sm" onClick={() => group.setMode("existing")} disabled={disabled}>
          {words.existing}
        </Button>
        <Button variant={group.mode === "new" ? "default" : "outline"} size="sm" onClick={() => group.setMode("new")} disabled={disabled}>
          {words.fresh}
        </Button>
      </div>
      {group.mode === "existing" ? (
        <CollectionPicker
          hideLabel={Boolean(heading)}
          serviceId={serviceId}
          owner={owner}
          value={group.pickedAddress}
          onChange={group.pick}
          disabled={disabled}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={words.nameLabel}>
            <Input value={group.name} onChange={(e) => group.setName(e.target.value)} placeholder={words.namePlaceholder} className={inputClassName} disabled={disabled} />
          </Field>
          <Field label="Short code">
            <Input value={group.symbol} onChange={(e) => group.setSymbol(e.target.value)} placeholder={words.symbolPlaceholder} className={inputClassName} disabled={disabled} />
          </Field>
        </div>
      )}
    </section>
  );
}
