"use client";

import type { CollectionServiceId } from "@medialane/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/launchpad/form-fields";
import { ArtworkDrop } from "./artwork-drop";
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
    | "mode"
    | "setMode"
    | "name"
    | "setName"
    | "symbol"
    | "setSymbol"
    | "description"
    | "setDescription"
    | "externalLink"
    | "setExternalLink"
    | "linkProblem"
    | "cover"
    | "pick"
    | "pickedAddress"
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
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <ArtworkDrop
              label="Collection image"
              preview={group.cover.preview}
              onChoose={group.cover.choose}
              disabled={disabled}
              className="rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/50"
              imageClassName="rounded-[10px]"
            />
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Field label={words.nameLabel}>
                <Input value={group.name} onChange={(e) => group.setName(e.target.value)} placeholder={words.namePlaceholder} className={inputClassName} disabled={disabled} />
              </Field>
              <Field label="Short code">
                <Input value={group.symbol} onChange={(e) => group.setSymbol(e.target.value)} placeholder={words.symbolPlaceholder} className={inputClassName} disabled={disabled} />
              </Field>
            </div>
          </div>
          {group.cover.error ? <p className="text-sm text-destructive">{group.cover.error}</p> : null}
          <Field label="Description (optional)">
            <Textarea
              value={group.description}
              onChange={(e) => group.setDescription(e.target.value)}
              placeholder="What this collection holds"
              rows={3}
              maxLength={500}
              disabled={disabled}
            />
          </Field>
          <Field label="External link (optional)">
            <Input
              type="url"
              value={group.externalLink}
              onChange={(e) => group.setExternalLink(e.target.value)}
              placeholder="https://yourwebsite.com"
              className={inputClassName}
              disabled={disabled}
            />
            {group.linkProblem ? (
              <p className="text-xs text-destructive">{group.linkProblem}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Defaults to your Medialane account page.</p>
            )}
          </Field>
        </div>
      )}
    </section>
  );
}
