import { getTrendingAll } from '@/lib/actions/cinematic-actions';
import LandingPageClient from '@/app/ui/landing/LandingPageClient';

// Revalidate this data every hour so the landing page stays fresh but fast
export const revalidate = 3600;

export default async function Home() {
    // Fetch real trending data for the hero background
    const trendingItems = await getTrendingAll();

    // We need a lot of posters for the infinite scroll effect, so we'll
    // just duplicate the list a few times to make sure we have enough.
    // We only need the poster paths.
    const posterPaths = trendingItems
        .filter(item => item.poster_path)
        .map(item => item.poster_path as string);

    return (
        <main>
            <LandingPageClient posters={posterPaths} />
        </main>
    );
}