"use client"

import Link from 'next/link'
import Image from "next/image";
import { useMobile } from "@/src/hooks/use-mobile"

export function LogoMedialane() {
  const isMobile = useMobile()
  return (
    <div className="flex items-center space-x-2 ml-4">

      <Link href="/">
        {!isMobile && (
          <Image
            src="/medialane-light-logo.png"
            alt="Medialane"
            width={172}
            height={30}
          />
        )}
        {isMobile && (
          <Image
            src="/medialane-light-logo.png"
            alt="Medialane"
            width={144}
            height={25}
          />
        )}
      </Link>
    </div>
  )
}