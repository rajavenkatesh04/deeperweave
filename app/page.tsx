import LandingPageClient from '@/app/ui/landing/LandingPageClient';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Home',
    description: 'Track your favorite movies, read community blogs, and discover your next cinematic obsession.',
    openGraph: {
        title: 'DeeperWeave - Track, Discover, Write',
        description: 'The ultimate social platform for movie and TV lovers.',
        type: 'website',
    },
};

// Daily revalidation is technically not needed for static content,
// but good to keep if you add dynamic bits later.
export const revalidate = 86400;

export default function Home() {
    // We don't need to fetch heroPosters or bentoItems anymore
    // because the new design uses the FeatureCarousel with static Mockups.

    return (
        <main>
            <LandingPageClient />
        </main>
    );
}