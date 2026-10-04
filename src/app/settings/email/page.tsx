import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import Content from "@/components/settings/pages/email-page";

export const metadata: Metadata = {
  title: "Email",
  description: "Change or verify the email used to sign in to your account.",
  alternates: canonical("/settings/email"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Content />;
}
