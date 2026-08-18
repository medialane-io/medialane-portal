import type React from "react"
import "@/src/app/globals.css"
import { Inter, Urbanist } from "next/font/google"
import { Toaster } from "@/src/components/ui/toaster"
import { SonnerToaster } from "@/src/components/ui/sonner"
import FloatingNav from "@/src/components/floating-nav"
import Footer from "@/src/components/footer"
import FramerMotionProvider from "@/src/lib/framer-motion-provider"
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" })
const urbanist = Urbanist({ subsets: ["latin"], display: "swap", variable: "--font-display" })

import type { Metadata } from "next"

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://portal.medialane.io"),
  alternates: {
    canonical: './',
  },
  title: {
    default: "Medialane",
    template: "%s | Medialane",
  },
  description: "Tokenization for business. Turn what you own into digital assets you can license, sell, and track.",
  keywords: ["Tokenization", "IP", "Licensing", "Starknet", "API", "SDK"],
  authors: [{ name: "Medialane" }],
  creator: "Medialane",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Medialane",
    description: "Tokenization for business. Turn what you own into digital assets you can license, sell, and track.",
    siteName: "Medialane",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Medialane",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medialane",
    description: "Tokenization for business. Turn what you own into digital assets you can license, sell, and track.",
    images: ["/og-image.jpg"],
    creator: "@medialane_io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <Providers>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.className} ${urbanist.variable} bg-background text-foreground`}>
            <FramerMotionProvider>
              <div className="relative min-h-screen flex flex-col">
                <FloatingNav />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster />
                <SonnerToaster />
              </div>
            </FramerMotionProvider>
          </body>
        </html>
      </Providers>
  )
}
