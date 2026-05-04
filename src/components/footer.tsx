import Link from "next/link"
import { Github, Twitter, Globe2, MessageCircle } from "lucide-react"
import { LogoMedialane } from "./logo-medialane"

const PLATFORM_LINKS = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
  { name: "API Reference", href: "/docs/api" },
  { name: "SDK", href: "/docs/sdk" },
]

const COMMUNITY_LINKS = [
  { name: "Connect", href: "/connect" },
  { name: "Changelog", href: "/changelog" },
  { name: "DAO", href: "https://medialane.org", external: true },
]

const LEGAL_LINKS = [
  { name: "Terms", href: "/terms" },
  { name: "Privacy", href: "/privacy" },
]

const SOCIALS = [
  { icon: Twitter, href: "https://x.com/medialane_xyz", label: "X / Twitter" },
  { icon: MessageCircle, href: "https://t.me/medialane", label: "Telegram" },
  { icon: Github, href: "https://github.com/medialane-io", label: "GitHub" },
  { icon: Globe2, href: "https://medialane.org", label: "DAO" },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <LogoMedialane />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Permissionless IP infrastructure on Starknet. One REST API for orders, metadata, collections, and activities.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Platform</h3>
            <ul className="space-y-2">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Community</h3>
            <ul className="space-y-2">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    {link.name}
                    {link.external && " ↗"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
                aria-label={s.label}
              >
                <s.icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Medialane. All rights reserved. · Powered by Starknet
          </p>
        </div>
      </div>
    </footer>
  )
}
