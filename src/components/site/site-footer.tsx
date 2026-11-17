import type { LucideIcon } from "lucide-react";
import { Bot, Coins, Layers, Network, Rocket, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CONSUMER_APP_URL, DOCS_URL, PRIVACY_URL, TERMS_URL } from "@/lib/site";

const BLUE = "hsl(var(--brand-blue))";
const PURPLE = "hsl(var(--brand-purple))";
const ROSE = "hsl(var(--brand-rose))";
const ORANGE = "hsl(var(--brand-orange))";

const TILES: { href: string; label: string; icon: LucideIcon; color: string }[] = [
  { href: "/services", label: "Services", icon: Layers, color: BLUE },
  { href: "/launchpad", label: "Launchpad", icon: Rocket, color: PURPLE },
  { href: "/developers", label: "Developers", icon: Terminal, color: ROSE },
  { href: "/agents", label: "AI agents", icon: Bot, color: ORANGE },
  { href: "/infrastructure", label: "Infrastructure", icon: Network, color: PURPLE },
  { href: "/pricing", label: "Pricing", icon: Coins, color: BLUE },
];

const MORE_LINKS = [
  { href: "/platform", label: "How it works" },
  { href: "/account", label: "Account" },
  { href: "/contact", label: "Contact" },
  { href: DOCS_URL, label: "Documentation", external: true },
  { href: CONSUMER_APP_URL, label: "medialane.io", external: true },
  { href: "https://x.com/medialane_io", label: "X", external: true },
];

const MORE_CLASS = "text-sm font-medium text-[#f5f6fa]/70 transition-colors hover:text-white";

export function SiteFooter() {
  return (
    <footer className="relative isolate mt-auto overflow-hidden bg-[hsl(var(--brand-navy))] text-[#f5f6fa]">
      <div aria-hidden className="h-1 w-full bg-gradient-to-r from-[hsl(var(--brand-blue))] via-[hsl(var(--brand-purple))] via-35% via-[hsl(var(--brand-rose))] to-[hsl(var(--brand-orange))]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-float absolute -left-24 top-10 h-96 w-96 rounded-full bg-[hsl(var(--brand-blue))] opacity-30 blur-[120px]" />
        <div className="animate-float absolute left-1/3 top-1/2 h-80 w-80 rounded-full bg-[hsl(var(--brand-purple))] opacity-30 blur-[120px] [animation-delay:1.5s]" />
        <div className="animate-float absolute -right-24 top-20 h-96 w-96 rounded-full bg-[hsl(var(--brand-rose))] opacity-25 blur-[130px] [animation-delay:3s]" />
        <div className="animate-float absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[hsl(var(--brand-orange))] opacity-20 blur-[120px] [animation-delay:4.5s]" />
      </div>

      <div className="mx-auto w-full max-w-screen-xl space-y-20 px-4 pt-20 sm:px-6 sm:pt-24">
        <div className="rounded-3xl bg-gradient-to-r from-[hsl(var(--brand-orange))] via-[hsl(var(--brand-rose))] to-[hsl(var(--brand-purple))] p-px">
          <div className="flex flex-col items-start justify-between gap-8 rounded-[calc(1.5rem-1px)] bg-[hsl(var(--brand-navy))]/90 p-8 backdrop-blur-xl sm:p-12 lg:flex-row lg:items-center">
            <div className="max-w-xl space-y-3">
              <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Start with Medialane</h2>
              <p className="text-base text-[#f5f6fa]/75 sm:text-lg">Launch a catalog from the Launchpad, or create an API key and build on the same services.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/launchpad"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-rose))] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Open the Launchpad
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get an API key
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="space-y-6">
            <Link href="/" aria-label="Medialane" className="inline-block">
              <Image src="/medialane-light-logo.png" alt="Medialane" width={300} height={52} className="h-9 w-auto" />
            </Link>
            <p className="max-w-[28ch] text-lg leading-snug text-[#f5f6fa]/80">
              Platform for tokenization, Launchpad and marketplace of programmable intellectual property.
            </p>
          </div>

          <nav aria-label="Portal" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TILES.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3.5 transition-colors hover:bg-white/[0.12]"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)`, color }}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/15 pb-12 pt-8 lg:flex-row lg:items-center">
          <nav aria-label="More" className="flex flex-wrap gap-x-7 gap-y-3">
            {MORE_LINKS.map((link) =>
              link.external ? (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={MORE_CLASS}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className={MORE_CLASS}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#f5f6fa]/60">
            <p>© {new Date().getFullYear()} Medialane DAO</p>
            <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
              Terms
            </a>
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
