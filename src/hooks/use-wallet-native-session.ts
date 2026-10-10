"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeWalletAddress } from "@medialane/sdk/starknet";
import { loadSealedOwner, onWalletChange } from "@/lib/wallet/store";
import { isDeployed as checkIsDeployed } from "@/lib/wallet/account-ops";
import { starknetVenueSigner } from "@/lib/wallet/venue-signer";
import { useSession } from "@/hooks/use-session";
import type { SealedOwner } from "@/lib/wallet/passkey";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";

export interface WalletNativeSession {
  address: string | null;
  hasWallet: boolean;
  isDeployed: boolean | null;
  signer: StarknetVenueSigner | null;
}

export function sessionOwner(sealed: SealedOwner | null, sessionWallet: string | null | undefined): SealedOwner | null {
  if (!sealed || !sessionWallet) return null;
  return normalizeWalletAddress(sealed.address) === normalizeWalletAddress(sessionWallet) ? sealed : null;
}

export function useWalletNativeSession(): WalletNativeSession {
  const { session } = useSession();
  const [stored, setStored] = useState<SealedOwner | null>(() => loadSealedOwner());
  const [deployed, setDeployed] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setStored(loadSealedOwner());
    sync();
    return onWalletChange(sync);
  }, []);

  const sealed = sessionOwner(stored, session?.walletAddress);

  useEffect(() => {
    if (!sealed) {
      setDeployed(null);
      return;
    }
    checkIsDeployed(sealed.address).then(setDeployed).catch(() => setDeployed(false));
  }, [sealed]);

  const signer = useMemo(() => (sealed ? starknetVenueSigner(sealed) : null), [sealed]);

  return {
    address: sealed?.address ?? null,
    hasWallet: sealed !== null,
    isDeployed: deployed,
    signer,
  };
}
