import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import Content from "@/components/settings/pages/devices-page";

export const metadata: Metadata = {
  title: "Devices",
  description: "The devices that can sign for your account.",
  alternates: canonical("/settings/devices"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Content />;
}
