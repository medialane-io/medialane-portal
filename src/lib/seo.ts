import type { Metadata } from "next";

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://portal.medialane.io").replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL}${normalized}`;
}

export function canonical(path = "/"): Metadata["alternates"] {
  return { canonical: absoluteUrl(path) };
}

export const defaultRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

function socialImage(imageUrl?: string | null, alt = "Medialane") {
  const url = imageUrl || absoluteUrl("/og-image.jpg");
  return { url, width: 1200, height: 630, alt };
}

export function buildSocialMetadata(opts: {
  title: string;
  description: string;
  imageUrl?: string | null;
  imageAlt?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const ogTitle = `${opts.title} | Medialane`;
  const image = socialImage(opts.imageUrl, opts.imageAlt ?? opts.title);

  return {
    openGraph: {
      type: "website",
      title: ogTitle,
      description: opts.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: opts.description,
      images: [image.url],
    },
  };
}
