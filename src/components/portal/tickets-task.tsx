"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useAccount } from "@starknet-react/core";
import { CollapsibleSection } from "@medialane/ui";
import { buildAssetMetadata } from "@medialane/sdk";
import { ArrowLeft, Check, Loader2, ShieldCheck, Ticket, Upload, Users } from "lucide-react";
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
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { ticketIdFromReceipt } from "@/src/lib/ticket-events";
import { parseRecipients, invalidRecipients, PROVISIONING_SECRET_MESSAGE } from "@/src/lib/provisioning";
import {
  provisionOne,
  uploadImage,
  pinMetadata,
  buildTicketType,
  fetchMintCalls,
  executeSponsored,
} from "@/src/lib/issue";
import { issuedSummary, OUT_OF_CREDITS, type TaskPhase } from "@/src/lib/task-progress";
import {
  estimateIssuance,
  shortfall,
  fixedCost,
  perRecipientCost,
  type PricingTable,
} from "@/src/lib/issuance-cost";
import { capacity, guestRows, repeatsIn, validitySentence } from "@/src/lib/ticket-event";
import {
  imageRejectionReason,
  maxSupplyFor,
  toUnixSeconds,
  validityError,
  LICENSE_PRESETS,
  AI_POLICIES,
  TERRITORIES,
} from "@/src/lib/issuance-form";

const TRANSFERABLE = ["Allowed", "Not Allowed"] as const;

export function TicketsTask({ serviceId, address }: { serviceId: string; address: string }) {
  const { account } = useAccount();

  const [group, setGroup] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [artwork, setArtwork] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [supply, setSupply] = useState("");
  const [guests, setGuests] = useState("");
  const [royalty, setRoyalty] = useState("0");

  const [termsOpen, setTermsOpen] = useState(false);
  const [licenseType, setLicenseType] = useState<string>("All Rights Reserved");
  const [aiPolicy, setAiPolicy] = useState<string>("Not Allowed");
  const [transferable, setTransferable] = useState<string>("Allowed");
  const [territory, setTerritory] = useState<string>("Worldwide");

  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const [issued, setIssued] = useState<number | null>(null);
  const busy = phase === "running";

  const recipients = parseRecipients(guests);
  const invalid = invalidRecipients(recipients);
  const windowError = validityError(validFrom, validUntil);

  const { data: pricingData } = useSWR<{ pricing?: PricingTable }>("/api/portal/pricing", portalFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const { data: creditsData } = useSWR<{ data?: { balance?: number } }>(
    "/api/portal/credits",
    portalFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const balance = creditsData?.data?.balance;
  const estimate = estimateIssuance(pricingData?.pricing, {
    recipients: recipients.length,
    hasImage: Boolean(artwork),
    service: serviceId,
  });
  const missing = shortfall(estimate.total, balance);
  const room = capacity(supply, recipients.length);
  const rows = guestRows(guests);
  const repeats = repeatsIn(guests);
  const setupCost = fixedCost(pricingData?.pricing, {
    hasImage: Boolean(artwork),
    service: serviceId,
  });
  const eachCost = perRecipientCost(pricingData?.pricing, serviceId);

  function chooseArtwork(file: File | undefined) {
    if (!file) return;
    const reason = imageRejectionReason(file);
    setArtworkError(reason);
    if (reason) return;
    setArtwork(file);
    setArtworkPreview(URL.createObjectURL(file));
  }

  const ready =
    Boolean(account) &&
    group.trim().length > 0 &&
    name.trim().length > 0 &&
    recipients.length > 0 &&
    invalid.length === 0 &&
    !windowError;

  async function run() {
    if (!account) return;
    setPhase("running");
    setError(null);
    setOutOfCredits(false);
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

      for (const [i, recipient] of recipients.entries()) {
        setProgress(`Preparing recipient ${i + 1} of ${recipients.length}`);
        await provisionOne(secret, recipient, address);
      }

      let imageUri: string | null = null;
      if (artwork) {
        setProgress("Uploading the artwork");
        imageUri = await uploadImage(artwork);
      }

      setProgress("Preparing the ticket");
      const tokenUri = await pinMetadata(
        buildAssetMetadata({
          name,
          description,
          imageUri,
          creator: address,
          ipType: "Other",
          licenseType,
          commercialUse: "No",
          derivatives: transferable === "Allowed" ? "Allowed" : "Not Allowed",
          attribution: "Required",
          geographicScope: territory,
          aiPolicy,
          royalty: String(Number(royalty) || 0),
        }),
      );

      const made = maxSupplyFor(recipients.length, supply);
      if (!made) throw new Error("Create at least as many tickets as there are recipients.");

      setProgress("Confirm the ticket in your wallet");
      const built = await buildTicketType({
        owner: address,
        collection: group,
        maxSupply: made,
        royaltyBps: Math.round((Number(royalty) || 0) * 100),
        metadataUri: tokenUri,
        startTime: toUnixSeconds(validFrom) ?? undefined,
        endTime: toUnixSeconds(validUntil) ?? undefined,
      });
      const ticketTx = await executeSponsored(
        { address, signMessage: (td) => account.signMessage(td) },
        built.calls,
      );
      const receipt = await account.waitForTransaction(ticketTx);
      const ticketId = ticketIdFromReceipt(
        (receipt as { events?: { from_address?: string; keys?: string[] }[] }).events,
        group,
      );
      if (!ticketId) throw new Error("The ticket was made but its id could not be read.");

      setProgress("Preparing to issue");
      const batches = await fetchMintCalls({
        service: serviceId,
        owner: address,
        recipients: recipients.map((r) => r.value),
        collectionContract: group,
        tokenId: ticketId,
        amount: "1",
      });

      for (const [i, batch] of batches.entries()) {
        setProgress(`Confirm batch ${i + 1} of ${batches.length} in your wallet`);
        const sent = await executeSponsored(
          { address, signMessage: (td) => account.signMessage(td) },
          batch,
        );
        await account.waitForTransaction(sent);
      }

      setIssued(recipients.length);
      setGuests("");
      setPhase("success");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === OUT_OF_CREDITS) setOutOfCredits(true);
      else setError(message || "Could not finish issuing.");
      setPhase("error");
    } finally {
      setProgress(null);
    }
  }

  return (
    <>
      <TaskDialog
        open={phase !== "idle"}
        title="Issuing tickets"
        phase={phase}
        detail={progress}
        error={error}
        outOfCredits={outOfCredits}
        successLine={issued !== null ? issuedSummary(issued) : undefined}
        onClose={() => setPhase("idle")}
      />

      <div className="mx-auto max-w-[110rem] px-4 pt-6 pb-16 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <Link
              href="/launchpad"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Launchpad
            </Link>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
                <Ticket className="h-4 w-4 text-white" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">IP Tickets</h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            {validitySentence(validFrom, validUntil)} · {room.exists.toLocaleString()} exist ·{" "}
            {room.issuingNow.toLocaleString()} going out
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-10 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="font-semibold uppercase tracking-wide text-muted-foreground">
                The ticket
              </h2>

              <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
                <label
                  className="flex h-32 w-full cursor-pointer items-center justify-center rounded-xl bg-foreground/[0.04] transition-colors hover:bg-foreground/[0.07] sm:w-32"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    chooseArtwork(e.dataTransfer.files?.[0]);
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => chooseArtwork(e.target.files?.[0])}
                  />
                  {artworkPreview ? (
                    <img src={artworkPreview} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
                      <Upload className="h-5 w-5" />
                      Artwork
                    </span>
                  )}
                </label>

                <div className="space-y-3">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="General admission"
                    className="h-11"
                    disabled={busy}
                  />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What it admits you to, when and where, and anything a holder should know…"
                    rows={3}
                    disabled={busy}
                  />
                </div>
              </div>
              {artworkError ? <p className="text-destructive">{artworkError}</p> : null}
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold uppercase tracking-wide text-muted-foreground">
                When it is valid
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>From</Label>
                  <Input
                    type="datetime-local"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="h-11"
                    disabled={busy}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Until</Label>
                  <Input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="h-11"
                    disabled={busy}
                  />
                </div>
              </div>
              {windowError ? (
                <p className="text-destructive">{windowError}</p>
              ) : (
                <p className="text-muted-foreground">
                  {validitySentence(validFrom, validUntil)}. Leave both empty and it stays valid.
                </p>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="font-semibold uppercase tracking-wide text-muted-foreground">
                How many exist
              </h2>

              <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
                <Input
                  type="number"
                  min={recipients.length || 1}
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  placeholder={recipients.length ? String(recipients.length) : "100"}
                  className="h-11"
                  disabled={busy}
                />
                {room.shortBy > 0 ? (
                  <p className="text-destructive">
                    {room.shortBy.toLocaleString()} more {room.shortBy === 1 ? "ticket" : "tickets"}{" "}
                    needed to cover the list.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {room.issuingNow.toLocaleString()} going out now,{" "}
                    {room.remaining.toLocaleString()} left to issue later.
                  </p>
                )}
              </div>
            </section>

            <CollapsibleSection
              open={termsOpen}
              onOpenChange={setTermsOpen}
              icon={<ShieldCheck className="h-4 w-4 text-primary" />}
              label="Licensing terms"
              hint="Optional"
            >
              <p className="text-muted-foreground">
                Tickets are assets, so they can be traded and collected. These terms travel with them.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Passing on</Label>
                  <Choice value={transferable} options={TRANSFERABLE} onChange={setTransferable} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>Resale royalty %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={royalty}
                    onChange={(e) => setRoyalty(e.target.value)}
                    className="h-11"
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <Label>License</Label>
                  <Choice value={licenseType} options={LICENSE_PRESETS} onChange={setLicenseType} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>AI and data mining</Label>
                  <Choice value={aiPolicy} options={AI_POLICIES} onChange={setAiPolicy} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label>Territory</Label>
                  <Choice value={territory} options={TERRITORIES} onChange={setTerritory} disabled={busy} />
                </div>
              </div>
            </CollapsibleSection>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-semibold uppercase tracking-wide text-muted-foreground">
                  Guest list
                </h2>
                <p className="text-muted-foreground">
                  {rows.length.toLocaleString()} {rows.length === 1 ? "guest" : "guests"}
                  {repeats > 0 ? ` · ${repeats} repeated` : ""}
                </p>
              </div>

              <Textarea
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder={"Paste a list, or type one address per line\nana@company.com\nbruno@company.com"}
                rows={6}
                className="font-mono"
                disabled={busy}
              />

              {rows.length > 0 ? (
                <ul className="divide-y divide-border">
                  {rows.map((row) => (
                    <li key={row.value} className="flex items-center justify-between gap-4 py-2.5">
                      <span className="truncate">{row.value}</span>
                      {row.valid ? (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <span className="shrink-0 text-destructive">not an email</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section className="space-y-4">
              <CollectionPicker
                serviceId={serviceId}
                owner={address}
                value={group}
                onChange={setGroup}
                disabled={busy}
              />
            </section>

            <section className="space-y-4 border-t border-border pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-semibold uppercase tracking-wide text-muted-foreground">
                  What this run costs
                </h2>
                <p className="text-xl font-bold tabular-nums">
                  {(estimate.total > 0 ? estimate.total : setupCost).toLocaleString()}
                  <span className="ml-1.5 font-medium text-muted-foreground">credits</span>
                </p>
              </div>

              {estimate.total > 0 ? (
                <ul className="space-y-1">
                  {estimate.lines.map((line) => (
                    <li key={line.label} className="flex justify-between gap-4 text-muted-foreground">
                      <span>{line.label}</span>
                      <span className="tabular-nums">{line.credits.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  Setting the ticket up costs {setupCost.toLocaleString()}. Each guest adds{" "}
                  {eachCost.toLocaleString()}.
                </p>
              )}

              {balance !== undefined ? (
                <p className="text-muted-foreground">
                  You have {balance.toLocaleString()}.{" "}
                  {missing > 0 ? (
                    <Link href="/account/credits" className="text-primary hover:underline">
                      Add {missing.toLocaleString()} more
                    </Link>
                  ) : (
                    "Enough for this run."
                  )}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button onClick={run} disabled={!ready || busy} size="lg" className="h-12">
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Working
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Issue {recipients.length > 0 ? recipients.length : ""}{" "}
                      {recipients.length === 1 ? "ticket" : "tickets"}
                    </>
                  )}
                </Button>
                {!account ? <span className="text-muted-foreground">Connect your wallet.</span> : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
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
      <SelectTrigger className="h-12">
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
