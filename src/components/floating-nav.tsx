"use client"

import { useState, useEffect, Suspense, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Wallet, LogOut, LayoutDashboard } from "lucide-react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"
import { LogoMedialane } from "./logo-medialane"
import Link from "next/link"
import { useWallet } from "@/src/hooks/use-wallet"
import { WalletConnectModal } from "./wallet-connect-modal"
import { ThemeToggle } from "./theme-toggle"

const NAV_LINKS = [
  { label: "Platform", href: "/platform" },
  { label: "Services", href: "/services" },
  { label: "Developers", href: "/developers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Infrastructure", href: "/infrastructure" },
  { label: "Agents", href: "/agents" },
  { label: "Docs", href: "https://docs.medialane.io/docs" },
]

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

function WalletButton({ onOpenChange }: { onOpenChange: (v: boolean) => void }) {
  const { address, isConnected, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full text-foreground hover:bg-foreground/10 gap-2 hidden md:flex"
          onClick={() => router.push("/account")}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="font-mono text-xs">{address.slice(0, 6)}…{address.slice(-4)}</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 h-8 w-8 p-0"
          onClick={() => disconnect()}
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const handleOpen = () => {
    setOpen(true)
    onOpenChange(true)
  }

  return (
    <>
      <Button
        size="sm"
        className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 text-xs font-semibold px-4"
        onClick={handleOpen}
      >
        <Wallet className="w-3.5 h-3.5" />
        Connect
      </Button>
      <WalletConnectModal open={open} onOpenChange={(v) => { setOpen(v); onOpenChange(v) }} />
    </>
  )
}

function ConnectParamWatcher({
  onNeedConnect,
  onConnected,
}: {
  onNeedConnect: () => void
  onConnected: () => void
}) {
  const searchParams = useSearchParams()
  const { isConnected } = useWallet()
  const wantsConnect = searchParams.get("connect") === "1"
  const firedRef = useRef(false)
  useEffect(() => {
    if (!wantsConnect) return
    if (isConnected) {
      if (firedRef.current) return
      firedRef.current = true
      onConnected()
    } else {

      firedRef.current = false
      onNeedConnect()
    }
  }, [wantsConnect, isConnected, onNeedConnect, onConnected])
  return null
}

const FloatingNav = () => {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const router = useRouter()

  const handleConnected = useCallback(() => {
    router.push("/account")
  }, [router])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <Suspense fallback={null}>
        <ConnectParamWatcher
          onNeedConnect={() => setConnectOpen(true)}
          onConnected={handleConnected}
        />
      </Suspense>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "py-2" : "py-3",
          "px-4 md:px-6",
        )}
      >
        <div
          className={cn(
            "w-full mx-auto rounded-full backdrop-blur-md border border-border bg-background/80 transition-all duration-300",
            scrolled ? "shadow-lg bg-background/90" : "bg-background/70",
          )}
        >
          <div className="relative flex items-center justify-between h-12 md:h-14 px-1">

            <div className="flex-shrink-0 flex items-center">
              <LogoMedialane />
            </div>

            {!isMobile && (
              <nav className="hidden md:flex px-2 flex-wrap gap-1">
                {NAV_LINKS.map((item) => {
                  const active = isNavActive(pathname, item.href)
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={active ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "rounded-full text-foreground hover:bg-foreground/10",
                        active ? "bg-primary/30 text-foreground" : "",
                      )}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  )
                })}
              </nav>
            )}

            <div className="flex items-center pr-3 md:pr-4 space-x-2">
              {!isMobile && <ThemeToggle className="text-foreground hover:bg-foreground/10" />}
              {!isMobile && <WalletButton onOpenChange={setConnectOpen} />}
              {isMobile && <ThemeToggle className="text-foreground hover:bg-foreground/10" />}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-foreground hover:bg-foreground/10 h-8 w-8"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isMobile && isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="px-4 py-3 space-y-1">
                  {NAV_LINKS.map((item) => {
                    const active = isNavActive(pathname, item.href)
                    return (
                      <Button
                        key={item.href}
                        asChild
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start rounded-lg text-foreground hover:bg-foreground/10",
                          active ? "bg-primary/30" : "",
                        )}
                      >
                        <Link href={item.href} onClick={closeMenu}>{item.label}</Link>
                      </Button>
                    )
                  })}
                  <div className="pt-1">
                    <Button
                      className="w-full rounded-lg bg-primary hover:bg-primary/90 text-white gap-2 font-semibold"
                      onClick={() => { closeMenu(); setConnectOpen(true) }}
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {isMobile && (
        <WalletConnectModal open={connectOpen} onOpenChange={setConnectOpen} />
      )}
    </>
  )
}

export default FloatingNav
