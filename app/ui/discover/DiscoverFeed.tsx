import {
    getTrendingAll,
    getPopularMovies,
    getPopularTv,
    getDiscoverAnime,
    getDiscoverKdramas,
    getRegionalDiscoverSections
} from '@/lib/actions/discovery-actions';
import CinematicRow from '@/app/ui/discover/CinematicRow';

export default async function DiscoverFeed() {
    // We can fetch these in parallel here, or even better,
    // let each Row component fetch its own data for true independent streaming.
    // For now, parallel fetching here is a good middle ground.

    const [
        regionalSections,
        trendingItems,
        popularMovies,
        popularTv,
        popularAnime,
        popularKdramas
    ] = await Promise.all([
        getRegionalDiscoverSections(),
        getTrendingAll(),
        getPopularMovies(),
        getPopularTv(),
        getDiscoverAnime(),
        getDiscoverKdramas()
    ]);

    return (
        <div className="space-y-8 lg:space-y-12 py-8 lg:py-12 animate-in fade-in duration-700">
            {regionalSections.map((section) => (
                <CinematicRow key={section.title} title={section.title} items={section.items} href={section.href} />
            ))}
            <CinematicRow title="Trending This Week" items={trendingItems} href="/discover/trending" />
            <CinematicRow title="Popular Movies" items={popularMovies} href="/discover/movies" />
            <CinematicRow title="Popular TV Shows" items={popularTv} href="/discover/tv" />
            <CinematicRow title="Popular Anime" items={popularAnime} href="/discover/anime" />
            <CinematicRow title="Top K-Dramas" items={popularKdramas} href="/discover/kdramas" />
        </div>
    );
}