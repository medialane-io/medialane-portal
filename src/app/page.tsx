import type { Metadata } from "next";
import { canonical, buildSocialMetadata } from "@/lib/seo";
import { HomePage } from "@/components/home";

const title = "Protect, tokenize and monetize intellectual property";
const description =
  "Every work gets a record of who made it, when, and what anyone, including AI systems, may do with it. Launch catalogs, tickets and certificates from the Launchpad, or build on one API.";

export const metadata: Metadata = {
  title: { absolute: "Medialane | Protect, tokenize and monetize intellectual property" },
  description,
  alternates: canonical("/"),
  ...buildSocialMetadata({ title, description, imageAlt: "Medialane" }),
};

export default function Page() {
  return <HomePage />;
}
