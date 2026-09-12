"use client";

import { useEffect, useMemo, useState } from "react";
import { loadSealedOwner, onWalletChange } from "@/lib/wallet/store";
import { isDeployed as checkIsDeployed } from "@/lib/wallet/account-ops";
import { starknetVenueSigner } from "@/lib/wallet/venue-signer";
import type { SealedOwner } from "@/lib/wallet/passkey";
import type { StarknetVenueSigner } from "@medialane/sdk/starknet";

export interface WalletNativeSession {
  address: string | null;
  hasWallet: boolean;
  isDeployed: boolean | null;
  signer: StarknetVenueSigner | null;
}

export function useWalletNativeSession(): WalletNativeSession {

  const [sealed, setSealed] = useState<SealedOwner | null>(() => loadSealedOwner());
  const [deployed, setDeployed] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => {
      const next = loadSealedOwner();
      setSealed(next);
      if (next) {
        checkIsDeployed(next.address).then(setDeployed).catch(() => setDeployed(false));
      } else {
        setDeployed(null);
      }
    };
    sync();
    return onWalletChange(sync);
  }, []);

  const signer = useMemo(() => (sealed ? starknetVenueSigner(sealed) : null), [sealed]);

  return {
    address: sealed?.address ?? null,
    hasWallet: sealed !== null,
    isDeployed: deployed,
    signer,
  };
}
