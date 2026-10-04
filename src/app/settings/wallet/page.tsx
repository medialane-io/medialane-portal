import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import Content from "@/components/settings/pages/wallet-page";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Your wallet's address and deployment status.",
  alternates: canonical("/settings/wallet"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Content />;
}
