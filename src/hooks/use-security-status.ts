"use client";

import { useCallback, useEffect, useState } from "react";
import { getOwners } from "@/lib/wallet/devices";
import { getGuardians } from "@/lib/wallet/guardian";
import { loadRecoveryKeySaved, recoveryState, saveRecoveryKeySaved } from "@/lib/settings/recovery";

export function useSecurityStatus(address: string | null) {
  const [devices, setDevices] = useState<number | null>(null);
  const [guardians, setGuardians] = useState<number | null>(null);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    setKeySaved(loadRecoveryKeySaved(address));
    getOwners(address)
      .then((owners) => !cancelled && setDevices(owners.length))
      .catch(() => {});
    getGuardians(address)
      .then((list) => !cancelled && setGuardians(list.length))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [address]);

  const markKeySaved = useCallback(() => {
    if (!address) return;
    saveRecoveryKeySaved(address);
    setKeySaved(true);
  }, [address]);

  return { devices, guardians, keySaved, markKeySaved, recovery: recoveryState({ devices, guardians, keySaved }) };
}
