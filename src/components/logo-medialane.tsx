"use client"

import Link from 'next/link'
import Image from "next/image";
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useMobile } from "@/src/hooks/use-mobile"

export function LogoMedialane() {
  const isMobile = useMobile()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const src = !mounted || resolvedTheme === "dark"
    ? "/medialane-light-logo.png"
    : "/medialane-dark-logo.png"

  return (
    <div className="flex items-center space-x-2 ml-4">
      <Link href="/">
        <Image
          key={src}
          src={src}
          alt="Medialane"
          width={isMobile ? 144 : 172}
          height={isMobile ? 25 : 30}
        />
      </Link>
    </div>
  )
}
