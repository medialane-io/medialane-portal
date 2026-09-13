"use client";

import { useState } from "react";
import { typedData as starknetTypedData } from "starknet";
import { signWithPrivateKey } from "@medialane/sdk/starknet";
import { createOwnerKey, unlockOwnerKey } from "@/lib/wallet/passkey";
import { loadSealedOwner, saveSealedOwner, clearSealedOwner } from "@/lib/wallet/store";
import type { SealedOwner } from "@/lib/wallet/passkey";

interface LogEntry {
  label: string;
  data: unknown;
}

export default function WalletDeployDebugPage() {
  const [sealed, setSealed] = useState<SealedOwner | null>(() => loadSealedOwner());
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<{
    typedData: unknown;
    deployment: unknown;
    calls: unknown[];
  } | null>(null);
  const [signature, setSignature] = useState<string[] | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [busy, setBusy] = useState(false);

  const append = (label: string, data: unknown) => setLog((prev) => [...prev, { label, data }]);

  async function handleCreatePasskey() {
    setBusy(true);
    try {
      const created = await createOwnerKey();
      saveSealedOwner(created.sealed);
      setSealed(created.sealed);
      setPrivateKey(created.privateKeyHex);
      append("createOwnerKey()", created.sealed);
    } catch (err) {
      append("createOwnerKey() threw", err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlock() {
    if (!sealed) return;
    setBusy(true);
    try {
      const key = await unlockOwnerKey(sealed);
      setPrivateKey(key);
      append("unlockOwnerKey()", "unlocked (key not shown)");
    } catch (err) {
      append("unlockOwnerKey() threw", err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleBuild() {
    if (!sealed) return;
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/deploy-sponsored/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerPubkey: sealed.ownerPubKey, ownerAddress: sealed.address }),
      });
      const body = await res.json().catch(() => null);
      append(`POST /api/wallet/deploy-sponsored/build -> ${res.status}`, body);
      if (res.ok) setBuildResult(body);
    } catch (err) {
      append("build fetch threw", err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleSign() {
    if (!sealed || !privateKey || !buildResult) return;
    try {
      const msgHash = starknetTypedData.getMessageHash(buildResult.typedData as never, sealed.address);
      const sig = signWithPrivateKey(privateKey, msgHash);
      setSignature(sig);
      append("signWithPrivateKey()", { msgHash, signature: sig });
    } catch (err) {
      append("signing threw", err instanceof Error ? err.message : String(err));
    }
  }

  async function handleExecute() {
    if (!sealed || !buildResult || !signature) return;
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/deploy-sponsored/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerAddress: sealed.address,
          typedData: buildResult.typedData,
          signature,
          deployment: buildResult.deployment,
          calls: buildResult.calls,
        }),
      });
      const body = await res.json().catch(() => null);
      append(`POST /api/wallet/deploy-sponsored/execute -> ${res.status}`, body);
    } catch (err) {
      append("execute fetch threw", err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleClear() {
    clearSealedOwner();
    setSealed(null);
    setPrivateKey(null);
    setBuildResult(null);
    setSignature(null);
    append("clearSealedOwner()", "cleared");
  }

  const btn = "rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm font-medium disabled:opacity-40";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-sm">
      <h1 className="font-display text-xl font-bold">Wallet deploy diagnostics</h1>
      <p className="text-muted-foreground">
        Drives the exact sponsored-deploy calls the onboarding flow makes, one step at a time, with the raw
        response bodies shown below. Not linked from anywhere in the app.
      </p>

      <div className="rounded-lg border border-border/60 bg-card p-4 space-y-1">
        <p className="font-medium">Stored sealed owner</p>
        <pre className="whitespace-pre-wrap break-all text-xs text-muted-foreground">
          {sealed ? JSON.stringify(sealed, null, 2) : "none"}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={btn} disabled={busy} onClick={handleCreatePasskey}>1. Create passkey (new)</button>
        <button className={btn} disabled={busy || !sealed} onClick={handleUnlock}>1b. Unlock existing</button>
        <button className={btn} disabled={busy || !sealed} onClick={handleBuild}>2. Build deploy</button>
        <button className={btn} disabled={busy || !privateKey || !buildResult} onClick={handleSign}>3. Sign typed data</button>
        <button className={btn} disabled={busy || !buildResult || !signature} onClick={handleExecute}>4. Execute</button>
        <button className={btn} disabled={busy} onClick={handleClear}>Clear stored wallet</button>
      </div>

      <div className="space-y-3">
        {log.map((entry, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-card p-4 space-y-1">
            <p className="font-medium">{entry.label}</p>
            <pre className="whitespace-pre-wrap break-all text-xs text-muted-foreground">
              {typeof entry.data === "string" ? entry.data : JSON.stringify(entry.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
