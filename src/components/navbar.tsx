"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Home,
  Key,
  Play,
  Sparkles,
  User,
  Settings,
  LogOut,
  Zap,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useMobile } from "@/src/hooks/use-mobile"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const isMobile = useMobile()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Integrate", href: "/integrate", icon: Play },
    { name: "Mint Event", href: "/mint", icon: Sparkles },
    { name: "Account", href: "/account", icon: User },
  ]

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-background/80 backdrop-blur-sm"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                MediaLane
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative p-0 h-auto">
                    <Link href="/account">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </Link>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              {isMobile && (
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col h-full pt-16">
              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          size="lg"
                          className="w-full justify-start"
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    )
                  })}

                  <div className="py-2 border-t">
                    <div className="text-sm font-medium text-muted-foreground px-3 py-2">Account</div>
                    <Link href="/settings" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full justify-start">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t">
          <div className="grid grid-cols-4 gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col items-center space-y-1 h-auto py-2 w-full"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.name === "Mint Event" ? "Mint" : item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
      {isMobile && <div className="h-16" />}
    </>
  )
}
