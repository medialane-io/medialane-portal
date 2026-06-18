"use client"

import { motion } from "framer-motion"
import { useMobile } from "@/src/hooks/use-mobile"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile()

  // Simpler transitions for mobile for better performance
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  )
}
