import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { HomePage } from "@/components/home";

const title = "Protect, license and monetize your IP onchain";
const description =
  "Proof of authorship and license terms, including an AI policy, for the work you own. Issue to a list of people from the Launchpad, or build it into your product with one API.";

export const metadata: Metadata = {
  title: { absolute: "Medialane | Protect, license and monetize your IP onchain" },
  description,
  alternates: canonical("/"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane" }),
};

export default function Page() {
  return <HomePage />;
}
