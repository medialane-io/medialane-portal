import Link from "next/link"
import { Github, Twitter, Globe2, MessageCircle } from "lucide-react"
import { LogoMedialane } from "./logo-medialane"

const PLATFORM_LINKS = [
  { name: "Platform", href: "/platform" },
  { name: "Services", href: "/services" },
  { name: "Developers", href: "/developers" },
  { name: "Pricing", href: "/pricing" },
  { name: "Enterprise", href: "/enterprise" },
  { name: "Infrastructure", href: "/infrastructure" },
  { name: "Agents", href: "/agents" },
  { name: "Docs", href: "https://docs.medialane.io" },
  { name: "API Reference", href: "https://docs.medialane.io/dev/api" },
  { name: "SDK", href: "https://docs.medialane.io/dev/sdk" },
]

const COMMUNITY_LINKS = [
  { name: "DAO", href: "https://medialane.org" },
  { name: "Community Guidelines", href: "https://docs.medialane.io/guidelines/community" },
  { name: "Support", href: "https://docs.medialane.io/support" },
]

const LEGAL_LINKS = [
  { name: "Terms", href: "https://docs.medialane.io/terms" },
  { name: "Privacy", href: "https://docs.medialane.io/privacy" },
  { name: "Compliance", href: "https://docs.medialane.io/guidelines/compliance" },
]

const SOCIALS = [
  { icon: Twitter, href: "https://x.com/medialane_io", label: "X / Twitter" },
  { icon: MessageCircle, href: "https://t.me/medialane", label: "Telegram" },
  { icon: Github, href: "https://github.com/medialane-io", label: "GitHub" },
  { icon: Globe2, href: "https://medialane.org", label: "DAO" },
]

function FooterLink({ name, href }: { name: string; href: string }) {
  const external = href.startsWith("http")
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {name}
      {external && " ↗"}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          <div className="col-span-2 md:col-span-1 space-y-4">
            <LogoMedialane />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[26ch]">
              Protocol infrastructure for licensed intellectual property. Built for integrators
              and the businesses and AI agents they serve.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brand-blue">Platform</h3>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}><FooterLink {...link} /></li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brand-orange">Community</h3>
            <ul className="space-y-2.5">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.href}><FooterLink {...link} /></li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-brand-maeve">Legal</h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}><FooterLink {...link} /></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
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
