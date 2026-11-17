import Image from "next/image";
import Link from "next/link";
import { CONSUMER_APP_URL, DOCS_URL, PRIVACY_URL, TERMS_URL } from "@/lib/site";

const PORTAL_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/developers", label: "Developers" },
  { href: "/agents", label: "AI agents" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/pricing", label: "Pricing" },
];

const MORE_LINKS = [
  { href: "/platform", label: "How it works" },
  { href: "/account", label: "Account" },
  { href: "/contact", label: "Contact" },
  { href: DOCS_URL, label: "Documentation", external: true },
  { href: CONSUMER_APP_URL, label: "medialane.io", external: true },
  { href: "https://x.com/medialane_io", label: "X", external: true },
];

const LINK_CLASS = "block py-0.5 text-base font-medium text-[#f5f6fa]/80 transition-colors hover:text-white";

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {label}
    </a>
  ) : (
    <Link href={href} className={LINK_CLASS}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative isolate mt-auto overflow-hidden bg-[hsl(var(--brand-navy))] text-[#f5f6fa]">
      <div aria-hidden className="h-1 w-full bg-gradient-to-r from-[hsl(var(--brand-blue))] via-[hsl(var(--brand-purple))] via-50% to-[hsl(var(--brand-orange))]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_90%_at_12%_0%,hsl(var(--brand-purple)/0.24),transparent_70%),radial-gradient(55%_90%_at_90%_100%,hsl(var(--brand-blue)/0.26),transparent_70%),radial-gradient(35%_60%_at_55%_110%,hsl(var(--brand-rose)/0.14),transparent_70%)]"
      />
      <div className="mx-auto w-full max-w-screen-xl px-4 pt-24 sm:px-6 sm:pt-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr_1.15fr] lg:gap-20">
          <div className="space-y-6">
            <Link href="/" aria-label="Medialane" className="inline-block">
              <Image src="/medialane-light-logo.png" alt="Medialane" width={300} height={52} className="h-9 w-auto" />
            </Link>
            <p className="max-w-[28ch] text-lg leading-snug text-[#f5f6fa]/80">
              Platform for tokenization, Launchpad and marketplace of programmable intellectual property.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10">
            <nav aria-label="Portal" className="space-y-3.5">
              {PORTAL_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
            <nav aria-label="More" className="space-y-3.5">
              {MORE_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          <div className="space-y-6 rounded-3xl bg-white/[0.67] p-8 text-[hsl(var(--brand-navy))] sm:p-10">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold leading-tight">Start with Medialane</h2>
              <p className="text-base text-[hsl(var(--brand-navy))]/75">Launch a catalog from the Launchpad, or create an API key and build on the same services.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/launchpad"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open the Launchpad
              </Link>
              <Link
                href="/account"
                className="inline-flex items-center rounded-full border border-[hsl(var(--brand-navy))]/40 px-6 py-3 text-sm font-semibold transition-colors hover:bg-[hsl(var(--brand-navy))] hover:text-white"
              >
                Get an API key
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-white/15 pb-12 pt-8 text-sm text-[#f5f6fa]/65 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Medialane DAO</p>
          <div className="flex items-center gap-6">
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
