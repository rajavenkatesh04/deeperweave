import LandingPageClient from '@/app/ui/landing/LandingPageClient';
import { getLandingPageData } from '@/lib/data/landing-data';

export const revalidate = 86400; // Daily revalidation

// Minimal fallback data to prevent build crashes if TMDB is unreachable
const FALLBACK_DATA = {
    heroPosters: [],
    heroItems: [
        { label: "Movies", bg: "" }, // Empty bg needs handling in client or provide a local static image path
    ],
    searchDemoItems: [],
    bentoItems: {
        anime: { title: 'Anime', href: '/discover', img: '' },
        movie: { title: 'Movies', href: '/discover', img: '' },
        kdrama: { title: 'K-Drama', href: '/discover', img: '' },
        tv: { title: 'TV Series', href: '/discover', img: '' },
    }
};

export default async function Home() {
    let data;

    try {
        // Attempt to fetch fresh data
        data = await getLandingPageData();
    } catch (error) {
        // Log error but don't crash the build
        console.error("⚠️ Failed to fetch landing page data during build. Using fallback data.", error);
        data = FALLBACK_DATA;
    }

    return (
        <main>
            <LandingPageClient
                heroPosters={data?.heroPosters ?? FALLBACK_DATA.heroPosters}
                heroItems={data?.heroItems ?? FALLBACK_DATA.heroItems}
                searchDemoItems={data?.searchDemoItems ?? FALLBACK_DATA.searchDemoItems}
                bentoItems={data?.bentoItems ?? FALLBACK_DATA.bentoItems}
            />
        </main>
    );
}