"use client";

import { useState } from "react";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePortalKeys } from "@/hooks/use-portal-account";
import { getMedialaneClient } from "@/lib/medialane-client";
import { friendlyErrorMessage } from "@/lib/friendly-error";

const SIGN_IN_AGAIN = "Sign in again to change your keys.";

export function ApiKeys() {
  const { data: keys, mutate } = usePortalKeys(true);
  const [plaintext, setPlaintext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/proxy/v1/portal/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appSource: "MEDIALANE_PORTAL" }),
      });
      if (res.status === 401) throw new Error(SIGN_IN_AGAIN);
      if (!res.ok) throw new Error("Could not create a key");
      const body = (await res.json()) as { data: { plaintext: string } };
      setPlaintext(body.data.plaintext);
      await mutate();
    } catch (err) {
      toast.error(friendlyErrorMessage(err, "Could not create a key"));
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/proxy/v1/portal/keys/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.status === 401) throw new Error(SIGN_IN_AGAIN);
      if (!res.ok) throw new Error("Could not revoke that key");
      await mutate();
    } catch (err) {
      toast.error(friendlyErrorMessage(err, "Could not revoke that key"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">API keys</h2>
          <p className="text-sm text-muted-foreground">
            A key spends the credits on this account. You can hold up to five at once.
          </p>
        </div>
        <Button onClick={create} disabled={busy} size="sm">
          New key
        </Button>
      </div>

      {plaintext ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
          <p className="text-sm font-medium">Copy this now. It is not shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg bg-background px-3 py-2 font-mono text-xs">
              {plaintext}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(plaintext);
                toast.success("Copied");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {keys && keys.length > 0 ? (
        <ul className="divide-y divide-border/40">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm">{key.prefix}…</p>
                <p className="text-xs text-muted-foreground">
                  {key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => revoke(key.id)}
                aria-label={`Revoke key ${key.prefix}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
          <KeyRound className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No keys yet.</p>
        </div>
      )}
    </section>
  );
}
