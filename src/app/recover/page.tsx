"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createOwnerKey,
  sealImportedOwnerKey,
  walletAddressForPrivateKey,
  InvalidStarkPrivateKeyError,
  type SealedOwner,
} from "@/lib/wallet/passkey";
import { saveSealedOwner, loadSealedOwner } from "@/lib/wallet/store";
import { isValidStarknetAddress } from "@/lib/wallet/account-ops";
import {
  getEscape,
  getEscapeSecurityPeriod,
  triggerEscapeOwner,
  completeEscapeOwner,
  type EscapeInfo,
} from "@/lib/wallet/guardian";
import { describeRecoveryAction } from "@/lib/wallet/guardian-status";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { isOwnerOf } from "@/lib/wallet/devices";

type Mode = "choose" | "key" | "lost" | "guardian";

export default function RecoverPage() {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-32 pt-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Recover a wallet</h1>
      </div>

      {mode === "choose" && (
        <div className="flex flex-col gap-3">
          <Link
            href="/link-device"
            className="rounded-2xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.98]"
          >
            <p className="text-sm font-semibold">I still have another device</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Approve this one from a phone or browser you already use.
            </p>
          </Link>
          <button
            onClick={() => setMode("key")}
            className="rounded-2xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.98]"
          >
            <p className="text-sm font-semibold">I have my recovery key</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Restore your wallet on this device with the key you saved.
            </p>
          </button>
          <button
            onClick={() => setMode("lost")}
            className="rounded-2xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.98]"
          >
            <p className="text-sm font-semibold">I lost my wallet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate a new key on this device and share it with your guardian.
            </p>
          </button>
          <button
            onClick={() => setMode("guardian")}
            className="rounded-2xl border border-border bg-card p-4 text-left transition-transform active:scale-[0.98]"
          >
            <p className="text-sm font-semibold">I&apos;m someone&apos;s guardian</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Help recover a wallet you&apos;re registered as a guardian for.
            </p>
          </button>
        </div>
      )}

      {mode === "key" && <RecoveryKeyFlow onBack={() => setMode("choose")} />}
      {mode === "lost" && <LostWalletFlow onBack={() => setMode("choose")} />}
      {mode === "guardian" && <GuardianFlow onBack={() => setMode("choose")} />}
    </main>
  );
}

function RecoveryKeyFlow({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [keyInput, setKeyInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const preview = (() => {
    const trimmed = keyInput.trim();
    if (!trimmed) return null;
    try {
      return walletAddressForPrivateKey(trimmed);
    } catch {
      return null;
    }
  })();

  const restore = async () => {
    setBusy(true);
    setErr(null);
    try {
      const sealed = await sealImportedOwnerKey(keyInput);
      const owned = await isOwnerOf(sealed.address, sealed.ownerPubKey).catch(() => false);
      if (!owned) {
        setErr(
          "No Medialane account is controlled by that key. Check you copied the whole key, and that you exported it from the device you signed up on.",
        );
        setBusy(false);
        return;
      }
      saveSealedOwner(sealed);
      router.push("/portfolio");
    } catch (e) {
      if (e instanceof InvalidStarkPrivateKeyError) {
        setErr("That does not look like a recovery key. Check you copied all of it.");
      } else {
        setErr(friendlyErrorMessage(e, "Could not restore your wallet. Please try again."));
      }
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="self-start text-xs text-muted-foreground hover:text-foreground">
        ← Choose another way
      </button>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Paste the recovery key you saved from Settings. This device will ask for a new passkey and
        lock the key behind it.
      </p>
      <Input
        value={keyInput}
        onChange={(e) => setKeyInput(e.target.value)}
        placeholder="0x..."
        autoComplete="off"
        spellCheck={false}
        className="font-mono text-xs"
      />
      {preview && (
        <p className="text-xs text-muted-foreground">
          This key restores wallet{" "}
          <span className="font-mono text-foreground break-all">{preview}</span>
        </p>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button onClick={restore} disabled={busy || !preview}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Restore my wallet
      </Button>
    </div>
  );
}

function LostWalletFlow({ onBack }: { onBack: () => void }) {
  const [lostAddress, setLostAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [newPubkey, setNewPubkey] = useState<string | null>(null);
  const [copied, setCopied] = useState<"address" | "pubkey" | null>(null);

  const generate = async () => {
    if (!isValidStarknetAddress(lostAddress)) {
      setErr("Enter the wallet address you're trying to recover.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const { sealed } = await createOwnerKey();
      const forLostWallet: SealedOwner = { ...sealed, address: lostAddress.trim() };
      saveSealedOwner(forLostWallet);
      setNewPubkey(sealed.ownerPubKey);
    } catch (e) {
      setErr(friendlyErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string, which: "address" | "pubkey") => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  if (newPubkey) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-brand-orange/40 bg-brand-orange/10 p-3 text-xs leading-relaxed">
          A new key was generated and saved on this device. Send both values below to your
          guardian; they start the recovery from their device. This page cannot do that
          part for you.
        </div>
        <Field label="Wallet to recover" value={lostAddress.trim()} onCopy={() => copy(lostAddress.trim(), "address")} copied={copied === "address"} />
        <Field label="New owner public key" value={newPubkey} onCopy={() => copy(newPubkey, "pubkey")} copied={copied === "pubkey"} />
        <Link href="/" className="rounded-2xl border border-border py-3 text-center text-sm font-semibold transition-colors hover:bg-foreground/[0.04]">
          Go to your wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Enter the address of the wallet you lost access to. A new key will be generated and
        sealed on this device. Nothing happens onchain until your guardian starts the
        recovery with it.
      </p>
      <Input
        value={lostAddress}
        onChange={(e) => setLostAddress(e.target.value)}
        placeholder="0x… (the wallet you're recovering)"
        className="font-mono text-xs"
      />
      {err && <p className="text-xs text-destructive">{err}</p>}
      <Button onClick={generate} disabled={busy || !lostAddress.trim()} className="w-full">
        {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
        {busy ? "Creating passkey…" : "Generate a new key"}
      </Button>
      <button onClick={onBack} className="text-center text-xs text-muted-foreground">
        Back
      </button>
    </div>
  );
}

function GuardianFlow({ onBack }: { onBack: () => void }) {
  const sealed = loadSealedOwner();
  const [targetAddress, setTargetAddress] = useState("");
  const [newOwnerPubkey, setNewOwnerPubkey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [escape, setEscape] = useState<EscapeInfo | null>(null);
  const [periodDays, setPeriodDays] = useState<number | null>(null);

  const checkStatus = async () => {
    if (!isValidStarknetAddress(targetAddress)) {
      setErr("Enter the wallet address you're recovering.");
      return;
    }
    setErr(null);
    try {
      const [e, period] = await Promise.all([
        getEscape(targetAddress),
        getEscapeSecurityPeriod(targetAddress),
      ]);
      setEscape(e);
      setPeriodDays(Math.round(period / 86400));
    } catch (e) {
      setErr(friendlyErrorMessage(e));
    }
  };

  const start = async () => {
    if (!sealed) return;
    if (!isValidStarknetAddress(newOwnerPubkey)) {
      setErr("Enter the new owner public key the person shared with you.");
      return;
    }
    setBusy("Starting recovery…");
    setErr(null);
    try {
      await triggerEscapeOwner(sealed, targetAddress.trim(), newOwnerPubkey.trim());
      await checkStatus();
    } catch (e) {
      setErr(friendlyErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const complete = async () => {
    if (!sealed) return;
    setBusy("Completing recovery…");
    setErr(null);
    try {
      await completeEscapeOwner(sealed, targetAddress.trim());
      await checkStatus();
    } catch (e) {
      setErr(friendlyErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (!sealed) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          This device needs its own Media Wallet to act as a guardian. Set one up first.
        </p>
        <Link href="/" className="rounded-2xl border border-border py-3 text-center text-sm font-semibold transition-colors hover:bg-foreground/[0.04]">
          Go to your wallet
        </Link>
        <button onClick={onBack} className="text-center text-xs text-muted-foreground">Back</button>
      </div>
    );
  }

  const action = escape ? describeRecoveryAction(escape) : "none";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Enter the lost wallet&apos;s address and the new owner public key the person shared
        with you. This is signed by this device&apos;s key, as guardian of that wallet;
        no funds move as part of this step.
      </p>
      <Input
        value={targetAddress}
        onChange={(e) => { setTargetAddress(e.target.value); setEscape(null); }}
        placeholder="0x… (the wallet being recovered)"
        className="font-mono text-xs"
      />
      <Input
        value={newOwnerPubkey}
        onChange={(e) => setNewOwnerPubkey(e.target.value)}
        placeholder="0x… (the new owner public key)"
        className="font-mono text-xs"
      />
      {err && <p className="text-xs text-destructive">{err}</p>}

      {!escape && (
        <Button onClick={checkStatus} disabled={!targetAddress.trim()} variant="outline" className="w-full">
          Check status
        </Button>
      )}

      {escape && (
        <div className="rounded-2xl bg-foreground/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">
          {escape.escapeType === "None" && `No recovery in progress. This wallet's timelock is ${periodDays ?? 7} days.`}
          {escape.escapeType === "Owner" && escape.status === "NotReady" &&
            `Recovery in progress, ready on ${new Date(escape.readyAt * 1000).toLocaleString()}.`}
          {escape.escapeType === "Owner" && escape.status === "Ready" && "Recovery is ready to complete."}
          {escape.escapeType === "Owner" && escape.status === "Expired" &&
            "This recovery attempt expired. Start again."}
          {escape.escapeType === "Guardian" && "This wallet has a guardian change in progress, not an owner recovery."}
        </div>
      )}

      {(!escape || action === "start") && (
        <Button onClick={start} disabled={!!busy || !targetAddress.trim() || !newOwnerPubkey.trim()} className="w-full">
          {busy ?? "Start recovery"}
        </Button>
      )}
      {action === "complete" && (
        <Button onClick={complete} disabled={!!busy} className="w-full">
          {busy ?? "Complete recovery"}
        </Button>
      )}
      <button onClick={onBack} className="text-center text-xs text-muted-foreground">Back</button>
    </div>
  );
}

function Field({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-2xl bg-foreground/[0.03] p-3">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <button onClick={onCopy} className="mt-1 block w-full break-all text-left font-mono text-xs">
        {value}
      </button>
      <p className="mt-1 text-[10px] text-muted-foreground">{copied ? "Copied ✓" : "Tap to copy"}</p>
    </div>
  );
}
