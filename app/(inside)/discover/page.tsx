import { Suspense } from 'react';
import {
    getTrendingAll,
    getPopularMovies,
    getPopularTv,
    getDiscoverAnime,
    getDiscoverKdramas
} from '@/lib/actions/cinematic-actions';
import TrendingHero from '@/app/ui/discover/TrendingHero';
import CinematicRow from '@/app/ui/discover/CinematicRow';
import LoadingSpinner from '@/app/ui/loading-spinner'; // Assuming this path

// This is the main server component for the page
export default async function DiscoverPage() {

    // Fetch all our data in parallel for maximum speed
    const [
        trendingItems,
        popularMovies,
        popularTv,
        popularAnime,
        popularKdramas
    ] = await Promise.all([
        getTrendingAll(),
        getPopularMovies(),
        getPopularTv(),
        getDiscoverAnime(),
        getDiscoverKdramas()
    ]);

    return (
        <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
            <Suspense fallback={
                <div className="flex h-screen w-full items-center justify-center">
                    <LoadingSpinner />
                </div>
            }>
                {/* The Hero component gets the first 5 trending items.
                  We pass the full list (which is 20) to the first row.
                */}
                <TrendingHero items={trendingItems.slice(0, 5)} />

                <div className="space-y-8 lg:space-y-12 py-8 lg:py-12">
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