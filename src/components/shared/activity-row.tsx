"use client";

import { ActivityRow as ActivityRowBase, type ActivityRowProps as BaseProps } from "@medialane/ui";
import { assetHref } from "@/lib/routes";
import { EXPLORER_URL } from "@/lib/constants";

type ActivityRowProps = Omit<BaseProps, "explorerUrl" | "getAssetHref" | "getActorHref">;

export function ActivityRow(props: ActivityRowProps) {
  return (
    <ActivityRowBase
      {...props}
      explorerUrl={EXPLORER_URL}
      getAssetHref={(contract, tokenId) => assetHref("STARKNET", contract, tokenId)}
      getActorHref={(address) => `/creator/${address}`}
    />
  );
}
