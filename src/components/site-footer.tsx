import Link from "next/link";
import { MedialaneLogoFull } from "@medialane/ui";

const LINKS = [
  { href: "/pricing", label: "Pricing", external: false },
  { href: "https://docs.medialane.io", label: "Docs", external: true },
  { href: "/terms", label: "Terms", external: false },
  { href: "/privacy", label: "Privacy", external: false },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <p className="text-xs">© {new Date().getFullYear()} Medialane DAO</p>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          {LINKS.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <MedialaneLogoFull />
      </div>
    </footer>
  );
}
