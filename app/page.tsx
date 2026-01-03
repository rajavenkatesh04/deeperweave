import LandingPageClient from '@/app/ui/landing/LandingPageClient';
import { getLandingPageData } from '@/lib/data/landing-data';

export const revalidate = 86400; // Daily revalidation

const FALLBACK_DATA = {
    heroPosters: [], // Ensure your client handles empty arrays gracefully or add static fallbacks here
    heroItems: [
        { label: "Movies", bg: "" },
    ],
    searchDemoItems: [
        { title: "Interstellar", year: "2014", type: "Movie", color: "bg-blue-100 text-blue-800", img: "/gEU2QniL6E8ahDaPCy6DKzVPdeS.jpg" },
        { title: "Breaking Bad", year: "2008", type: "TV Series", color: "bg-green-100 text-green-800", img: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg" }
    ],
    bentoItems: {
        anime: { title: 'Anime', href: '/discover', img: '/yiInZuFB0DiAYjT7WvY5D3V70P8.jpg', description: 'Explore Japanese animation.' },
        movie: { title: 'Movies', href: '/discover', img: '/8RPDwm67ht45Qce1v1D4qGDuK3l.jpg', description: 'Cinema from around the world.' },
        kdrama: { title: 'K-Drama', href: '/discover', img: '/5iV20x8K8j3bO8x7p6XyC5n8.jpg', description: 'Korean dramas and series.' },
        tv: { title: 'TV Series', href: '/discover', img: '/u3bZgnGQ9T01sWNhyho4nmw5.jpg', description: 'Episodic storytelling.' },
    }
};

export default async function Home() {
    let data;

    try {
        data = await getLandingPageData();
    } catch (error) {
        console.error("⚠️ Failed to fetch landing page data. Using fallback.", error);
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