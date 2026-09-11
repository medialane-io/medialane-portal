"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useAccount } from "@starknet-react/core";
import { ServiceFormShell, CollapsibleSection } from "@medialane/ui";
import { buildAssetMetadata } from "@medialane/sdk";
import { ArrowLeft, Loader2, ShieldCheck, Ticket, Upload, Users } from "lucide-react";
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
import { TicketPreview } from "@/src/components/portal/ticket-preview";
import { portalFetcher } from "@/src/lib/portal/fetcher";
import { ticketIdFromReceipt } from "@/src/lib/ticket-events";
import { parseRecipients, invalidRecipients, PROVISIONING_SECRET_MESSAGE } from "@/src/lib/provisioning";
import { provisionOne, uploadImage, pinMetadata, buildTicketType, fetchMintCalls } from "@/src/lib/issue";
import { issuedSummary, OUT_OF_CREDITS, type TaskPhase } from "@/src/lib/task-progress";
import { estimateIssuance, shortfall, type PricingTable } from "@/src/lib/issuance-cost";
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
        setProgress(`Preparing guest ${i + 1} of ${recipients.length}`);
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
      if (!made) throw new Error("Make at least as many tickets as there are guests.");

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
      const tx = await account.execute(built.calls);
      const receipt = await account.waitForTransaction(tx.transaction_hash);
      const ticketId = ticketIdFromReceipt(
        (receipt as { events?: { from_address?: string; keys?: string[] }[] }).events,
        group,
      );
      if (!ticketId) throw new Error("The ticket was made but its id could not be read.");

      setProgress("Preparing to hand them out");
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
        const sent = await account.execute(batch);
        await account.waitForTransaction(sent.transaction_hash);
      }

      setIssued(recipients.length);
      setGuests("");
      setPhase("success");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === OUT_OF_CREDITS) setOutOfCredits(true);
      else setError(message || "Could not finish handing out tickets.");
      setPhase("error");
    } finally {
      setProgress(null);
    }
  }

  return (
    <>
      <TaskDialog
        open={phase !== "idle"}
        title="Handing out tickets"
        phase={phase}
        detail={progress}
        error={error}
        outOfCredits={outOfCredits}
        successLine={issued !== null ? issuedSummary(issued) : undefined}
        onClose={() => setPhase("idle")}
      />

      <ServiceFormShell
        icon={<Ticket className="h-4 w-4 text-white" />}
        title="IP Tickets"
        subtitle="Make a ticket and hand it to everyone on your list. Each one is theirs to keep, redeem or pass on."
        backSlot={
          <Link
            href="/launchpad"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Launchpad
          </Link>
        }
        aside={
          <TicketPreview
            artwork={artworkPreview}
            name={name}
            group={null}
            validFrom={validFrom}
            validUntil={validUntil}
            supply={supply || String(recipients.length || "")}
          />
        }
      >
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">The ticket</h2>

            <div className="space-y-2">
              <Label>Artwork</Label>
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50"
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
                  <img src={artworkPreview} alt="" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Click to upload (JPG, PNG, GIF, SVG, WebP · max 10 MB)
                    </span>
                  </>
                )}
              </label>
              {artworkError ? <p className="text-destructive">{artworkError}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="General admission"
                className="h-12"
                disabled={busy}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What it admits you to, when and where, and anything a holder should know…"
                rows={3}
                disabled={busy}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">When and how many</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valid from</Label>
                <Input
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="h-12"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label>Valid until</Label>
                <Input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-12"
                  disabled={busy}
                />
                {windowError ? <p className="text-destructive">{windowError}</p> : null}
              </div>
            </div>
            <p className="text-muted-foreground">Leave both empty and it is valid whenever.</p>

            <div className="space-y-2">
              <Label>How many to make</Label>
              <Input
                type="number"
                min={recipients.length || 1}
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                placeholder={recipients.length ? String(recipients.length) : "100"}
                className="h-12"
                disabled={busy}
              />
              <p className="text-muted-foreground">
                Leave empty to make exactly as many as there are guests. More leaves room to hand
                out the same ticket again later.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Who gets one</h2>
              <p className="text-muted-foreground">One email per line.</p>
            </div>

            <Textarea
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder={"one@example.com\ntwo@example.com"}
              rows={8}
              className="font-mono"
              disabled={busy}
            />

            {invalid.length > 0 ? (
              <p className="text-destructive">Check these: {invalid.map((r) => r.value).join(", ")}</p>
            ) : recipients.length > 0 ? (
              <p className="text-muted-foreground">
                {recipients.length} {recipients.length === 1 ? "guest" : "guests"}
              </p>
            ) : null}
          </section>

          <CollectionPicker
            serviceId={serviceId}
            owner={address}
            value={group}
            onChange={setGroup}
            disabled={busy}
          />

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
                  className="h-12"
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

          {estimate.total > 0 ? (
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium">This run costs</p>
                <p className="text-xl font-bold tabular-nums">
                  {estimate.total.toLocaleString()}
                  <span className="ml-1.5 font-medium text-muted-foreground">credits</span>
                </p>
              </div>
              <ul className="space-y-1">
                {estimate.lines.map((line) => (
                  <li key={line.label} className="flex justify-between gap-4 text-muted-foreground">
                    <span>{line.label}</span>
                    <span className="tabular-nums">{line.credits.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              {missing > 0 ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
                  <p>You need {missing.toLocaleString()} more before this will go through.</p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/account/credits">Add credits</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button onClick={run} disabled={!ready || busy} size="lg" className="h-12">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Hand out {recipients.length > 0 ? recipients.length : ""}{" "}
                  {recipients.length === 1 ? "ticket" : "tickets"}
                </>
              )}
            </Button>
            {!account ? <span className="text-muted-foreground">Connect your wallet.</span> : null}
          </div>
        </div>
      </ServiceFormShell>
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
