"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { useRouter } from "next/navigation"

interface NotificationBarProps {
  interval?: number
}

const notifications = [
  {
    id: "1",
    title: "Creator Workshop",
    description: "Learn how to monetize your IP with our free workshop",
    cta: "Join Now",
    ctaLink: "/learn/workshops",
    type: "event",
  },
  {
    id: "2",
    title: "New Monetization Tools",
    description: "Try our enhanced programmable IP features",
    cta: "Explore",
    ctaLink: "/create/programmable",
    type: "platform",
  },
  {
    id: "3",
    title: "Featured Collection",
    description: "Digital Art Masters collection is trending with over 200 trades",
    cta: "View Collection",
    ctaLink: "/collections/digital-art-masters",
    type: "trend",
  },
]

export default function DynamicNotificationBar({ interval = 30000 }: NotificationBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const isMobile = useMobile()
  const router = useRouter()

  useEffect(() => {
    if (!visible) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % notifications.length)
    }, interval)

    return () => clearInterval(timer)
  }, [interval, visible])

  if (isMobile && window.innerWidth < 400) return null

  if (!visible) return null

  const currentNotification = notifications[currentIndex]

  const handleCtaClick = () => {
    router.push(currentNotification.ctaLink)
    setVisible(false)
  }

  return (
    <motion.div
      className="fixed bottom-20 left-0 right-0 z-30 flex justify-center px-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="glass-effect border border-white/10 rounded-lg shadow-lg p-3 md:p-4 max-w-md w-full flex items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNotification.id}
            className="flex items-center w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-full bg-primary/20 p-2 mr-3 flex-shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{currentNotification.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentNotification.description}</p>
            </div>

            <div className="flex items-center ml-2 space-x-2">
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hidden sm:flex" onClick={handleCtaClick}>
                {currentNotification.cta}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" onClick={() => setVisible(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
