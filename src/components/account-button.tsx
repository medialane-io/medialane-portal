"use client"

import { Button } from "@/src/components/ui/button"
import Link from "next/link"

export function AccountButton() {
  return (
    <Button asChild className="glass-card rounded-full hover:scale-105 transition-transform" variant="secondary">
      <Link href="/account">Account</Link>
    </Button>
  )
}
