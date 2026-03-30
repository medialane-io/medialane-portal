"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"
import { LogoMedialane } from "./logo-medialane"
import Link from "next/link"

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Connect", href: "/connect" },
]

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

const FloatingNav = () => {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
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
    </>
  )
}

export default FloatingNav
