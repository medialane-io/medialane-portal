import type { Metadata } from "next";
import { Suspense } from "react";
import { canonical } from "@/lib/seo";
import { LinkDeviceContent } from "./link-device-content";

export const metadata: Metadata = {
  title: "Add this device",
  description: "Approve this device from one you already use, so it can sign for your account.",
  alternates: canonical("/link-device"),
  robots: { index: false, follow: false },
};

export default function LinkDevicePage() {
  return (
    <Suspense fallback={null}>
      <LinkDeviceContent />
    </Suspense>
  );
}
