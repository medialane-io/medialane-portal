import type React from "react"
import "@/src/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/src/components/ui/toaster"
import FloatingNav from "@/src/components/floating-nav"
import Footer from "@/src/components/footer"
import FramerMotionProvider from "@/src/lib/framer-motion-provider"
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" })

import type { Metadata } from "next"
import { BackgroundGradients } from "../components/background-gradients"

export const viewport = {
  themeColor: 'black',
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
    default: "MediaLane",
    template: "%s | MediaLane",
  },
  description: "Programmable IP Tokenization and Monetization SDK",
  keywords: ["NFT", "Marketplace", "Starknet", "IP", "Services", "SDK", "API", "Tokenization", "Monetization"],
  authors: [{ name: "MediaLane" }],
  creator: "MediaLane",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "MediaLane",
    description: "Monetization hub for the integrity web. Programmable IP Tokenization and Monetization SDK",
    siteName: "MediaLane",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MediaLane",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaLane",
    description: "Monetization hub for the integrity web. Launch, share and monetize your creative works",
    images: ["/og-image.jpg"],
    creator: "@medialane_xyz",
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
    >
      <Providers>
        <html lang="en" className="dark">
          <body className={`${inter.className} bg-black`}>
            <BackgroundGradients />
            <FramerMotionProvider>
              <div className="relative min-h-screen flex flex-col">
                <FloatingNav />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster />
              </div>
            </FramerMotionProvider>
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  )
}
