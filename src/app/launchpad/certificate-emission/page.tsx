import { Suspense } from "react";
import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import { CertificateEmissionTask } from "@/components/launchpad/certificate-emission-task";

export const metadata: Metadata = {
  title: "Certificate Emission",
  description: "Create verifiable on-chain certificates and distribute them to a list of recipients in one run.",
  alternates: canonical("/launchpad/certificate-emission"),
};

export default function CertificateEmissionPage() {
  return (
    <Suspense fallback={null}>
      <CertificateEmissionTask />
    </Suspense>
  );
}
