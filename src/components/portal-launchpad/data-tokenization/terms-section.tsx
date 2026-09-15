"use client";

import { useState } from "react";
import { CollapsibleSection } from "@medialane/ui";
import { AI_POLICIES, GEOGRAPHIC_SCOPES, LICENSE_TYPES } from "@medialane/ui/data/ip";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Choice, Field } from "@/components/launchpad/form-fields";
import { withPreset, type Terms } from "@/lib/data-tokenization/spec";

export function TermsSection({
  terms,
  onChange,
  disabled,
}: {
  terms: Terms;
  onChange: (update: (terms: Terms) => Terms) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <CollapsibleSection
      open={open}
      onOpenChange={setOpen}
      icon={<ShieldCheck className="h-4 w-4 text-primary" />}
      label="Licensing terms"
      hint={`${terms.licenseType} · AI ${terms.aiPolicy.toLowerCase()}`}
    >
      <p className="text-xs text-muted-foreground">These travel with every item in the catalog.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="License">
          <Choice
            value={terms.licenseType}
            options={LICENSE_TYPES.map((l) => ({ value: l.value, label: l.label }))}
            onChange={(v) => onChange((t) => withPreset(t, v))}
            disabled={disabled}
          />
        </Field>
        <Field label="AI and data mining">
          <Choice
            value={terms.aiPolicy}
            options={AI_POLICIES}
            onChange={(v) => onChange((t) => ({ ...t, aiPolicy: v as Terms["aiPolicy"] }))}
            disabled={disabled}
          />
        </Field>
        <Field label="Territory">
          <Choice
            value={terms.territory}
            options={GEOGRAPHIC_SCOPES}
            onChange={(v) => onChange((t) => ({ ...t, territory: v }))}
            disabled={disabled}
          />
        </Field>
        <Field label="Royalty %">
          <Input
            type="number"
            min={0}
            max={50}
            value={terms.royalty}
            onChange={(e) => {
              const royalty = Math.min(50, Math.max(0, Number(e.target.value) || 0));
              onChange((t) => ({ ...t, royalty }));
            }}
            disabled={disabled}
          />
        </Field>
      </div>
    </CollapsibleSection>
  );
}
