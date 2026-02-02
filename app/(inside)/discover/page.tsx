import { Suspense } from 'react';
import { getTrendingHero } from '@/lib/actions/discovery-actions'; // changed from cinematic-actions
import TrendingHero from '@/app/ui/discover/TrendingHero';
import LoadingSpinner from '@/app/ui/loading-spinner';
import DiscoverFeed from '@/app/ui/discover/DiscoverFeed'; // Import the new component
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Discover',
    description: 'Explore trending movies, popular TV series, Anime, and K-Dramas all in one place.',
};

export default async function DiscoverPage() {
    // ⚡️ 1. Fetch ONLY the Hero (Fastest response)
    const heroItems = await getTrendingHero();

    return (
        <main className="min-h-screen md:ml-14 bg-white dark:bg-black text-black dark:text-white">
            {/* Show Hero Immediately */}
            <TrendingHero items={heroItems} />

            {/* ⚡️ 2. Stream the rest. The user sees the Hero while this loads. */}
            <Suspense fallback={
                <div className="w-full h-96 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            }>
                <DiscoverFeed />
            </Suspense>
        </main>
    );
}