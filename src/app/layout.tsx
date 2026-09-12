import type { Metadata } from "next";
import { Providers } from "./providers";
import { canonical, defaultRobots } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Medialane",
    template: "%s | Medialane",
  },
  description: "Credits, API keys and the Launchpad for Medialane.",
  alternates: canonical("/"),
  robots: defaultRobots,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
