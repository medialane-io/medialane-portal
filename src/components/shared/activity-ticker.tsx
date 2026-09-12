"use client";

import { ActivityTicker as UiActivityTicker } from "@medialane/ui";
import { useOrders } from "@/hooks/use-orders";
import { assetHref } from "@/lib/routes";

interface ActivityTickerProps {

  minItems?: number;

  limit?: number;

  className?: string;
}

export function ActivityTicker({ minItems = 3, limit = 12, className }: ActivityTickerProps) {
  const { orders } = useOrders({ status: "ACTIVE", sort: "recent", limit });
  return (
    <UiActivityTicker
      orders={orders}
      minItems={minItems}
      className={className}
      getHref={(o) => assetHref("STARKNET", o.nftContract, o.nftTokenId)}
    />
  );
}
