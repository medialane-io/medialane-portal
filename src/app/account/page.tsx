import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import { AccountContent } from "./account-content";

export const metadata: Metadata = {
  title: "Account",
  description: "Your credits, your API keys, and what you have spent.",
  alternates: canonical("/account"),
};

export default function AccountPage() {
  return <AccountContent />;
}
