// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
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
                pathname: '/storage/v1/object/public/profile_pics/**',
            },
        ],
    },
};

export default nextConfig;