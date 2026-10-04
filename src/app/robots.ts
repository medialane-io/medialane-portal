import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/settings", "/link-device", "/recover", "/connect", "/wallet-onboarding", "/verify", "/account"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
