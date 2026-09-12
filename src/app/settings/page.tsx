import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your account, the devices that can sign for it, and how to recover it.",
  alternates: canonical("/settings"),
};

export default function SettingsPage() {
  return <SettingsContent />;
}
