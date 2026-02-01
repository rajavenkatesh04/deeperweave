import { Suspense } from 'react';
import {
    getTrendingAll,
    getPopularMovies,
    getPopularTv,
    getDiscoverAnime,
    getDiscoverKdramas,
    getTrendingHero,
    getRegionalDiscoverSections // Imported new function
} from '@/lib/actions/cinematic-actions';
import TrendingHero from '@/app/ui/discover/TrendingHero';
import CinematicRow from '@/app/ui/discover/CinematicRow';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Discover',
    description: 'Explore trending movies, popular TV series, Anime, and K-Dramas all in one place.',
    keywords: ['trending movies', 'popular tv shows', 'anime discovery', 'k-drama tracker'],
};

// This is the main server component for the page
export default async function DiscoverPage() {

    // Fetch all our data in parallel for maximum speed
    const [
        heroItems,
        regionalSections, // New regional data
        trendingItems,
        popularMovies,
        popularTv,
        popularAnime,
        popularKdramas
    ] = await Promise.all([
        getTrendingHero(),
        getRegionalDiscoverSections(),
        getTrendingAll(),
        getPopularMovies(),
        getPopularTv(),
        getDiscoverAnime(),
        getDiscoverKdramas()
    ]);

    return (
        <main className="min-h-screen md:ml-14 bg-white dark:bg-black text-black dark:text-white ">
            <Suspense fallback={
                <div className="flex h-screen w-full items-center justify-center">
                    <LoadingSpinner />
                </div>
            }>
                {/* Hero Section */}
                <TrendingHero items={heroItems} />

                <div className="space-y-8 lg:space-y-12 py-8 lg:py-12">

                    {/* 1. Personalized / Regional Rows (Priority) */}
                    {regionalSections.map((section) => (
                        <CinematicRow
                            key={section.title}
                            title={section.title}
                            items={section.items}
                            href={section.href} // Passed from the action now
                        />
                    ))}

                    {/* 2. Standard Global Rows */}
                    <CinematicRow
                        title="Trending This Week"
                        items={trendingItems}
                        href="/discover/trending"
                    />

                    <CinematicRow
                        title="Popular Movies"
                        items={popularMovies}
                        href="/discover/movies"
                    />

                    <CinematicRow
                        title="Popular TV Shows"
                        items={popularTv}
                        href="/discover/tv"
                    />

                    <CinematicRow
                        title="Popular Anime"
                        items={popularAnime}
                        href="/discover/anime"
                    />

                    <CinematicRow
                        title="Top K-Dramas"
                        items={popularKdramas}
                        href="/discover/kdramas"
                    />
                </div>
            </Suspense>
        </main>
    );
}