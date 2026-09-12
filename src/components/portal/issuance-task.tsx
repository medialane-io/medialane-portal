"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useAccount } from "@starknet-react/core";
import { ServiceFormShell, ClaimRail, MedialaneCollectionCard, CollapsibleSection } from "@medialane/ui";
import { buildAssetMetadata } from "@medialane/sdk";
import {
  ArrowLeft,
  Database,
  FileCheck2,
  Loader2,
  Scale,
  ShieldCheck,
  Upload,
  Users,
  Layers,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { CollectionPicker } from "@/src/components/portal/collection-picker";
import { TaskDialog } from "@/src/components/portal/task-dialog";
import {
  provisionOne,
  uploadImage,
  pinMetadata,
  fetchMintCalls,
  executeSponsored,
} from "@/src/lib/issue";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { quoteIssuance, formatUsd, type PricingTable } from "@/src/lib/issuance-cost";
import { CREDITS_PER_USDC } from "@/src/lib/constants";
import { issuedSummary, SERVICE_PAUSED, type TaskPhase } from "@/src/lib/task-progress";
import {
  parseRecipients,
  invalidRecipients,
  PROVISIONING_SECRET_MESSAGE,
} from "@/src/lib/provisioning";
import {
  issuanceSchema,
  imageRejectionReason,
  ISSUANCE_DEFAULTS,
  LICENSE_PRESETS,
  AI_POLICIES,
  TERRITORIES,
  IP_TYPES,
  termsSummary,
  type IssuanceValues,
} from "@/src/lib/issuance-form";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function IssuanceTask({ serviceId, address }: { serviceId: string; address: string }) {
  const { account } = useAccount();

  const [values, setValues] = useState<IssuanceValues>(ISSUANCE_DEFAULTS);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [servicePaused, setServicePaused] = useState(false);
  const [issued, setIssued] = useState<number | null>(null);
  const busy = phase === "running";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [termsOpen, setTermsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const set = <K extends keyof IssuanceValues>(key: K, value: IssuanceValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const recipients = parseRecipients(values.recipients);
  const invalid = invalidRecipients(recipients);

  const { data: pricingData } = useSWR<{ pricing?: PricingTable }>(
    "/api/portal/pricing",
    portalFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const quote = quoteIssuance(
    pricingData?.pricing,
    { recipients: recipients.length, service: serviceId },
    CREDITS_PER_USDC,
  );

  function chooseImage(file: File | undefined) {
    if (!file) return;
    const reason = imageRejectionReason(file);
    setImageError(reason);
    if (reason) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function run() {
    if (!account) return;

    const parsed = issuanceSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setFieldErrors(errs);
      return;
    }
    if (invalid.length > 0) {
      setFieldErrors({ recipients: `Check these: ${invalid.map((r) => r.value).join(", ")}` });
      return;
    }
    setFieldErrors({});
    setPhase("running");
    setError(null);
    setServicePaused(false);
    setIssued(null);

    try {
      setProgress("Confirm in your wallet to begin");
      const signature = await account.signMessage({
        types: {
          StarknetDomain: [
            { name: "name", type: "shortstring" },
            { name: "version", type: "shortstring" },
            { name: "chainId", type: "shortstring" },
            { name: "revision", type: "shortstring" },
          ],
          Provisioning: [{ name: "purpose", type: "shortstring" }],
        },
        primaryType: "Provisioning",
        domain: { name: "Medialane", version: "1", chainId: "SN_MAIN", revision: "1" },
        message: { purpose: PROVISIONING_SECRET_MESSAGE.slice(0, 31) },
      });

      const secret = new TextEncoder().encode(
        Array.isArray(signature) ? signature.join("") : String(signature),
      );

      for (const [index, recipient] of recipients.entries()) {
        setProgress(`Recipient ${index + 1} of ${recipients.length}`);
        await provisionOne(secret, recipient, address);
      }

      let imageUri: string | null = null;
      if (imageFile) {
        setProgress("Uploading the cover image");
        imageUri = await uploadImage(imageFile);
      }

      setProgress("Recording the licensing terms");
      const metadata = buildAssetMetadata({
        name: values.name,
        description: values.description,
        externalUrl: values.externalUrl || null,
        imageUri,
        creator: address,
        ipType: values.ipType,
        licenseType: values.licenseType,
        commercialUse: values.commercialUse,
        derivatives: values.derivatives,
        attribution: values.attribution,
        geographicScope: values.geographicScope,
        aiPolicy: values.aiPolicy,
        royalty: String(values.royalty),
      });
      const tokenUri = await pinMetadata(metadata);

      setProgress("Preparing the issuance");
      const batches = await fetchMintCalls({
        service: serviceId,
        owner: address,
        recipients: recipients.map((r) => r.value),
        tokenUri,
        collectionId: values.collectionId,
      });

      for (const [index, batch] of batches.entries()) {
        setProgress(`Confirm batch ${index + 1} of ${batches.length} in your wallet`);
        const tx = await executeSponsored(
          { address, signMessage: (td) => account.signMessage(td) },
          batch,
        );
        await account.waitForTransaction(tx);
      }

      setIssued(recipients.length);
      setValues((v) => ({ ...v, recipients: "" }));
      setPhase("success");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === SERVICE_PAUSED) {
        setServicePaused(true);
      } else {
        setError(message || "Could not finish issuing.");
      }
      setPhase("error");
    } finally {
      setProgress(null);
    }
  }

  return (
    <>
      <TaskDialog
        open={phase !== "idle"}
        title="Issuing"
        phase={phase}
        detail={progress}
        error={error}
        servicePaused={servicePaused}
        successLine={issued !== null ? issuedSummary(issued) : undefined}
        onClose={() => setPhase("idle")}
      />
    <ServiceFormShell
      icon={<Database className="h-4 w-4 text-white" />}
      title="Data Tokenization"
      subtitle="Establish verifiable ownership of your data, with licensing terms that hold up wherever it travels."
      backSlot={
        <Link
          href="/launchpad"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Launchpad
        </Link>
      }
      aside={
        <>
          <MedialaneCollectionCard
            image={imagePreview}
            name={values.name || "Untitled"}
            collection="Data Tokenization"
            creator={short(address)}
          />
          <ClaimRail
            included={[
              {
                icon: FileCheck2,
                title: "Proof of ownership",
                desc: "Authorship and date are recorded permanently.",
              },
              {
                icon: Scale,
                title: "Terms that travel",
                desc: "Licensing is carried by the asset wherever it goes.",
              },
              {
                icon: Users,
                title: "Held by the right people",
                desc: "Each recipient owns their copy outright.",
              },
            ]}
            steps={[
              "Describe what you are tokenizing",
              "Set the terms it can be used under",
              "Add the people who receive it",
            ]}
            trustIcon={ShieldCheck}
            trustLead="You stay in control."
            trust="Medialane never takes custody, and the terms you set are recorded with the asset."
          />
        </>
      }
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <CollectionPicker
            serviceId={serviceId}
            owner={address}
            value={values.collectionId}
            onChange={(v) => set("collectionId", v)}
            disabled={busy}
          />
          {fieldErrors.collectionId ? (
            <p className="text-sm text-destructive">{fieldErrors.collectionId}</p>
          ) : null}

          <div className="space-y-2">
            <Label>Cover image</Label>
            <label
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer transition-colors hover:border-primary/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                chooseImage(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={(e) => chooseImage(e.target.files?.[0])}
              />
              {imagePreview ? (
                <img src={imagePreview} alt="" className="max-h-40 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload (JPG, PNG, GIF, SVG, WebP · max 10 MB)
                  </span>
                </>
              )}
            </label>
            {imageError ? <p className="text-sm text-destructive">{imageError}</p> : null}
          </div>

          <Field label="Name" required error={fieldErrors.name}>
            <Input
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Q3 research dataset"
              disabled={busy}
            />
          </Field>


          <Field label="Description" error={fieldErrors.description}>
            <Textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What this covers, how it was produced, and anything a licensee should know…"
              rows={4}
              disabled={busy}
            />
          </Field>

        </section>

        <CollapsibleSection
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          icon={<Layers className="h-4 w-4 text-primary" />}
          label="Type & details"
          hint="Optional"
        >
          <p className="text-xs text-muted-foreground">
            Say what kind of material this is, and link to somewhere it can be read about.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" error={fieldErrors.ipType}>
              <Choice
                value={values.ipType}
                options={IP_TYPES}
                onChange={(v) => set("ipType", v as IssuanceValues["ipType"])}
                disabled={busy}
              />
            </Field>
            <Field label="External link" error={fieldErrors.externalUrl}>
              <Input
                value={values.externalUrl}
                onChange={(e) => set("externalUrl", e.target.value)}
                placeholder="https://…"
                disabled={busy}
              />
            </Field>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          open={termsOpen}
          onOpenChange={setTermsOpen}
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          label="Licensing terms"
          hint={termsSummary(values)}
        >
          <p className="text-xs text-muted-foreground">
            These travel with the asset and are recorded alongside it as proof of the terms you set.
          </p>

          <Field label="AI and data mining" error={fieldErrors.aiPolicy}>
            <Choice
              value={values.aiPolicy}
              options={AI_POLICIES}
              onChange={(v) => set("aiPolicy", v as IssuanceValues["aiPolicy"])}
              disabled={busy}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="License" error={fieldErrors.licenseType}>
              <Choice
                value={values.licenseType}
                options={LICENSE_PRESETS}
                onChange={(v) => set("licenseType", v as IssuanceValues["licenseType"])}
                disabled={busy}
              />
            </Field>
            <Field label="Commercial use" error={fieldErrors.commercialUse}>
              <Choice
                value={values.commercialUse}
                options={["Yes", "No"] as const}
                onChange={(v) => set("commercialUse", v as IssuanceValues["commercialUse"])}
                disabled={busy}
              />
            </Field>
            <Field label="Derivatives" error={fieldErrors.derivatives}>
              <Choice
                value={values.derivatives}
                options={["Allowed", "Not Allowed", "Share-Alike"] as const}
                onChange={(v) => set("derivatives", v as IssuanceValues["derivatives"])}
                disabled={busy}
              />
            </Field>
            <Field label="Attribution" error={fieldErrors.attribution}>
              <Choice
                value={values.attribution}
                options={["Required", "Not Required"] as const}
                onChange={(v) => set("attribution", v as IssuanceValues["attribution"])}
                disabled={busy}
              />
            </Field>
            <Field label="Territory" error={fieldErrors.geographicScope}>
              <Choice
                value={values.geographicScope}
                options={TERRITORIES}
                onChange={(v) => set("geographicScope", v as IssuanceValues["geographicScope"])}
                disabled={busy}
              />
            </Field>
            <Field label="Royalty %" error={fieldErrors.royalty}>
              <Input
                type="number"
                min={0}
                max={50}
                value={values.royalty}
                onChange={(e) => set("royalty", Number(e.target.value) as IssuanceValues["royalty"])}
                disabled={busy}
              />
            </Field>
          </div>
        </CollapsibleSection>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Recipients</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One email per line. Everyone receives their own copy.
            </p>
          </div>

          <Field label="Recipients" required error={fieldErrors.recipients}>
            <Textarea
              value={values.recipients}
              onChange={(e) => set("recipients", e.target.value)}
              placeholder={"one@example.com\ntwo@example.com"}
              rows={8}
              disabled={busy}
              className="font-mono text-sm"
            />
          </Field>

          {recipients.length > 0 && invalid.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {recipients.length} {recipients.length === 1 ? "recipient" : "recipients"}
            </p>
          ) : null}
        </section>

        {quote.total > 0 ? (
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-medium">This run costs</p>
              <p className="text-xl font-bold tabular-nums">{formatUsd(quote.total)}</p>
            </div>

            <ul className="space-y-1">
              {quote.lines.map((line) => (
                <li key={line.label} className="flex justify-between gap-4 text-xs text-muted-foreground">
                  <span>{line.label}</span>
                  <span className="tabular-nums">{formatUsd(line.usd)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button onClick={run} disabled={busy || !account} size="lg">
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working
              </>
            ) : (
              "Issue"
            )}
          </Button>
          {!account ? (
            <span className="text-sm text-muted-foreground">Connect your wallet to issue.</span>
          ) : null}
        </div>
      </div>
    </ServiceFormShell>
    </>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? " *" : null}
      </Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function Choice({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
