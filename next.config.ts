import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },

    images: {
        // This forces all <Image> components to behave like standard <img> tags
        // and bypasses Vercel's Image Optimization server entirely.
        unoptimized: true,

        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
                port: '',
                pathname: '/t/p/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'i.pinimg.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'jyjynjpznlvezjhnuwhi.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default nextConfig;