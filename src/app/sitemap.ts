import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.medialane.io'

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/platform',
        '/services',
        '/developers',
        '/pricing',
        '/enterprise',
        '/enterprise/tokenize',
        '/enterprise/ip',
        '/enterprise/tickets',
        '/enterprise/clubs',
        '/enterprise/editions',
        '/enterprise/sponsorship',
        '/enterprise/ai-data',
        '/infrastructure',
        '/agents',
    ]

    return routes.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }))
}
