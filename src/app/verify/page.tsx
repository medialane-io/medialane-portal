import type { Metadata } from "next";
import { canonical } from "@/lib/seo";
import VerifyEmailContent from "./verify-email-content";

const title = "Verify Your Email";
const description = "Confirm your email to unlock listing assets for sale and claiming a username.";

export const metadata: Metadata = {
  title,
  description,
  alternates: canonical("/verify"),
};

export default function VerifyPage() {
  return <VerifyEmailContent />;
}
