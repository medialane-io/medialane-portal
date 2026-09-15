import { Suspense } from "react";
import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import { DataTokenizationTask } from "@/components/portal-launchpad/data-tokenization-task";

export const metadata: Metadata = {
  title: "Data Tokenization",
  description: "Establish verifiable ownership of your data, with licensing terms that hold up wherever it travels.",
  alternates: canonical("/launchpad/data-tokenization"),
};

export default function DataTokenizationPage() {
  return (
    <Suspense fallback={null}>
      <DataTokenizationTask />
    </Suspense>
  );
}
