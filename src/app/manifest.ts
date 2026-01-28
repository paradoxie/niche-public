import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'NicheStack Manager',
        short_name: 'NicheStack',
        description: 'Personal site portfolio lifecycle management system',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b', // zinc-950 (dark theme background)
        theme_color: '#09090b',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
