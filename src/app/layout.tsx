import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medialane",
  description: "Credits, API keys and the Launchpad for Medialane.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
