"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Wallet, LogOut, LayoutDashboard } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"
import { LogoMedialane } from "./logo-medialane"
import Link from "next/link"
import { useAccount, useDisconnect } from "@starknet-react/core"
import { WalletConnectModal } from "./wallet-connect-modal"

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Integrate", href: "/integrate" },
  { label: "Docs", href: "/docs" },
  { label: "Connect", href: "/connect" },
]

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

function WalletButton({ onOpenChange }: { onOpenChange: (v: boolean) => void }) {
  const { address, status } = useAccount()
  const { disconnect } = useDisconnect()
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false))
  }, [address])

  if (status === "connected" && address && authed) {
    return (
      <div className="flex items-center gap-1">
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="rounded-full text-white hover:bg-white/20 gap-2 hidden md:flex"
        >
          <Link href="/account">
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-mono text-xs">{address.slice(0, 6)}…{address.slice(-4)}</span>
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-white hover:bg-white/10 h-8 w-8 p-0"
          onClick={() => {
            disconnect()
            fetch("/api/auth/signout", { method: "POST" })
            setAuthed(false)
          }}
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

// Isolated to avoid wrapping entire nav in Suspense
function ConnectParamWatcher({ onDetected }: { onDetected: () => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get("connect") === "1") {
      onDetected()
    }
  }, [searchParams, onDetected])
  return null
}

const FloatingNav = () => {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <Suspense fallback={null}>
        <ConnectParamWatcher onDetected={() => setConnectOpen(true)} />
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
            "w-full mx-auto rounded-full glass-effect border border-white/10 transition-all duration-300",
            scrolled ? "shadow-lg bg-black/70" : "bg-black/50",
          )}
        >
          <div className="relative flex items-center justify-between h-12 md:h-14 px-1">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <LogoMedialane />
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex px-2 space-x-1">
                {NAV_LINKS.map((item) => {
                  const active = isNavActive(pathname, item.href)
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={active ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "rounded-full text-white hover:bg-white/20",
                        active ? "bg-primary/30 text-white" : "",
                      )}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  )
                })}
              </nav>
            )}

            {/* Right section */}
            <div className="flex items-center pr-3 md:pr-4 space-x-2">
              {!isMobile && <WalletButton onOpenChange={setConnectOpen} />}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Expanded Menu */}
          <AnimatePresence>
            {isMobile && isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-white/10"
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
                          "w-full justify-start rounded-lg text-white hover:bg-white/20",
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

      {/* Background overlay */}
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

      {/* Mobile connect modal */}
      {isMobile && (
        <WalletConnectModal open={connectOpen} onOpenChange={setConnectOpen} />
      )}
    </>
  )
}

export default FloatingNav
