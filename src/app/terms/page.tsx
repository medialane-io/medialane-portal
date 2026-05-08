import { Badge } from "@/src/components/ui/badge"

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-white mt-10 mb-3">{children}</h2>
}

import React from "react"

export default function TermsPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">
        <section className="container mx-auto px-4 pt-28 pb-24 max-w-3xl">
          <div className="mb-8 space-y-3">
            <h1 className="text-4xl font-extrabold text-white">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 8, 2026</p>
          </div>

          <div className="prose-dark space-y-2 text-muted-foreground leading-relaxed">
            <H2>1. Acceptance of Terms</H2>
            <p>
              By accessing or using the Medialane platform, API, or any related services (&quot;Services&quot;), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our Services.
            </p>

            <H2>2. Description of Service</H2>
            <p>
              Medialane provides a REST API and developer portal for accessing on-chain data from the Starknet blockchain, including IP asset listings, collections, token metadata, and related marketplace activities. The platform is designed for developers, creators, and autonomous AI agents.
            </p>

            <H2>3. API Usage & Rate Limits</H2>
            <p>
              Free plan accounts are limited to 50 API requests per calendar month, resetting on the 1st of each month. Premium accounts receive unlimited requests subject to a per-minute rate limit. You may not circumvent, disable, or otherwise interfere with these limits. Portal management endpoints (/v1/portal/*) are excluded from quota calculations.
            </p>

            <H2>4. Prohibited Uses</H2>
            <p>
              You may not use the Services to: (a) violate any applicable law or regulation; (b) infringe on the intellectual property rights of any third party; (c) transmit harmful or malicious content; (d) attempt to reverse engineer, decompile, or disassemble the platform; (e) use the API to build competing API products or resell API access without permission; (f) conduct automated attacks, scraping, or denial-of-service activities against Medialane infrastructure.
            </p>

            <H2>5. Intellectual Property</H2>
            <p>
              Medialane and its licensors own all rights, title, and interest in the Services. Your use of the Services does not grant you any ownership of platform code, documentation, or branding. On-chain data returned by the API reflects publicly available blockchain state; Medialane makes no claims of ownership over that data.
            </p>

            <H2>6. Disclaimer of Warranties</H2>
            <p>
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. MEDIALANE DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
            </p>

            <H2>7. Limitation of Liability</H2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, MEDIALANE AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>

            <H2>8. Governing Law</H2>
            <p>
              These Terms shall be governed by the laws of the applicable jurisdiction without regard to conflict-of-law principles. Any disputes shall be resolved through binding arbitration unless otherwise required by law.
            </p>

            <H2>9. Changes to Terms</H2>
            <p>
              We may modify these Terms at any time. Continued use of the Services after changes are posted constitutes acceptance of the revised Terms. We will make reasonable efforts to notify users of material changes.
            </p>

            <H2>10. Contact</H2>
            <p>
              For questions about these Terms, contact us at{" "}
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
