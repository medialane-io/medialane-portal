import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import Content from "@/components/settings/pages/home-page";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your account, the devices that can sign for it, and how to recover it.",
  alternates: canonical("/settings"),
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return <Content />;
}
