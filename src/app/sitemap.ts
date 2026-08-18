import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.medialane.io'

const TOP_LEVEL_ROUTES = [
    '/platform',
    '/services',
    '/developers',
    '/pricing',
    '/enterprise',
    '/infrastructure',
    '/agents',
]

const ENTERPRISE_SUB_ROUTES = [
    '/enterprise/tokenize',
    '/enterprise/ip',
    '/enterprise/tickets',
    '/enterprise/clubs',
    '/enterprise/editions',
    '/enterprise/sponsorship',
    '/enterprise/ai-data',
]

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date()

    return [
        { url: BASE_URL, lastModified, changeFrequency: 'daily' as const, priority: 1 },
        ...TOP_LEVEL_ROUTES.map((route) => ({
            url: `${BASE_URL}${route}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
        ...ENTERPRISE_SUB_ROUTES.map((route) => ({
            url: `${BASE_URL}${route}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        })),
    ]
}
