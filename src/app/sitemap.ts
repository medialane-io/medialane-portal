import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.medialane.io'

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/features',
        '/integrate',
        '/docs',
        '/docs/api',
        '/docs/sdk',
        '/docs/agents',
        '/connect',
        '/changelog',
        '/account',
    ]

    return routes.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }))
}
