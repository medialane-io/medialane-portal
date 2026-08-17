import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Medialane',
        short_name: 'Medialane',
        description: 'Tokenization for business. Turn what you own into digital assets you can license, sell, and track.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon.png',
                sizes: '32x32',
                type: 'image/png',
            },
        ],
    }
}
