import { Badge } from "@/src/components/ui/badge"
import React from "react"

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-white mt-10 mb-3">{children}</h2>
}

export default function PrivacyPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-24 max-w-3xl">
          <div className="mb-8 space-y-3">
            <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 px-4 py-1.5 text-sm">
              [PLACEHOLDER — replace with final legal copy before launch]
            </Badge>
            <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: March 1, 2026</p>
          </div>

          <div className="space-y-2 text-muted-foreground leading-relaxed">
            <H2>1. Information We Collect</H2>
            <p>
              When you use Medialane, we may collect: (a) account information — email address and authentication identifiers provided via Clerk; (b) API usage data — request timestamps, endpoints called, HTTP status codes, and IP addresses; (c) contact form submissions — name, email, subject, and message when you contact us via /connect; (d) technical data — browser type, device identifiers, and referrer URLs for analytics purposes.
            </p>
            <p className="mt-2">
              We do not collect private keys, wallet seed phrases, or any on-chain signing material. All wallet interactions happen client-side.
            </p>

            <H2>2. How We Use It</H2>
            <p>
              We use collected information to: (a) operate and improve the API platform; (b) enforce rate limits and quota; (c) respond to support inquiries; (d) send transactional notifications (key creation, quota warnings); (e) detect and prevent abuse. We do not sell your personal data to third parties.
            </p>

            <H2>3. Third-Party Services</H2>
            <p>We rely on the following third parties:</p>
            <ul className="mt-2 ml-4 space-y-1 list-disc list-outside">
              <li><strong className="text-white">Starknet</strong> — wallet-based authentication via Sign-In with Starknet (SIWS). No personal data is transmitted to a third party; identity is verified on-chain.</li>
              <li><strong className="text-white">Railway</strong> — infrastructure and database hosting. See <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">railway.app/legal/privacy</a>.</li>
              <li><strong className="text-white">Hostinger</strong> — email delivery (SMTP). See <a href="https://www.hostinger.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">hostinger.com/privacy-policy</a>.</li>
              <li><strong className="text-white">Pinata</strong> — IPFS pinning and metadata delivery.</li>
              <li><strong className="text-white">Vercel / Netlify</strong> — frontend hosting and edge delivery.</li>
            </ul>

            <H2>4. Data Retention</H2>
            <p>
              API request logs are retained for 30 days for usage dashboard and debugging purposes. Account data is retained for the duration of your account plus 30 days after deletion. Contact form messages may be retained indefinitely for support history.
            </p>

            <H2>5. Your Rights</H2>
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data. To exercise these rights, contact us at{" "}
              <a href="mailto:dao@medialane.org" className="text-primary hover:underline">dao@medialane.org</a>.
              We will respond within 30 days.
            </p>

            <H2>6. Cookies</H2>
            <p>
              We use session cookies required for authentication (<code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">auth-token</code> and <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">auth-refresh</code>). We do not use advertising cookies. Analytics are collected via server-side logs rather than client-side trackers where possible.
            </p>

            <H2>7. Contact</H2>
            <p>
              For privacy questions, contact{" "}
              <a href="mailto:dao@medialane.org" className="text-primary hover:underline">
                dao@medialane.org
              </a>{" "}
              or visit <a href="/connect" className="text-primary hover:underline">/connect</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
