"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {

    if (typeof window !== "undefined") {

      setIsMobile(window.innerWidth < 768)

      const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
      }

      window.addEventListener("resize", handleResize)

      if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
        setIsMobile(true)
      }

      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}
