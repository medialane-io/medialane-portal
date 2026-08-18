import type { Metadata } from "next"

const SITE_NAME = "Medialane"
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://portal.medialane.io"

export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string
  description: string
  path: string
  image?: string
}): Metadata {
  const url = path === "/" ? "/" : path
  const ogImage = image || "/og-image.jpg"

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} | ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
      creator: "@medialane_io",
    },
  }
}

export { SITE_NAME, BASE_URL }
