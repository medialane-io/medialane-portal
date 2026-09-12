"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Monitor, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOwners, describeDevices, canRemoveDevice, removeDevice, type DeviceEntry } from "@/lib/wallet/devices";
import { loadSealedOwner } from "@/lib/wallet/store";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { DeviceApprovalDialog } from "./device-approval-dialog";

const short = (v: string) => `${v.slice(0, 10)}…${v.slice(-6)}`;

export function DevicesSection({ walletAddress }: { walletAddress: string }) {
  const [devices, setDevices] = useState<DeviceEntry[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [busyGuid, setBusyGuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const sealed = loadSealedOwner();
    if (!sealed) return;
    getOwners(walletAddress)
      .then((owners) => setDevices(describeDevices(owners, sealed.ownerPubKey)))
      .catch(() => setDevices([]));
  }, [walletAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRemove = async (device: DeviceEntry) => {
    const sealed = loadSealedOwner();
    if (!sealed || !devices) return;

    const confirmed = window.confirm(
      "Remove this device? It will no longer be able to sign for your account. Adding it back needs a device you still have.",
    );
    if (!confirmed) return;

    setBusyGuid(device.guid);
    setError(null);
    try {
      await removeDevice(sealed, device.guid);
      refresh();
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setBusyGuid(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Your devices</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Each device signs for itself. Add one to use this account somewhere else.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {devices === null ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : devices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No devices found for this account.</p>
      ) : (
        <ul className="space-y-2">
          {devices.map((device) => (
            <li
              key={device.guid}
              className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground truncate">
                  {short(device.guid)}
                </span>
                {device.isThisDevice ? <Badge variant="secondary">This device</Badge> : null}
              </div>
              {device.isThisDevice ? null : (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!canRemoveDevice(devices, device.guid) || busyGuid !== null}
                  onClick={() => handleRemove(device)}
                >
                  {busyGuid === device.guid ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DeviceApprovalDialog open={addOpen} onOpenChange={setAddOpen} onApproved={refresh} />
    </div>
  );
}
