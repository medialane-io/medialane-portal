"use client"

import { useAccount } from "@starknet-react/core";
import { Button } from "@/src/components/ui/button"
import Link from "next/link"

export function AccountButton() {
  const { address } = useAccount();
  const label = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <Button asChild className="glass-card rounded-full hover:scale-105 transition-transform" variant="secondary">
      <Link href={address ? "/account" : "/sign-in"}>{label}</Link>
    </Button>
  )
}
