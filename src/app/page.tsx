import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { HomePage } from "@/components/home";

const title = "Medialane — Credits, API keys and the Launchpad";
const description =
  "Buy credits, hold an API key, and issue an asset to a list of people. Self-custody wallet, no seed phrase.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane" }),
};

export default function Page() {
  return <HomePage />;
}
